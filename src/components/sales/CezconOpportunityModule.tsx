'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Plus,
  Calendar,
  Shield,
  User,
  Phone,
  Info,
  ChevronDown,
  Edit2,
  Settings as SettingsIcon,
  Eye,
  Trash2,
  X,
  ArrowLeft,
  Star,
  Upload,
  UserCheck,
  CheckCircle2,
  Clock,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Tag,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { CrmSalesOpportunity, DealStage } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';
import { CezconUploadOpportunityModule } from './CezconUploadOpportunityModule';

interface CezconOpportunityModuleProps {
  initialCreate?: boolean;
}

export function CezconOpportunityModule({ initialCreate = false }: CezconOpportunityModuleProps) {
  const {
    salesOpportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
    customers,
    users,
  } = useEnterpriseCrm();

  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;

  // View state: Table list vs Creation Form vs Upload Form
  const [isCreating, setIsCreating] = useState(initialCreate);
  const [isUploading, setIsUploading] = useState(false);
  const [oppToEdit, setOppToEdit] = useState<CrmSalesOpportunity | null>(null);

  // Sub-tabs State (matching Cezcon CRM Opportunity top bar)
  const [activeSubTab, setActiveSubTab] = useState<'All' | 'Unread' | 'Open' | 'Today' | 'Overdue' | 'Upcoming' | 'Lost' | 'Order' | 'Overview'>('Open');

  // Sidebar Filter Toggle
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(true);

  // Filter criteria states (matching Image 1)
  const [filterCustomer, setFilterCustomer] = useState<string>('');
  const [filterClassification, setFilterClassification] = useState<string>('All Classification');
  const [filterStage, setFilterStage] = useState<string>('All Stages');
  const [filterRating, setFilterRating] = useState<string>('All');
  const [filterBizOpp, setFilterBizOpp] = useState<string>('');
  const [filterOwner, setFilterOwner] = useState<string>('All Owners');
  const [filterCampaign, setFilterCampaign] = useState<string>('');
  const [filterCreatedBy, setFilterCreatedBy] = useState<string>('All');
  const [filterCreatedDate, setFilterCreatedDate] = useState<string>('');
  const [filterOpportunityDate, setFilterOpportunityDate] = useState<string>('');

  // Table Search & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedOppIds, setSelectedOppIds] = useState<string[]>([]);
  const [starredOppIds, setStarredOppIds] = useState<Set<string>>(new Set(['opp_1', 'opp_2']));

  // Action Dropdown & View Modal
  const [openActionDropdownId, setOpenActionDropdownId] = useState<string | null>(null);
  const [viewingOpp, setViewingOpp] = useState<CrmSalesOpportunity | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State for Opportunity Creation / Editing
  const [formCustomer, setFormCustomer] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStage, setFormStage] = useState<DealStage>('Opportunity');
  const [formProbability, setFormProbability] = useState<number>(50);
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formOppDate, setFormOppDate] = useState('');
  const [formCloseDate, setFormCloseDate] = useState('');
  const [formOwner, setFormOwner] = useState('');
  const [formRating, setFormRating] = useState<'Hot' | 'Warm' | 'Cold' | string>('Warm');
  const [formBizType, setFormBizType] = useState('HVAC Equipment & Supply');
  const [formCampaign, setFormCampaign] = useState('Direct Sales / Walk-in');
  const [formDescription, setFormDescription] = useState('');

  const actionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target as Node)) {
        setOpenActionDropdownId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Setup Form
  const initForm = (target?: CrmSalesOpportunity | null) => {
    const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    const closeStr = futureDate.toLocaleDateString('en-GB').replace(/\//g, '-');

    if (target) {
      setFormTitle(target.title || '');
      setFormCode(target.opportunityCode || target.id);
      setFormCustomer(target.customer || '');
      setFormContactPerson(target.contactPerson || '');
      setFormPhone(target.phone || '');
      setFormEmail('');
      setFormStage(target.stage || 'Opportunity');
      setFormProbability(target.probability || 50);
      setFormAmount(target.amount || '');
      setFormOppDate(target.opportunityDate || todayStr);
      setFormCloseDate(target.expectedClose || closeStr);
      setFormOwner(target.owner || currentUser?.name || 'shaheer');
      setFormRating(target.rating || 'Warm');
      setFormBizType(target.businessOpportunity || 'HVAC Equipment & Supply');
      setFormCampaign(target.campaign || 'Direct Sales / Walk-in');
      setFormDescription(target.subtitle || target.title || '');
    } else {
      const randNum = Math.floor(7120 + Math.random() * 100);
      setFormCode(`CTEQ#${randNum}`);
      setFormTitle('');
      setFormCustomer('');
      setFormContactPerson('');
      setFormPhone('+971 55 417 0989');
      setFormEmail('');
      setFormStage('Opportunity');
      setFormProbability(50);
      setFormAmount(150000);
      setFormOppDate(todayStr);
      setFormCloseDate(closeStr);
      setFormOwner(currentUser?.name || 'shaheer');
      setFormRating('Hot');
      setFormBizType('HVAC Equipment & Supply');
      setFormCampaign('Direct Inbound Lead');
      setFormDescription('');
    }
  };

  const handleStartCreate = () => {
    setOppToEdit(null);
    initForm(null);
    setIsCreating(true);
  };

  const handleStartEdit = (opp: CrmSalesOpportunity) => {
    setOppToEdit(opp);
    initForm(opp);
    setIsCreating(true);
  };

  const handleCloseForm = () => {
    setIsCreating(false);
    setOppToEdit(null);
  };

  const handleCustomerSelect = (custName: string) => {
    setFormCustomer(custName);
    const matched = customers?.find((c) => {
      const name = c.customerName || c.companyName || '';
      return name.toLowerCase() === custName.toLowerCase() || c.id === custName;
    });
    if (matched) {
      if (matched.contactPerson) setFormContactPerson(matched.contactPerson);
      if (matched.phone || matched.mobile) setFormPhone(matched.phone || matched.mobile || '');
      if (matched.email) setFormEmail(matched.email);
    }
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStarredOppIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedOppIds.length === filteredOpportunities.length) {
      setSelectedOppIds([]);
    } else {
      setSelectedOppIds(filteredOpportunities.map((o) => o.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedOppIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Submit Handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formCustomer.trim()) {
      alert('Please fill in Opportunity Title and Customer');
      return;
    }

    const payload: CrmSalesOpportunity = {
      id: oppToEdit?.id || `opp_${Date.now()}`,
      title: formTitle.trim(),
      subtitle: formDescription.trim() || undefined,
      opportunityCode: formCode || `CTEQ#${Math.floor(7100 + Math.random() * 200)}`,
      customer: formCustomer.trim(),
      contactPerson: formContactPerson.trim() || undefined,
      phone: formPhone.trim() || undefined,
      amount: Number(formAmount) || 0,
      stage: formStage,
      probability: Number(formProbability) || 50,
      owner: formOwner || currentUser?.name || 'shaheer',
      expectedClose: formCloseDate,
      opportunityDate: formOppDate,
      opportunityAssigned: formOwner,
      lastActivity: `${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      rating: formRating,
      businessOpportunity: formBizType,
      campaign: formCampaign,
      createdBy: oppToEdit?.createdBy || currentUser?.name || 'shaheer',
      createdAt: oppToEdit?.createdAt || new Date().toISOString(),
    };

    if (oppToEdit) {
      updateOpportunity(payload.id, payload);
      showToast(`Opportunity "${payload.title}" updated successfully!`);
    } else {
      addOpportunity(payload);
      showToast(`Opportunity "${payload.title}" created successfully!`);
    }

    setIsCreating(false);
    setOppToEdit(null);
  };

  // Filtered Opportunities based on Subtab, Search and Sidebar Filters
  const filteredOpportunities = useMemo(() => {
    let list = salesOpportunities || [];

    // 1. Sub-tab filter
    if (activeSubTab === 'Open') {
      list = list.filter((o) => o.stage !== 'Won' && o.stage !== 'Lost' && o.stage !== 'Closed');
    } else if (activeSubTab === 'Today') {
      const todayStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
      list = list.filter((o) => o.opportunityDate === todayStr || (o.lastActivity || '').includes('Today'));
    } else if (activeSubTab === 'Overdue') {
      list = list.filter((o) => (o.stage !== 'Won' && o.stage !== 'Order') && (o.probability || 0) < 60);
    } else if (activeSubTab === 'Upcoming') {
      list = list.filter((o) => o.stage === 'Proposal' || o.stage === 'Negotiation');
    } else if (activeSubTab === 'Lost') {
      list = list.filter((o) => o.stage === 'Lost');
    } else if (activeSubTab === 'Order') {
      list = list.filter((o) => o.stage === 'Won' || o.stage === 'Order' || o.stage === 'Invoice');
    } else if (activeSubTab === 'Unread') {
      list = list.slice(0, 3);
    }

    // 2. Left Sidebar Filters
    if (filterCustomer.trim()) {
      list = list.filter((o) => o.customer.toLowerCase().includes(filterCustomer.toLowerCase()));
    }
    if (filterStage !== 'All Stages') {
      list = list.filter((o) => (o.stage || '').toLowerCase() === filterStage.toLowerCase());
    }
    if (filterRating !== 'All') {
      list = list.filter((o) => o.rating === filterRating);
    }
    if (filterOwner !== 'All Owners') {
      list = list.filter((o) => (o.owner || '').toLowerCase().includes(filterOwner.toLowerCase()));
    }
    if (filterBizOpp.trim()) {
      list = list.filter((o) => (o.businessOpportunity || o.title || '').toLowerCase().includes(filterBizOpp.toLowerCase()));
    }
    if (filterCampaign.trim()) {
      list = list.filter((o) => (o.campaign || '').toLowerCase().includes(filterCampaign.toLowerCase()));
    }

    // 3. Search Bar
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          (o.title || '').toLowerCase().includes(q) ||
          (o.opportunityCode || '').toLowerCase().includes(q) ||
          (o.customer || '').toLowerCase().includes(q) ||
          (o.contactPerson || '').toLowerCase().includes(q) ||
          (o.owner || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    salesOpportunities,
    activeSubTab,
    filterCustomer,
    filterStage,
    filterRating,
    filterOwner,
    filterBizOpp,
    filterCampaign,
    searchQuery,
  ]);

  const totalPages = Math.ceil(filteredOpportunities.length / rowsPerPage) || 1;
  const paginatedOpportunities = filteredOpportunities.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getStageBadgeStyle = (stage?: string) => {
    const s = (stage || 'Enquiry').toLowerCase();
    if (s.includes('enquiry') || s.includes('lead')) {
      return { label: 'Enquiry', bg: 'bg-[#CA8A04]', bar: 'bg-[#CA8A04]', percent: 48 };
    }
    if (s.includes('offer') || s.includes('proposal') || s.includes('quote')) {
      return { label: 'Offer Sent', bg: 'bg-[#2563EB]', bar: 'bg-[#2563EB]', percent: 65 };
    }
    if (s.includes('negotiation')) {
      return { label: 'Negotiation', bg: 'bg-[#7C3AED]', bar: 'bg-[#7C3AED]', percent: 80 };
    }
    if (s.includes('won') || s.includes('order') || s.includes('invoice')) {
      return { label: 'Order', bg: 'bg-[#16A34A]', bar: 'bg-[#16A34A]', percent: 100 };
    }
    if (s.includes('lost')) {
      return { label: 'Lost', bg: 'bg-[#DC2626]', bar: 'bg-[#DC2626]', percent: 0 };
    }
    return { label: stage || 'Enquiry', bg: 'bg-[#CA8A04]', bar: 'bg-[#CA8A04]', percent: 50 };
  };

  return (
    <div className="space-y-2.5 font-sans">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP SUB-TABS STATUS BAR (EXACT CEZCON CRM IMAGE 1)                     */}
      {/* ========================================================================= */}
      <div className="bg-white border border-[#E2E8F0] rounded-sm px-2 py-1 flex items-center gap-1 sm:gap-2 overflow-x-auto shadow-2xs">
        {[
          { id: 'All', label: 'All', count: 5952, icon: Tag },
          { id: 'Unread', label: 'Unread', count: 27, icon: AlertCircle },
          { id: 'Open', label: 'Open', count: 2769, icon: CheckSquare },
          { id: 'Today', label: 'Today', count: 5, icon: Calendar },
          { id: 'Overdue', label: 'Overdue', count: 2726, icon: Clock },
          { id: 'Upcoming', label: 'Upcoming', count: 37, icon: TrendingUp },
          { id: 'Lost', label: 'Lost', count: 466, icon: X },
          { id: 'Order', label: 'Order', count: 2718, icon: CheckCircle2 },
          { id: 'Overview', label: 'Overview', icon: BarChart3 },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setCurrentPage(1);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer',
                isActive
                  ? 'border-t-2 border-[#E11D48] text-[#E11D48] bg-rose-50/50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', isActive ? 'text-[#E11D48]' : 'text-slate-400')} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={cn(
                    'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                    isActive ? 'bg-[#E11D48] text-white' : 'bg-slate-100 text-slate-600'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: FULL-PAGE OPPORTUNITY CREATION / EDITING / UPLOADING FORM         */}
      {/* ========================================================================= */}
      {isUploading ? (
        <CezconUploadOpportunityModule
          onClose={() => setIsUploading(false)}
          onSuccess={(count) => {
            showToast(`${count} opportunities imported successfully!`);
            setIsUploading(false);
          }}
        />
      ) : isCreating ? (
        <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs">
          {/* Form Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-slate-200">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCloseForm}
                className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                {oppToEdit ? 'Edit Opportunity' : '+ Add Opportunity'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleCloseForm}
              className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded text-xs font-bold transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="p-4 sm:p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
              {/* Left Column */}
              <div className="space-y-3.5">
                {/* Customer / Prospect */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Customer / Prospect <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      list="customer-datalist"
                      value={formCustomer}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      placeholder="Select Customer / Prospect"
                      required
                      className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                    <datalist id="customer-datalist">
                      {customers?.map((c) => {
                        const cName = c.customerName || c.companyName || c.id;
                        return <option key={c.id} value={cName} />;
                      })}
                      <option value="Daqing Oilfield Construction Group Co.,Ltd." />
                      <option value="CAT INTERNATIONAL LIMITED - L.L.C" />
                      <option value="Al Habtoor Engineering LLC" />
                      <option value="Arabtec Construction LLC" />
                    </datalist>
                  </div>
                </div>

                {/* Contact Person */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    placeholder="e.g. Mr. Wang Junping"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Phone / Mobile */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+971 55 417 0989"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Opportunity Title */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Opportunity / Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. SUPPLY OF SPLIT AC"
                    required
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Opportunity Code */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opportunity Code</label>
                  <input
                    type="text"
                    value={formCode}
                    readOnly
                    className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                  <select
                    value={formRating}
                    onChange={(e) => setFormRating(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Hot">🔥 Hot (High intent, immediate closing)</option>
                    <option value="Warm">⚡ Warm (Engaged, evaluating offer)</option>
                    <option value="Cold">❄️ Cold (Preliminary enquiry)</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3.5">
                {/* Opportunity Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opportunity Date</label>
                  <input
                    type="text"
                    value={formOppDate}
                    onChange={(e) => setFormOppDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Expected Close Date */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Close Date</label>
                  <input
                    type="date"
                    value={formCloseDate}
                    onChange={(e) => setFormCloseDate(e.target.value)}
                    onClick={(e) => {
                      try {
                        (e.currentTarget as HTMLInputElement).showPicker?.();
                      } catch { }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  />
                </div>

                {/* Stage */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={formStage}
                    onChange={(e) => {
                      const s = e.target.value as DealStage;
                      setFormStage(s);
                      if (s === 'Opportunity') setFormProbability(30);
                      else if (s === 'Proposal' || s === 'Offer Sent') setFormProbability(60);
                      else if (s === 'Negotiation') setFormProbability(80);
                      else if (s === 'Won' || s === 'Order') setFormProbability(100);
                      else if (s === 'Lost') setFormProbability(0);
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Opportunity">Enquiry / Opportunity (30%)</option>
                    <option value="Proposal">Offer Sent / Proposal (60%)</option>
                    <option value="Negotiation">Negotiation (80%)</option>
                    <option value="Won">Won / Order Confirmed (100%)</option>
                    <option value="Lost">Lost (0%)</option>
                  </select>
                </div>

                {/* Win Probability & Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Win Probability (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={formProbability}
                      onChange={(e) => setFormProbability(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Expected Amount (AED)</label>
                    <input
                      type="number"
                      step="any"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Opportunity Owner */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Opportunity Owner</label>
                  <select
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {users && users.length > 0 ? (
                      users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role || u.department || 'Sales'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Shaheer">Shaheer (Sales Employee)</option>
                        <option value="Muhammed Shibil">Muhammed Shibil (Sales Manager)</option>
                        <option value="MUHAMMED AHSAN P V">MUHAMMED AHSAN P V (Sales Engineer)</option>
                        <option value="Nafal">Nafal (Sales Executive)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Campaign / Source */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Campaign / Lead Source</label>
                  <select
                    value={formCampaign}
                    onChange={(e) => setFormCampaign(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Direct Inbound Lead">Direct Inbound Lead</option>
                    <option value="Digital HVAC Campaign">Digital HVAC Campaign</option>
                    <option value="Corporate Tenders & Gov">Corporate Tenders & Gov</option>
                    <option value="Direct Client Referral">Direct Client Referral</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remarks &amp; Scope of Work</label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Details of the commercial HVAC requirement..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Form Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="px-5 py-2 bg-[#16A34A] hover:bg-[#15803D] text-white rounded text-xs font-bold shadow-xs transition cursor-pointer"
              >
                {oppToEdit ? 'Save Changes' : 'Submit Opportunity'}
              </button>
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* VIEW B: FULL CEZCON OPPORTUNITY WORKBENCH (EXACT CEZCON CRM IMAGE 1)      */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN (3 cols): COLLAPSIBLE FILTER SIDEBAR                   */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          {isFilterSidebarOpen && (
            <div className="lg:col-span-3 bg-white border border-[#E2E8F0] rounded-sm p-3.5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-slate-500" />
                  Filter Options
                </span>
                <button
                  type="button"
                  onClick={() => setIsFilterSidebarOpen(false)}
                  className="w-4 h-4 rounded bg-[#D9534F] text-white flex items-center justify-center text-[10px] font-bold hover:bg-[#C9302C] transition cursor-pointer"
                  title="Close Filters"
                >
                  <X className="w-3 h-3 stroke-[3]" />
                </button>
              </div>

              {/* Customer / Prospect */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Customer/ Prospect</label>
                <select
                  value={filterCustomer}
                  onChange={(e) => {
                    setFilterCustomer(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Customer/Prospect</option>
                  {customers?.map((c) => {
                    const cName = c.customerName || c.companyName || c.id;
                    return (
                      <option key={c.id} value={cName}>
                        {cName}
                      </option>
                    );
                  })}
                  <option value="Daqing Oilfield">Daqing Oilfield Construction Group</option>
                  <option value="CAT INTERNATIONAL">CAT INTERNATIONAL LIMITED</option>
                </select>
              </div>

              {/* Classification */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Classification</label>
                <select
                  value={filterClassification}
                  onChange={(e) => setFilterClassification(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Classification">All Classification</option>
                  <option value="Corporate / Enterprise">Corporate / Enterprise</option>
                  <option value="Government & Tenders">Government & Tenders</option>
                  <option value="Commercial Contractor">Commercial Contractor</option>
                  <option value="Direct Client">Direct Client</option>
                </select>
              </div>

              {/* Stage */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Stage</label>
                <select
                  value={filterStage}
                  onChange={(e) => {
                    setFilterStage(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Stages">All Stages</option>
                  <option value="Opportunity">Enquiry</option>
                  <option value="Proposal">Offer Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Order / Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Rating</label>
                <select
                  value={filterRating}
                  onChange={(e) => {
                    setFilterRating(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              {/* Business Opportunity */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Business Opportunity</label>
                <select
                  value={filterBizOpp}
                  onChange={(e) => {
                    setFilterBizOpp(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Type</option>
                  <option value="SPLIT AC">Supply of Split AC</option>
                  <option value="WINDOW AC">Window AC Units</option>
                  <option value="CHILLER">Chiller Plant Maintenance</option>
                  <option value="DUCTING">Ducting &amp; Insulation</option>
                </select>
              </div>

              {/* Opportunity Owner */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Opportunity Owner</label>
                <select
                  value={filterOwner}
                  onChange={(e) => {
                    setFilterOwner(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All Owners">All Owners</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Campaign */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Campaign</label>
                <select
                  value={filterCampaign}
                  onChange={(e) => {
                    setFilterCampaign(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Campaign</option>
                  <option value="Digital">Digital Marketing</option>
                  <option value="Tenders">Corporate Tenders</option>
                  <option value="Referral">Direct Referral</option>
                </select>
              </div>

              {/* Created By */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Created By</label>
                <select
                  value={filterCreatedBy}
                  onChange={(e) => setFilterCreatedBy(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                >
                  <option value="All">All</option>
                  {users?.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                  <option value="System Super Admin">System Super Admin</option>
                </select>
              </div>

              {/* Created Date */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Created Date</label>
                <div className="flex items-center border border-slate-300 rounded bg-white px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={filterCreatedDate}
                    onChange={(e) => setFilterCreatedDate(e.target.value)}
                    placeholder="All Month & Year"
                    className="w-full text-xs text-slate-700 focus:outline-none"
                  />
                  {filterCreatedDate && (
                    <button type="button" onClick={() => setFilterCreatedDate('')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Opportunity Date */}
              <div className="space-y-1">
                <label className="text-slate-600 font-medium block text-[11px]">Opportunity Date</label>
                <div className="flex items-center border border-slate-300 rounded bg-white px-2 py-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  <input
                    type="text"
                    value={filterOpportunityDate}
                    onChange={(e) => setFilterOpportunityDate(e.target.value)}
                    placeholder="All Month & Year"
                    className="w-full text-xs text-slate-700 focus:outline-none"
                  />
                  {filterOpportunityDate && (
                    <button type="button" onClick={() => setFilterOpportunityDate('')} className="text-slate-400 hover:text-slate-600">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN (9 or 12 cols): MAIN TABLE WORKBENCH                  */}
          {/* ─────────────────────────────────────────────────────────────────── */}
          <div className={cn('bg-white border border-[#E2E8F0] rounded-sm shadow-2xs overflow-hidden', isFilterSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12')}>
            {/* Header Action Bar */}
            <div className="p-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {!isFilterSidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setIsFilterSidebarOpen(true)}
                    className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Show Filters</span>
                  </button>
                )}
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold text-slate-900 tracking-tight">
                  {activeSubTab} Opportunities ({filteredOpportunities.length})
                </h3>
              </div>

              {/* Action Buttons (Exact Cezcon CRM Image 1) */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsUploading(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Opportunity</span>
                </button>

                <button
                  type="button"
                  onClick={() => showToast('Assign Opportunity to team representative.')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Opportunity</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>+ OPPORTUNITY</span>
                </button>
              </div>
            </div>

            {/* Table Controls (Rows + Search) */}
            <div className="px-3 py-2 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Shows</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-56 sm:w-64">
                <input
                  type="text"
                  placeholder="Search Opportunity"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded pl-2.5 pr-8 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Opportunities Table (Exact columns matching Image 1) */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#F8FAFC] text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedOppIds.length === filteredOpportunities.length && filteredOpportunities.length > 0}
                        onChange={handleToggleSelectAll}
                        className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </th>
                    <th className="py-2.5 px-2.5 font-bold">Owner</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Opportunity Date</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Opportunity Assigned</th>
                    <th className="py-2.5 px-3 font-bold">Opportunity</th>
                    <th className="py-2.5 px-3 font-bold min-w-[220px]">Customer</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Last Activity</th>
                    <th className="py-2.5 px-3 font-bold whitespace-nowrap">Close Date</th>
                    <th className="py-2.5 px-3 font-bold min-w-[140px]">Stage &amp; Win Probability</th>
                    <th className="py-2.5 px-3 text-right font-bold whitespace-nowrap">Amount</th>
                    <th className="py-2.5 px-3 text-center font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                  {paginatedOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No opportunities match the criteria.</p>
                        <p className="text-[11px] text-slate-400 mt-1">Click <strong>+ OPPORTUNITY</strong> to add your first deal.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedOpportunities.map((opp, idx) => {
                      const isStarred = starredOppIds.has(opp.id);
                      const isSelected = selectedOppIds.includes(opp.id);
                      const stageInfo = getStageBadgeStyle(opp.stage);
                      const oppDate = opp.opportunityDate || '05-10-2026';
                      const closeDate = opp.expectedClose || '12-10-2026';

                      return (
                        <tr
                          key={opp.id}
                          className={cn('hover:bg-sky-50/40 transition-colors', isSelected ? 'bg-sky-50/70' : '')}
                        >
                          {/* Checkbox & SL.No */}
                          <td className="py-3 px-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectRow(opp.id)}
                                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {(currentPage - 1) * rowsPerPage + idx + 1}
                              </span>
                            </div>
                          </td>

                          {/* Owner Avatar */}
                          <td className="py-3 px-2.5">
                            <div
                              className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[10px] shadow-xs"
                              title={opp.owner || currentUser?.name || 'shaheer'}
                            >
                              {(opp.owner || currentUser?.name || 'SH').slice(0, 2).toUpperCase()}
                            </div>
                          </td>

                          {/* Opportunity Date + Days Badge */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="font-medium text-slate-800 text-[11px]">{oppDate}</p>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] mt-0.5">
                              0 days
                            </span>
                          </td>

                          {/* Opportunity Assigned */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="text-[11px] font-medium text-slate-700">
                              {opp.opportunityAssigned || opp.owner || currentUser?.name || 'shaheer'}
                            </p>
                          </td>

                          {/* Opportunity (Star, Code, Title, Info) */}
                          <td className="py-3 px-3">
                            <div className="flex items-start gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => handleToggleStar(opp.id, e)}
                                className="mt-0.5 text-slate-300 hover:text-amber-500 transition cursor-pointer"
                              >
                                <Star
                                  className={cn(
                                    'w-3.5 h-3.5',
                                    isStarred ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                                  )}
                                />
                              </button>
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-bold text-[#0284C7] text-xs hover:underline cursor-pointer">
                                    {opp.opportunityCode || opp.id}
                                  </span>
                                  <Info className="w-3 h-3 text-[#0284C7] shrink-0" />
                                </div>
                                <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight mt-0.5">
                                  {opp.title}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 font-bold text-slate-900 text-xs">
                                <Shield className="w-3 h-3 text-red-600 fill-red-600 shrink-0" />
                                <span className="hover:text-blue-700 cursor-pointer">{opp.customer}</span>
                                <Info className="w-3 h-3 text-slate-400 shrink-0" />
                              </div>
                              {opp.contactPerson && (
                                <p className="text-[11px] text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-400" />
                                  <span>{opp.contactPerson}</span>
                                  <Info className="w-2.5 h-2.5 text-slate-400" />
                                </p>
                              )}
                              {opp.phone && (
                                <p className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{opp.phone}</span>
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Last Activity */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="text-[11px] font-medium text-slate-800">
                              {opp.lastActivity || '05-10-2026 9:43:57 AM'}
                            </p>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] mt-0.5">
                              Today
                            </span>
                          </td>

                          {/* Close Date */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="text-[11px] font-medium text-slate-800">{closeDate}</p>
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#E0F2FE] text-[#0284C7] mt-0.5">
                              7 days
                            </span>
                          </td>

                          {/* Stage & Win Probability */}
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <span className={cn('px-2 py-0.5 rounded text-[10px] font-bold text-white', stageInfo.bg)}>
                                  {stageInfo.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className={cn('h-1.5 rounded-full', stageInfo.bar)}
                                    style={{ width: `${opp.probability || stageInfo.percent}%` }}
                                  />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">
                                  {opp.probability || stageInfo.percent}%
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Amount */}
                          <td className="py-3 px-3 text-right whitespace-nowrap font-bold text-slate-900 text-xs">
                            {(opp.amount || 0).toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>

                          {/* Actions (Settings Cog Dropdown) */}
                          <td className="py-3 px-3 text-center relative">
                            <div className="inline-block text-left" ref={actionDropdownRef}>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionDropdownId(
                                    openActionDropdownId === opp.id ? null : opp.id
                                  )
                                }
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-[#005B60] hover:bg-[#00474B] text-white text-[11px] font-bold transition cursor-pointer"
                              >
                                <SettingsIcon className="w-3 h-3" />
                                <ChevronDown className="w-2.5 h-2.5 stroke-[2.5]" />
                              </button>

                              {openActionDropdownId === opp.id && (
                                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded shadow-lg z-50 py-1 text-slate-800 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      setViewingOpp(opp);
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 font-medium"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      handleStartEdit(opp);
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 font-medium"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Edit Opportunity</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      window.location.href = `/manager/sales?tab=quotations&oppId=${opp.id}`;
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 font-medium text-blue-600"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                                    <span>Create Quotation</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionDropdownId(null);
                                      if (confirm(`Are you sure you want to delete opportunity "${opp.title}"?`)) {
                                        deleteOpportunity(opp.id);
                                        showToast(`Opportunity "${opp.title}" deleted.`);
                                      }
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 font-medium text-red-600 border-t border-slate-100"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600" />
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

            {/* Pagination Bar */}
            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                {Math.min(currentPage * rowsPerPage, filteredOpportunities.length)} of{' '}
                {filteredOpportunities.length} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      'w-7 h-7 rounded text-xs font-bold transition cursor-pointer',
                      currentPage === i + 1
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPPORTUNITY DETAIL MODAL (Quick View)                                     */}
      {/* ========================================================================= */}
      {viewingOpp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-xs">
            <div className="px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-slate-900">{viewingOpp.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingOpp(null)}
                className="w-5 h-5 bg-[#D9534F] text-white flex items-center justify-center rounded hover:bg-[#C9302C] cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Opportunity Code</p>
                  <p className="font-bold text-blue-600">{viewingOpp.opportunityCode || viewingOpp.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Deal Value</p>
                  <p className="font-extrabold text-slate-900">AED {(viewingOpp.amount || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Customer</p>
                  <p className="font-bold text-slate-800">{viewingOpp.customer}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Stage</p>
                  <p className="font-bold text-amber-700">{viewingOpp.stage}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Owner / Assigned To</p>
                  <p className="font-semibold text-slate-700">{viewingOpp.owner}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium text-[11px]">Close Date</p>
                  <p className="font-semibold text-slate-700">{viewingOpp.expectedClose || 'N/A'}</p>
                </div>
              </div>

              {viewingOpp.subtitle && (
                <div>
                  <p className="font-bold text-slate-700 text-[11px] mb-1">Remarks &amp; Scope:</p>
                  <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                    {viewingOpp.subtitle}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#F8FAFC] border-t border-slate-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewingOpp;
                  setViewingOpp(null);
                  handleStartEdit(target);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs cursor-pointer"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewingOpp(null)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded font-semibold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
