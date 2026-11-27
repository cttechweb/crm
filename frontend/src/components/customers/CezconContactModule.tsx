'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  Plus,
  Search,
  Settings as SettingsIcon,
  ChevronDown,
  Info,
  Phone,
  MessageCircle,
  Upload,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  Building,
  Mail,
  Check,
  AlertCircle,
  Calendar,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { Modal } from '@/components/ui/Modal';

export interface CezconContact {
  id: string;
  salutation: 'Mr.' | 'Ms.' | 'Mrs.' | 'Dr.' | 'Eng.';
  name: string;
  designation: string;
  customerId?: string;
  customerName: string;
  ownerId?: string;
  ownerName: string;
  ownerAvatar?: string;
  mobile: string;
  whatsapp?: string;
  email: string;
  campaign?: string;
  department?: string;
  isPrimary?: boolean;
  status: 'Active' | 'Inactive';
  createdAt?: string;
  notes?: string;
  source?: string;
  sourceName?: string;
  telExt?: string;
  personalMobile?: string;
  businessMobile?: string;
  address?: string;
  nationality?: string;
  spokenLanguage?: string;
  comments?: string;
}

const STORAGE_KEY = 'crm_contacts_data';

export function CezconContactModule() {
  const { customers, users } = useEnterpriseCrm();

  const [contacts, setContacts] = useState<CezconContact[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'LIST' or 'DETAILS' (Full-page Cezcon Contact Details)
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAILS'>('LIST');
  const [detailContact, setDetailContact] = useState<CezconContact | null>(null);
  const [showBannerNotice, setShowBannerNotice] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState<'CONTACT' | 'CUSTOMER'>('CONTACT');
  const [activeActivityTab, setActiveActivityTab] = useState<'TASK' | 'NOTES' | 'FILES' | 'SALES_VISIT'>('TASK');

  // Filters
  const [selectedOwner, setSelectedOwner] = useState('All Owners');
  const [selectedCampaign, setSelectedCampaign] = useState('Select Campaign');
  const [selectedDesignation, setSelectedDesignation] = useState('Select Designation');
  const [selectedCustomer, setSelectedCustomer] = useState('Select Company');
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Action Menu Dropdown State
  const [openActionId, setOpenActionId] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Active Contact in Modal
  const [activeContact, setActiveContact] = useState<CezconContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<CezconContact | null>(null);

  // Multi-select for Assign Contact
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [assignTargetOwner, setAssignTargetOwner] = useState('');
  const [assignTargetCompany, setAssignTargetCompany] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form State
  const [formData, setFormData] = useState({
    salutation: 'Mr.' as CezconContact['salutation'],
    name: '',
    designation: '',
    customerName: '',
    ownerName: '',
    mobileCountry: '+971',
    mobileNumber: '',
    whatsappCountry: '+971',
    whatsappNumber: '',
    email: '',
    campaign: '',
    department: 'Sales & Commercial',
    isPrimary: false,
    status: 'Active' as CezconContact['status'],
    notes: '',
    source: '',
    sourceName: '',
    telExt: '',
    personalMobile: '',
    businessMobile: '',
    address: '',
    nationality: '',
    spokenLanguage: '',
    comments: '',
  });

  // Load Contacts with live Customers synchronization
  const loadContacts = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsedContacts: CezconContact[] = stored ? JSON.parse(stored) : [];

      // Read live customers
      let liveCustomers: any[] = [];
      try {
        const custRaw = localStorage.getItem('crm_customers_data');
        if (custRaw) liveCustomers = JSON.parse(custRaw);
      } catch (e) { }
      if (!Array.isArray(liveCustomers) || liveCustomers.length === 0) {
        liveCustomers = customers;
      }

      const contactMap = new Map<string, CezconContact>();

      // 1. Add existing saved contacts
      parsedContacts.forEach((c) => {
        if (c && (c.id || c.name)) {
          contactMap.set(c.id || `${c.name}_${c.customerName}`, c);
        }
      });

      // 2. Automatically sync contact persons from live Customers
      liveCustomers.forEach((cust, idx) => {
        const custName = (cust.customerName || cust.companyName || '').trim();
        const personName = (cust.contactPerson || '').trim();
        if (custName && personName) {
          const key = `cust_${cust.id || idx}_${personName.toLowerCase()}`;
          const existing = Array.from(contactMap.values()).find(
            (c) =>
              c.name.toLowerCase().includes(personName.toLowerCase()) ||
              c.customerName.toLowerCase() === custName.toLowerCase()
          );
          if (!existing) {
            const salutation = (cust.salutation as any) || 'Mr.';
            const fullPhone = cust.phone || cust.mobile || '+971 50 123 4567';
            contactMap.set(key, {
              id: `CNT-CUST-${cust.id || Date.now() + idx}`,
              salutation: salutation,
              name: personName.startsWith('Mr.') || personName.startsWith('Ms.') || personName.startsWith('Eng.') || personName.startsWith('Dr.')
                ? personName
                : `${salutation} ${personName}`,
              designation: cust.industryType || 'Account Stakeholder',
              customerId: cust.id,
              customerName: custName.toUpperCase(),
              ownerId: cust.ownerId,
              ownerName: cust.owner || 'Muhammed shemin',
              ownerAvatar: cust.ownerAvatar || '',
              mobile: fullPhone,
              whatsapp: cust.whatsapp || fullPhone,
              email: cust.email || `${personName.toLowerCase().replace(/\s+/g, '.')}@${custName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
              campaign: cust.campaign,
              department: cust.companyGroup || 'Commercial Engineering',
              isPrimary: true,
              status: cust.status === 'Inactive' ? 'Inactive' : 'Active',
              createdAt: cust.createdDate || cust.date || new Date().toISOString().split('T')[0],
            });
          }
        }
      });

      const merged = Array.from(contactMap.values());
      setContacts(merged);
    } catch (e) {
      console.error('Error loading contacts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
    window.addEventListener('crm_contacts_updated', loadContacts);
    window.addEventListener('crm_customers_updated', loadContacts);
    window.addEventListener('crm_data_updated', loadContacts);
    window.addEventListener('storage', loadContacts);
    return () => {
      window.removeEventListener('crm_contacts_updated', loadContacts);
      window.removeEventListener('crm_customers_updated', loadContacts);
      window.removeEventListener('crm_data_updated', loadContacts);
      window.removeEventListener('storage', loadContacts);
    };
  }, [customers]);

  // Save Contacts helper
  const persistContacts = (updated: CezconContact[]) => {
    setContacts(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_contacts_updated'));
      window.dispatchEvent(new Event('crm_data_updated'));
    } catch (e) {
      console.error('Error saving contacts:', e);
    }
  };

  // Dynamic lists from database
  const ownerOptions = useMemo(() => {
    const list = users.map((u) => u.name).filter(Boolean);
    return Array.from(new Set(['All Owners', ...list]));
  }, [users]);

  const customerOptions = useMemo(() => {
    const list = customers.map((c) => c.customerName || c.companyName || '').filter(Boolean);
    return Array.from(new Set(list));
  }, [customers]);

  const designationOptions = useMemo(() => {
    const list = contacts.map((c) => c.designation).filter(Boolean);
    const defaults = [
      'Managing Director',
      'Procurement Manager',
      'Project Manager',
      'MEP Engineer',
      'Facility Director',
      'Sales Executive',
      'General Manager',
      'Operations Head',
    ];
    return Array.from(new Set(['Select Designation', ...defaults, ...list]));
  }, [contacts]);

  const campaignOptions = useMemo(() => {
    const list = contacts.map((c) => c.campaign).filter(Boolean) as string[];
    const defaults = ['Summer Cooling Campaign', 'Direct Outreach', 'Cold Email', 'Referral Campaign', 'HVAC Maintenance 2026'];
    return Array.from(new Set(['Select Campaign', ...defaults, ...list]));
  }, [contacts]);

  // Filtered Contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      // Owner Filter
      if (selectedOwner !== 'All Owners' && c.ownerName.toLowerCase() !== selectedOwner.toLowerCase()) {
        return false;
      }
      // Campaign Filter
      if (selectedCampaign !== 'Select Campaign' && c.campaign?.toLowerCase() !== selectedCampaign.toLowerCase()) {
        return false;
      }
      // Designation Filter
      if (
        selectedDesignation !== 'Select Designation' &&
        c.designation.toLowerCase() !== selectedDesignation.toLowerCase()
      ) {
        return false;
      }
      // Customer Filter
      if (
        selectedCustomer !== 'Select Company' &&
        c.customerName.toLowerCase() !== selectedCustomer.toLowerCase()
      ) {
        return false;
      }
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.customerName.toLowerCase().includes(q) ||
          c.designation.toLowerCase().includes(q) ||
          c.mobile.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.ownerName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [contacts, selectedOwner, selectedCampaign, selectedDesignation, selectedCustomer, searchQuery]);

  // Pagination
  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredContacts.slice(start, start + rowsPerPage);
  }, [filteredContacts, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredContacts.length / rowsPerPage) || 1;

  // Handlers for Add Contact
  const handleOpenAddModal = () => {
    setFormData({
      salutation: 'Mr.',
      name: '',
      designation: '',
      customerName: customerOptions[0] || '',
      ownerName: users[0]?.name || 'Muhammed shemin',
      mobileCountry: '+971',
      mobileNumber: '',
      whatsappCountry: '+971',
      whatsappNumber: '',
      email: '',
      campaign: '',
      department: 'Sales & Commercial',
      isPrimary: false,
      status: 'Active',
      notes: '',
      source: '',
      sourceName: '',
      telExt: '',
      personalMobile: '',
      businessMobile: '',
      address: '',
      nationality: '',
      spokenLanguage: '',
      comments: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please enter the contact person name.');
      return;
    }
    if (!formData.customerName.trim()) {
      alert('Please enter or select a customer/company name.');
      return;
    }

    const matchedOwner = users.find((u) => u.name === formData.ownerName);
    const fullMobile = formData.mobileNumber.trim()
      ? `${formData.mobileCountry} ${formData.mobileNumber.trim()}`
      : '+971 50 123 4567';
    const fullWhatsapp = formData.whatsappNumber.trim()
      ? `${formData.whatsappCountry} ${formData.whatsappNumber.trim()}`
      : fullMobile;

    const newContact: CezconContact = {
      id: `CNT-${Date.now().toString().slice(-6)}`,
      salutation: formData.salutation,
      name: `${formData.salutation} ${formData.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Eng\.)\s*/i, '').trim()}`,
      designation: formData.designation.trim() || 'Representative',
      customerName: formData.customerName.trim().toUpperCase(),
      ownerName: formData.ownerName || 'Muhammed shemin',
      ownerId: matchedOwner?.id || 'usr_shemin_001',
      ownerAvatar: matchedOwner?.avatar || '',
      mobile: fullMobile,
      whatsapp: fullWhatsapp,
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@${formData.customerName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'company'}.com`,
      campaign: formData.campaign || undefined,
      department: formData.department,
      isPrimary: formData.isPrimary,
      status: formData.status,
      createdAt: new Date().toISOString().split('T')[0],
      notes: formData.notes,
    };

    const updated = [newContact, ...contacts];
    persistContacts(updated);

    // Auto-sync customer to crm_customers_data
    try {
      const custRaw = localStorage.getItem('crm_customers_data');
      let currentCusts: any[] = custRaw ? JSON.parse(custRaw) : [];
      if (!Array.isArray(currentCusts)) currentCusts = [];
      const exists = currentCusts.some(
        (c) => (c.customerName || c.companyName || '').trim().toLowerCase() === newContact.customerName.toLowerCase()
      );
      if (!exists) {
        currentCusts.unshift({
          id: `cust_${Date.now()}`,
          slNo: currentCusts.length + 1,
          customerName: newContact.customerName,
          companyName: newContact.customerName,
          contactPerson: newContact.name,
          salutation: newContact.salutation,
          phone: newContact.mobile,
          mobile: newContact.mobile,
          email: newContact.email,
          owner: newContact.ownerName,
          status: newContact.status,
          type: 'Customer',
          date: new Date().toISOString().split('T')[0],
          createdDate: new Date().toISOString().split('T')[0],
          companyGroup: newContact.department || 'Commercial Engineering',
          totalDeals: 0,
          totalSpend: 0,
          lastActivity: 'Recent',
        });
        localStorage.setItem('crm_customers_data', JSON.stringify(currentCusts));
        window.dispatchEvent(new Event('crm_customers_updated'));
      }
    } catch (err) {
      console.error('Error syncing customer from contact:', err);
    }

    setIsAddModalOpen(false);
    showToast(`Contact "${newContact.name}" added successfully!`);
  };

  // Open Details Full Page
  const handleOpenDetails = (contact: CezconContact) => {
    setDetailContact(contact);
    setViewMode('DETAILS');
    setShowBannerNotice(true);
    setActiveMainTab('CONTACT');
    setActiveActivityTab('TASK');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handlers for Edit Contact
  const handleOpenEditModal = (contact: CezconContact) => {
    setActiveContact(contact);
    const rawMobile = (contact.mobile || '').replace(/^\+\d+\s*/, '');
    const rawWhatsapp = (contact.whatsapp || contact.mobile || '').replace(/^\+\d+\s*/, '');
    const rawPersonal = (contact.personalMobile || contact.mobile || '').replace(/^\+\d+\s*/, '');
    const rawBusiness = (contact.businessMobile || contact.mobile || '').replace(/^\+\d+\s*/, '');

    setFormData({
      salutation: contact.salutation || 'Mr.',
      name: contact.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Eng\.)\s*/i, ''),
      designation: contact.designation || '',
      customerName: contact.customerName || '',
      ownerName: contact.ownerName || (users[0]?.name || 'MOHAMMED ISHAQ'),
      mobileCountry: '+971',
      mobileNumber: rawMobile,
      whatsappCountry: '+971',
      whatsappNumber: rawWhatsapp,
      email: contact.email || '',
      campaign: contact.campaign || '',
      department: contact.department || 'Sales & Commercial',
      isPrimary: !!contact.isPrimary,
      status: contact.status || 'Active',
      notes: contact.notes || '',
      source: contact.source || '',
      sourceName: contact.sourceName || '',
      telExt: contact.telExt || '',
      personalMobile: rawPersonal,
      businessMobile: rawBusiness,
      address: contact.address || '',
      nationality: contact.nationality || '',
      spokenLanguage: contact.spokenLanguage || '',
      comments: contact.comments || contact.notes || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEditContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact) return;

    const matchedOwner = users.find((u) => u.name === formData.ownerName);
    const primaryPhone = formData.personalMobile.trim() || formData.businessMobile.trim() || formData.mobileNumber.trim();
    const fullMobile = primaryPhone
      ? `+971 ${primaryPhone}`
      : activeContact.mobile;
    const fullWhatsapp = formData.whatsappNumber.trim()
      ? `${formData.whatsappCountry} ${formData.whatsappNumber.trim()}`
      : activeContact.whatsapp || fullMobile;

    const updated = contacts.map((c) => {
      if (c.id === activeContact.id) {
        const updatedContact: CezconContact = {
          ...c,
          salutation: formData.salutation,
          name: `${formData.salutation} ${formData.name.replace(/^(Mr\.|Ms\.|Mrs\.|Dr\.|Eng\.)\s*/i, '').trim()}`,
          designation: formData.designation.trim() || c.designation,
          customerName: formData.customerName.trim().toUpperCase(),
          ownerName: formData.ownerName || c.ownerName,
          ownerId: matchedOwner?.id || c.ownerId,
          ownerAvatar: matchedOwner?.avatar || c.ownerAvatar,
          mobile: fullMobile,
          whatsapp: fullWhatsapp,
          email: formData.email.trim() || c.email,
          campaign: formData.campaign || undefined,
          department: formData.department,
          isPrimary: formData.isPrimary,
          status: formData.status,
          notes: formData.comments || formData.notes,
          source: formData.source,
          sourceName: formData.sourceName,
          telExt: formData.telExt,
          personalMobile: formData.personalMobile ? `+971 ${formData.personalMobile}` : undefined,
          businessMobile: formData.businessMobile ? `+971 ${formData.businessMobile}` : undefined,
          address: formData.address,
          nationality: formData.nationality,
          spokenLanguage: formData.spokenLanguage,
          comments: formData.comments,
        };
        if (detailContact && detailContact.id === c.id) {
          setDetailContact(updatedContact);
        }
        return updatedContact;
      }
      return c;
    });

    persistContacts(updated);
    setIsEditModalOpen(false);
    setActiveContact(null);
    showToast('Contact updated successfully!');
  };

  // Handlers for Delete Contact
  const handleDeleteContact = () => {
    if (!contactToDelete) return;
    const updated = contacts.filter((c) => c.id !== contactToDelete.id);
    persistContacts(updated);
    setIsDeleteModalOpen(false);
    if (detailContact && detailContact.id === contactToDelete.id) {
      setViewMode('LIST');
      setDetailContact(null);
    }
    setContactToDelete(null);
    showToast('Contact deleted successfully!');
  };

  // Quick Assign Handler
  const handleSaveAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedContactIds.length === 0 && !activeContact) return;

    const targetIds = activeContact ? [activeContact.id] : selectedContactIds;
    const matchedOwner = users.find((u) => u.name === assignTargetOwner);

    const updated = contacts.map((c) => {
      if (targetIds.includes(c.id)) {
        const updatedObj: CezconContact = {
          ...c,
          ownerName: assignTargetOwner || c.ownerName,
          ownerId: matchedOwner?.id || c.ownerId,
          ownerAvatar: matchedOwner?.avatar || c.ownerAvatar,
          customerName: assignTargetCompany ? assignTargetCompany.toUpperCase() : c.customerName,
        };
        if (detailContact && detailContact.id === c.id) {
          setDetailContact(updatedObj);
        }
        return updatedObj;
      }
      return c;
    });

    persistContacts(updated);
    setIsAssignModalOpen(false);
    setActiveContact(null);
    setSelectedContactIds([]);
    showToast(`Assigned ${targetIds.length} contact(s) successfully!`);
  };

  return (
    <div className="w-full space-y-4 font-sans text-slate-800 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded shadow-lg flex items-center gap-2 text-xs animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW MODE 1: FULL-PAGE CONTACT DETAILS (IMAGE 1 SPEC) */}
      {viewMode === 'DETAILS' && detailContact ? (
        <div className="w-full space-y-4 font-sans text-slate-800 animate-in fade-in duration-150">
          {/* Top Banner Notice with Cezcon Red Close Button */}
          <div className="bg-[#EAEAEA] border border-[#D1D5DB] rounded-[3px] px-3.5 py-1.5 flex items-center justify-between text-slate-800 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 text-xs">📝</span>
              <span className="font-bold tracking-tight text-[11px] uppercase text-slate-800">
                CONTACT CREATED BY {detailContact.ownerName.toUpperCase()} ON {detailContact.createdAt ? `${detailContact.createdAt} 10:13:03 AM` : 'FRI 02-10-2026 10:13:03 AM'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setViewMode('LIST');
                setDetailContact(null);
              }}
              className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded-[3px] flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors shrink-0 shadow-2xs"
              title="Close and return to contact list"
            >
              ✖
            </button>
          </div>

          {/* Top Tabs: Contact / Customer */}
          <div className="flex border-b border-slate-200 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveMainTab('CONTACT')}
              className={`flex items-center gap-1.5 px-5 py-2 font-semibold border-t-2 transition-colors cursor-pointer ${activeMainTab === 'CONTACT'
                  ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200 -mb-px shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border-transparent'
                }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Contact</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveMainTab('CUSTOMER')}
              className={`flex items-center gap-1.5 px-5 py-2 font-semibold border-t-2 transition-colors cursor-pointer ${activeMainTab === 'CUSTOMER'
                  ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200 -mb-px shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 border-transparent'
                }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Customer</span>
            </button>
          </div>

          {activeMainTab === 'CONTACT' ? (
            <>
              {/* Contact Details Card */}
              <div className="bg-white border border-slate-200 rounded-[3px] shadow-sm overflow-hidden max-w-2xl">
                {/* Header Bar */}
                <div className="bg-[#F1F3F9] border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-600" />
                  <h2 className="text-xs font-bold text-slate-700">Contact Details</h2>
                </div>

                {/* Key-Value Details */}
                <div className="p-4 space-y-3.5 text-xs">
                  {/* Contact Owner */}
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-slate-600 font-medium">Contact Owner</span>
                    <div className="col-span-2 flex items-center gap-2.5">
                      {detailContact.ownerAvatar ? (
                        <img
                          src={detailContact.ownerAvatar}
                          alt={detailContact.ownerName}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-2xs"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-300">
                          {detailContact.ownerName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-slate-900 uppercase tracking-tight">{detailContact.ownerName}</span>
                    </div>
                  </div>

                  {/* Contact Name */}
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-slate-600 font-medium">Contact Name</span>
                    <div className="col-span-2">
                      <span className="font-bold text-slate-900 text-[13px]">{detailContact.name}</span>
                    </div>
                  </div>

                  {/* Campaign */}
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-slate-600 font-medium">Campaign</span>
                    <div className="col-span-2">
                      <span className="text-[#337AB7] font-semibold tracking-tight uppercase hover:underline cursor-pointer">
                        {detailContact.campaign || 'INBOUND E-MAIL - 2025'}
                      </span>
                    </div>
                  </div>

                  {/* Source */}
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-slate-600 font-medium">Source</span>
                    <div className="col-span-2">
                      <span className="text-slate-800 font-medium">{detailContact.department || 'Email Marketing'}</span>
                    </div>
                  </div>

                  {/* Business Mobile */}
                  <div className="grid grid-cols-3 items-center">
                    <span className="text-slate-600 font-medium flex items-center gap-1.5">
                      <span className="text-[#EA580C]">📳</span>
                      <span>Business Mobile</span>
                    </span>
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono text-[12px]">{detailContact.mobile}</span>
                      <a
                        href={`https://wa.me/${(detailContact.whatsapp || detailContact.mobile).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-4 h-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-2.5 h-2.5 fill-white" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-end gap-2 bg-[#FAFBFD]">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveContact(detailContact);
                      setAssignTargetOwner(detailContact.ownerName);
                      setAssignTargetCompany(detailContact.customerName);
                      setIsAssignModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1E3A5F] hover:bg-[#162A45] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Contact Assign</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(detailContact)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#337AB7] hover:bg-[#286090] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setContactToDelete(detailContact);
                      setIsDeleteModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#D9534F] hover:bg-[#C9302C] text-white text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Contact Activities Section */}
              <div className="space-y-2 max-w-4xl pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600" />
                  <h3 className="text-xs font-bold text-slate-800">Contact Activities</h3>
                </div>

                {/* Sub-tabs & Add Buttons */}
                <div className="border-b border-slate-200 flex items-center justify-between">
                  <div className="flex gap-1 text-xs -mb-px">
                    <button
                      type="button"
                      onClick={() => setActiveActivityTab('TASK')}
                      className={`px-4 py-1.5 font-semibold border-t-2 transition-colors cursor-pointer ${activeActivityTab === 'TASK'
                          ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent'
                        }`}
                    >
                      📋 Task
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveActivityTab('NOTES')}
                      className={`px-4 py-1.5 font-semibold border-t-2 transition-colors cursor-pointer ${activeActivityTab === 'NOTES'
                          ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent'
                        }`}
                    >
                      📝 Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveActivityTab('FILES')}
                      className={`px-4 py-1.5 font-semibold border-t-2 transition-colors cursor-pointer ${activeActivityTab === 'FILES'
                          ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent'
                        }`}
                    >
                      📁 Files
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveActivityTab('SALES_VISIT')}
                      className={`px-4 py-1.5 font-semibold border-t-2 transition-colors cursor-pointer ${activeActivityTab === 'SALES_VISIT'
                          ? 'bg-white text-slate-900 border-rose-500 border-x border-slate-200'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-transparent'
                        }`}
                    >
                      📍 Sales Visit
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pb-1">
                    <button
                      type="button"
                      onClick={() => showToast('Activity action opened')}
                      className="px-2.5 py-1 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      ++ Add
                    </button>
                    <button
                      type="button"
                      onClick={() => showToast('Activity action opened')}
                      className="px-2.5 py-1 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Activities Body */}
                <div className="bg-white border border-slate-200 rounded p-6 text-xs text-slate-500 min-h-[100px]">
                  {activeActivityTab === 'TASK' && <p className="text-slate-500">No Tasks.</p>}
                  {activeActivityTab === 'NOTES' && <p className="text-slate-500">No Notes recorded.</p>}
                  {activeActivityTab === 'FILES' && <p className="text-slate-500">No Files uploaded.</p>}
                  {activeActivityTab === 'SALES_VISIT' && <p className="text-slate-500">No Sales Visits recorded.</p>}
                </div>

                {/* Back Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('LIST');
                      setDetailContact(null);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    <span>⬅ Back</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Customer Tab View */
            <div className="bg-white border border-slate-200 rounded p-5 text-xs space-y-3 max-w-2xl shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm uppercase">{detailContact.customerName}</h3>
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                  {detailContact.status}
                </span>
              </div>
              <p className="text-slate-600">
                <strong className="text-slate-800">Primary Contact:</strong> {detailContact.name} ({detailContact.designation || 'Representative'})
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Phone:</strong> {detailContact.mobile}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Email:</strong> {detailContact.email}
              </p>
              <p className="text-slate-600">
                <strong className="text-slate-800">Account Owner:</strong> {detailContact.ownerName}
              </p>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('LIST');
                    setDetailContact(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  <span>⬅ Back</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* VIEW MODE 2: CONTACTS LIST TABLE (IMAGE 1 LIST SPEC) */
        <>
          {/* 1. TOP 4-COLUMN FILTER CARD */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-4 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Select Contact Owner */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Contact Owner</label>
                <div className="relative">
                  <select
                    value={selectedOwner}
                    onChange={(e) => {
                      setSelectedOwner(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 pr-8 cursor-pointer"
                  >
                    {ownerOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign</label>
                <div className="relative">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => {
                      setSelectedCampaign(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 pr-8 cursor-pointer"
                  >
                    {campaignOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
                <div className="relative">
                  <select
                    value={selectedDesignation}
                    onChange={(e) => {
                      setSelectedDesignation(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 pr-8 cursor-pointer"
                  >
                    {designationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Customer */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
                <div className="relative">
                  <select
                    value={selectedCustomer}
                    onChange={(e) => {
                      setSelectedCustomer(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full appearance-none bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-sky-500 pr-8 cursor-pointer"
                  >
                    <option value="Select Company">Select Company</option>
                    {customerOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. TOOLBAR: CONTACT TITLE & ACTION BUTTONS */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-[4px] px-4 py-3 shadow-sm">
            {/* Left: Contact Title */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">Contact</h1>
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAssignTargetOwner(ownerOptions[1] || '');
                  setAssignTargetCompany(customerOptions[0] || '');
                  setIsAssignModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1E3A5F] hover:bg-[#162A45] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Assign Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[#1E3A5F] hover:bg-[#162A45] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Contact</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ CONTACT</span>
              </button>
            </div>
          </div>

          {/* 3. TABLE CONTROLS BAR: Shows Rows & Search */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            {/* Shows Rows */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700">
              <span>Shows</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>Rows</span>
            </div>

            {/* Search Contact */}
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search Contact"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-white border border-slate-300 rounded pl-3 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 4. CONTACTS DATA TABLE */}
          <div className="bg-white border border-slate-200 rounded-[4px] shadow-sm overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 text-center w-14 border-r border-slate-200/60">SL.No</th>
                    <th className="py-2.5 px-4 min-w-[180px] border-r border-slate-200/60">Contact Name</th>
                    <th className="py-2.5 px-4 min-w-[140px] border-r border-slate-200/60">Designation</th>
                    <th className="py-2.5 px-4 min-w-[240px] border-r border-slate-200/60">Customer Name</th>
                    <th className="py-2.5 px-3 text-center w-20 border-r border-slate-200/60">Owner</th>
                    <th className="py-2.5 px-4 min-w-[160px] border-r border-slate-200/60">Mobile</th>
                    <th className="py-2.5 px-3 text-center w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {paginatedContacts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-xs text-slate-500 bg-white">
                        <User className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No contacts found</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {contacts.length === 0
                            ? 'Click "+ CONTACT" above to add your first customer contact.'
                            : 'No contacts match the current filter criteria.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    paginatedContacts.map((c, idx) => {
                      const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                      const cleanPhone = c.mobile.replace(/[^0-9+]/g, '');
                      const cleanWa = (c.whatsapp || c.mobile).replace(/[^0-9]/g, '');

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* SL.No */}
                          <td className="py-3 px-3 text-center font-bold text-slate-800 border-r border-slate-200/40">
                            {slNo}
                          </td>

                          {/* Contact Name with Info Icon (Opens Full Page Details) */}
                          <td className="py-3 px-4 border-r border-slate-200/40">
                            <div className="flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(c)}
                                className="text-[#337AB7] hover:underline font-medium text-xs text-left cursor-pointer"
                              >
                                {c.name}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(c)}
                                title="View Contact Details"
                                className="text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </td>

                          {/* Designation */}
                          <td className="py-3 px-4 text-slate-600 border-r border-slate-200/40">
                            {c.designation || '-'}
                          </td>

                          {/* Customer Name with Info Icon */}
                          <td className="py-3 px-4 border-r border-slate-200/40">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[#337AB7] font-semibold text-[11px] tracking-tight uppercase">
                                {c.customerName}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(c)}
                                title="Customer Info"
                                className="text-[#0284C7] hover:text-[#0369A1] transition-colors cursor-pointer"
                              >
                                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                              </button>
                            </div>
                          </td>

                          {/* Owner Avatar */}
                          <td className="py-3 px-3 text-center border-r border-slate-200/40">
                            <div className="flex items-center justify-center">
                              {c.ownerAvatar ? (
                                <img
                                  src={c.ownerAvatar}
                                  alt={c.ownerName}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                                  title={c.ownerName}
                                />
                              ) : (
                                <div
                                  className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700"
                                  title={c.ownerName}
                                >
                                  {c.ownerName.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Mobile with Phone & WhatsApp Icons */}
                          <td className="py-3 px-4 border-r border-slate-200/40">
                            <div className="flex items-center gap-2">
                              <span className="text-[#EA580C] text-[11px] font-medium">📞</span>
                              <a
                                href={`tel:${cleanPhone}`}
                                className="text-[#337AB7] hover:underline font-mono text-[11px]"
                              >
                                {c.mobile}
                              </a>
                              <a
                                href={`https://wa.me/${cleanWa}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-500 hover:text-emerald-600 transition-colors"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                              </a>
                            </div>
                          </td>

                          {/* Actions Button */}
                          <td className="py-3 px-3 text-center">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionId((prev) => (prev === c.id ? null : c.id));
                                }}
                                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-[3px] bg-[#005B60] hover:bg-[#00474B] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                                title="Actions"
                              >
                                <SettingsIcon className="w-3.5 h-3.5" />
                                <ChevronDown className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>

                              {/* Actions Dropdown */}
                              {openActionId === c.id && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setOpenActionId(null)}
                                  />
                                  <div className="absolute right-0 top-full mt-1 w-[150px] bg-white border border-slate-200 rounded-[3px] shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-50 py-1 text-slate-800 animate-in fade-in duration-100 text-left">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionId(null);
                                        handleOpenDetails(c);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#F3F4F6] text-xs text-slate-700 cursor-pointer"
                                    >
                                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                                      <span>View</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionId(null);
                                        handleOpenEditModal(c);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-[#F3F4F6] text-xs text-slate-700 cursor-pointer"
                                    >
                                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenActionId(null);
                                        setContactToDelete(c);
                                        setIsDeleteModalOpen(true);
                                      }}
                                      className="w-full px-3 py-1.5 flex items-center gap-2 hover:bg-rose-50 text-xs text-rose-600 cursor-pointer border-t border-slate-100"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </>
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

            {/* Table Pagination */}
            {filteredContacts.length > rowsPerPage && (
              <div className="bg-[#F8FAFC] border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
                <span>
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, filteredContacts.length)} of {filteredContacts.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-2.5 py-1 rounded border ${currentPage === pageNum
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F] font-bold'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        } cursor-pointer`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* 5. ADD CONTACT MODAL */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Contact">
        <form onSubmit={handleSaveAddContact} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Salutation & Contact Person Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.salutation}
                  onChange={(e) => setFormData({ ...formData, salutation: e.target.value as any })}
                  className="w-24 bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                  <option value="Mrs.">Mrs.</option>
                  <option value="Dr.">Dr.</option>
                  <option value="Eng.">Eng.</option>
                </select>
                <input
                  type="text"
                  required
                  placeholder="e.g. NIKHIL"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Customer / Company */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer / Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. T B X UPSTREAM SEAMLESS PIPES- L.L.C"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                list="customer-suggestions"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 uppercase"
              />
              <datalist id="customer-suggestions">
                {customerOptions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Designation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                placeholder="e.g. Procurement Manager"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Contact Owner */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Owner</label>
              <select
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
              <div className="flex gap-2">
                <span className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600">
                  +971
                </span>
                <input
                  type="text"
                  placeholder="50 473 7491"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number</label>
              <div className="flex gap-2">
                <span className="bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-600">
                  +971
                </span>
                <input
                  type="text"
                  placeholder="50 473 7491 (leave blank if same)"
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="nikhil@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Campaign */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Summer Outreach"
                value={formData.campaign}
                onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="Executive Management">Executive Management</option>
              <option value="Procurement & Sourcing">Procurement & Sourcing</option>
              <option value="Engineering & Maintenance">Engineering & Maintenance</option>
              <option value="Sales & Commercial">Sales & Commercial</option>
              <option value="Finance & Accounts">Finance & Accounts</option>
              <option value="Operations & Logistics">Operations & Logistics</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Profile Summary</label>
            <textarea
              rows={2}
              placeholder="Add key notes, preferred call times, or project details..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
            >
              Save Contact
            </button>
          </div>
        </form>
      </Modal>

      {/* 6. EDIT CONTACT MODAL (EXACT CEZCON CRM DESIGN) */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="5xl">
        <div className="bg-white rounded-[3px] overflow-hidden text-slate-800 font-sans shadow-lg">
          {/* Header Bar with Cezcon Red Close Button */}
          <div className="bg-[#EAEAEA] border-b border-[#D1D5DB] px-3.5 py-2 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-xs font-bold text-slate-800 tracking-tight">Edit Contact</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white rounded-[2px] flex items-center justify-center text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
              title="Close"
            >
              ✖
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSaveEditContact} className="p-6 md:p-8 space-y-6 text-xs bg-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* LEFT COLUMN */}
              <div className="space-y-4">
                {/* Contact Owner */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Contact Owner</label>
                  <div className="relative">
                    <select
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] pl-8 pr-7 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Customer Name */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Customer Name</label>
                  <div className="relative flex items-center w-full bg-white border border-slate-300 rounded-[2px] px-2 py-1 min-h-[31px] shadow-2xs">
                    {formData.customerName ? (
                      <div className="inline-flex items-center gap-1.5 bg-[#F4F4F4] border border-[#D2D6DE] text-slate-800 px-2 py-0.5 rounded-[2px] text-[11px] font-medium uppercase tracking-tight">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, customerName: '' })}
                          className="text-slate-500 hover:text-slate-800 cursor-pointer font-bold text-xs leading-none"
                        >
                          ×
                        </button>
                        <span>{formData.customerName}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="Search or enter customer name"
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        list="edit-customer-datalist"
                        className="w-full text-xs text-slate-800 focus:outline-none bg-transparent"
                      />
                    )}
                    <datalist id="edit-customer-datalist">
                      {customerOptions.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                    {formData.customerName && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, customerName: '' })}
                        className="text-slate-400 hover:text-slate-600 ml-auto text-xs px-1 cursor-pointer"
                        title="Clear"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Source Name */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Source Name</label>
                  <input
                    type="text"
                    placeholder="Name of the source. Eg Google, LinkedIn"
                    value={formData.sourceName}
                    onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>

                {/* Designation */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Designation</label>
                  <div className="relative">
                    <select
                      value={formData.designation || 'Select'}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value === 'Select' ? '' : e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      <option value="Select">Select</option>
                      {designationOptions.filter((d) => d !== 'Select Designation').map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Business Mobile */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold text-xs">📱</span>
                    <span>Business Mobile</span>
                  </label>
                  <div className="flex gap-1.5">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-[2px] px-2 py-1.5 text-xs text-slate-700 shrink-0 shadow-2xs">
                      <span>🇦🇪</span>
                      <span>+971</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.businessMobile}
                      onChange={(e) => setFormData({ ...formData, businessMobile: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="text-rose-600 text-xs">✉️</span>
                    <span>Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Add multiple emails by pressing Tab button."
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                  />
                </div>

                {/* Nationality */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Nationality</label>
                  <div className="relative">
                    <select
                      value={formData.nationality || 'Select'}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value === 'Select' ? '' : e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      <option value="Select">Select</option>
                      <option value="Emirati">Emirati</option>
                      <option value="Indian">Indian</option>
                      <option value="Pakistani">Pakistani</option>
                      <option value="British">British</option>
                      <option value="American">American</option>
                      <option value="Egyptian">Egyptian</option>
                      <option value="Jordanian">Jordanian</option>
                      <option value="Filipino">Filipino</option>
                      <option value="Saudi">Saudi</option>
                      <option value="Omani">Omani</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Comments */}
                <div className="grid grid-cols-[130px_1fr] items-start gap-3">
                  <label className="text-xs text-slate-700 font-normal pt-1.5">Comments</label>
                  <textarea
                    rows={2}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 resize-y shadow-2xs"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="space-y-4">
                {/* Contact Name */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1">
                    <span>Contact Name</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  </label>
                  <div className="flex border border-emerald-500 rounded-[2px] overflow-hidden focus-within:ring-1 focus-within:ring-emerald-500 shadow-2xs">
                    <select
                      value={formData.salutation}
                      onChange={(e) => setFormData({ ...formData, salutation: e.target.value as any })}
                      className="bg-[#FAFAFA] border-r border-slate-300 px-2 py-1.5 text-xs text-slate-700 cursor-pointer focus:outline-none"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Eng.">Eng.</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="flex-1 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Source */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span>Source</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      ?
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.source || 'Select'}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value === 'Select' ? '' : e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      <option value="Select">Select</option>
                      <option value="Website">Website</option>
                      <option value="Google">Google</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Exhibition / Tradeshow">Exhibition / Tradeshow</option>
                      <option value="Direct Outreach">Direct Outreach</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Campaign */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span>Campaign</span>
                    <span className="w-3.5 h-3.5 rounded-full bg-black text-white text-[9px] flex items-center justify-center font-bold">
                      ?
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      value={formData.campaign || 'Select'}
                      onChange={(e) => setFormData({ ...formData, campaign: e.target.value === 'Select' ? '' : e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      <option value="Select">Select</option>
                      {campaignOptions.filter((c) => c !== 'Select Campaign').map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Tel(Ext) */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="text-sky-600 text-xs">📞</span>
                    <span>Tel(Ext)</span>
                  </label>
                  <div className="flex gap-1.5">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-[2px] px-2 py-1.5 text-xs text-slate-700 shrink-0 shadow-2xs">
                      <span>🇦🇪</span>
                      <span>+971</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Extension number of point of contact"
                      value={formData.telExt}
                      onChange={(e) => setFormData({ ...formData, telExt: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Personal Mobile */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5">
                    <span className="text-amber-600 font-bold text-xs">📱</span>
                    <span>Personal Mobile</span>
                  </label>
                  <div className="flex gap-1.5">
                    <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-[2px] px-2 py-1.5 text-xs text-slate-700 shrink-0 shadow-2xs">
                      <span>🇦🇪</span>
                      <span>+971</span>
                      <ChevronDown className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.personalMobile}
                      onChange={(e) => setFormData({ ...formData, personalMobile: e.target.value })}
                      className="flex-1 bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-500 font-mono shadow-2xs"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="grid grid-cols-[130px_1fr] items-start gap-3">
                  <label className="text-xs text-slate-700 font-normal flex items-center gap-1.5 pt-1.5">
                    <span className="text-sky-600 text-xs">📍</span>
                    <span>Address</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Address of point of contact"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-[2px] px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-sky-500 resize-y shadow-2xs"
                  />
                </div>

                {/* Spoken Language */}
                <div className="grid grid-cols-[130px_1fr] items-center gap-3">
                  <label className="text-xs text-slate-700 font-normal">Spoken Language</label>
                  <div className="relative">
                    <select
                      value={formData.spokenLanguage || 'Select'}
                      onChange={(e) => setFormData({ ...formData, spokenLanguage: e.target.value === 'Select' ? '' : e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-[2px] px-2.5 py-1.5 text-xs text-slate-800 cursor-pointer focus:outline-none focus:border-sky-500 appearance-none shadow-2xs"
                    >
                      <option value="Select">Select</option>
                      <option value="English">English</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Urdu">Urdu</option>
                      <option value="Tagalog">Tagalog</option>
                      <option value="French">French</option>
                      <option value="Russian">Russian</option>
                      <option value="German">German</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Malayalam">Malayalam</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="px-5 py-1.5 rounded-[3px] bg-[#1E3A5F] hover:bg-[#152e4d] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              >
                Update
              </button>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-1.5 rounded-[3px] border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* 7. UPLOAD CONTACT MODAL */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Contacts (CSV / Excel)">
        <div className="space-y-4 text-xs">
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Choose CSV or XLSX file to import contacts</p>
            <p className="text-[11px] text-slate-400 mt-1">Columns required: Name, Customer, Designation, Mobile, Email</p>
            <input type="file" accept=".csv,.xlsx,.xls" className="mt-4 text-xs mx-auto cursor-pointer" />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setIsUploadModalOpen(false);
                showToast('Import batch completed!');
              }}
              className="px-4 py-1.5 rounded bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer"
            >
              Upload & Process
            </button>
          </div>
        </div>
      </Modal>

      {/* 8. ASSIGN CONTACT MODAL */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Contact">
        <form onSubmit={handleSaveAssign} className="space-y-4 text-xs">
          <p className="text-slate-600">
            {activeContact
              ? `Reassign "${activeContact.name}" to a new owner or company.`
              : `Assign selected contacts to an owner or company:`}
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Owner</label>
            <select
              value={assignTargetOwner}
              onChange={(e) => setAssignTargetOwner(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Customer Company</label>
            <input
              type="text"
              placeholder="e.g. T B X UPSTREAM SEAMLESS PIPES- L.L.C"
              value={assignTargetCompany}
              onChange={(e) => setAssignTargetCompany(e.target.value)}
              list="customer-assign-list"
              className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 uppercase"
            />
            <datalist id="customer-assign-list">
              {customerOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#1E3A5F] text-white text-xs font-semibold cursor-pointer"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* 9. DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Contact Confirmation">
        <div className="space-y-4 text-xs">
          <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p>
              Are you sure you want to delete contact{' '}
              <span className="font-bold text-rose-900">{contactToDelete?.name}</span>? This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-1.5 rounded border border-slate-300 bg-white text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteContact}
              className="px-4 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
            >
              Delete Contact
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
