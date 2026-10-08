'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Clock,
  AlertCircle,
  PlayCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Video,
  Plus,
  Search,
  Trash2,
  Edit2,
  X,
  ChevronDown,
  UserCheck,
  Check,
  RotateCcw,
  FileSpreadsheet,
  MessageSquare,
  HardDrive,
  Menu,
  Info,
  Key,
  Shield,
  Settings,
  MoreVertical,
  ExternalLink,
  Book,
  Edit,
  Filter,
  MapPin,
  Wrench,
  List,
  User,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatDate, cn } from '@/lib/utils';
import { TaskType, TaskPriority, TaskStatus, CrmTask } from '@/types/enterprise-crm';

type TaskTab = 'all' | 'today' | 'pending' | 'progress' | 'overdue' | 'upcoming' | 'completed' | 'meeting';

function TasksContent() {
  const searchParams = useSearchParams();
  const initialView = (searchParams.get('view') || 'all') as TaskTab;

  const {
    tasks, addTask, updateTask, toggleTaskStatus, deleteTask,
    users, leads, addLead, customers, addCustomer,
    salesOpportunities, addOpportunity, campaigns, addCampaign,
    invoices, addInvoice
  } = useEnterpriseCrm();
  const currentUser = authMockService.getCurrentUser();
  const defaultUser = currentUser?.name || users[0]?.name || 'shaheer';

  // Active Tab
  const [activeTab, setActiveTab] = useState<TaskTab>(initialView);
  const [activeSubtype, setActiveSubtype] = useState<string>('ALL');
  const [showFilterSidebar, setShowFilterSidebar] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowFilterSidebar(true);
    }
  }, []);

  useEffect(() => {
    const viewParam = searchParams.get('view') as TaskTab;
    if (viewParam && ['all', 'today', 'pending', 'progress', 'overdue', 'upcoming', 'completed', 'meeting'].includes(viewParam)) {
      setActiveTab(viewParam);
      setActiveSubtype('ALL');
    }

    const taskIdParam = searchParams.get('id') || searchParams.get('taskId');
    if (taskIdParam && tasks.length > 0) {
      const match = tasks.find((t) => t.id === taskIdParam || t.slNo?.toString() === taskIdParam);
      if (match) {
        setViewingTaskInfo(match);
      }
    }
  }, [searchParams, tasks]);

  // Filters State
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('All Task');
  const [assigneeFilter, setAssigneeFilter] = useState('All Owners');
  const [typeFilter, setTypeFilter] = useState('All');
  const [createdByFilter, setCreatedByFilter] = useState('All');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Popovers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<CrmTask | null>(null);
  const [viewingTaskInfo, setViewingTaskInfo] = useState<CrmTask | null>(null);
  const [postponingTask, setPostponingTask] = useState<CrmTask | null>(null);
  const [postponeForm, setPostponeForm] = useState({
    dueDate: '',
    dueTime: '',
    comments: '',
    addNote: false,
    noteText: '',
  });
  const [changeStatusTask, setChangeStatusTask] = useState<CrmTask | null>(null);
  const [changeStatusForm, setChangeStatusForm] = useState({
    status: 'Pending',
    dueDate: '',
    dueTime: '06:00 PM',
    priority: 'Mid',
    comments: '',
    addNote: false,
    noteText: '',
  });
  const [actionMenuTaskId, setActionMenuTaskId] = useState<string | null>(null);

  // Add Form State
  const [formData, setFormData] = useState({
    assignee: { name: defaultUser },
    taskDetails: '',
    taskUnder: 'CTEQ#1041 770KG ICE MACHINE / FOCUS EMC KITCHENS LLC',
    taskType: 'Follow-up' as TaskType,
    dueDate: '2026-09-23',
    dueTime: '06:00 PM',
    priority: 'High' as TaskPriority,
    status: 'Pending' as TaskStatus,
    createdBy: defaultUser,
  });

  // Assign Task Form & Screen State
  const [assignForm, setAssignForm] = useState({
    targetAssignee: defaultUser,
    selectedTaskIds: [] as string[],
  });
  const [assignSortBy, setAssignSortBy] = useState('All Task');
  const [assignAssigneeFilter, setAssignAssigneeFilter] = useState('All Owners');
  const [assignTypeFilter, setAssignTypeFilter] = useState('All');
  const [assignCreatedByFilter, setAssignCreatedByFilter] = useState('All');
  const [assignStatusFilter, setAssignStatusFilter] = useState('All');
  const [assignDueDateFilter, setAssignDueDateFilter] = useState('');
  const [assignSearch, setAssignSearch] = useState('');
  const [assignPageSize, setAssignPageSize] = useState(10);
  const [assignCurrentPage, setAssignCurrentPage] = useState(1);
  const [assignTargetAssignee, setAssignTargetAssignee] = useState('');
  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);
  const [isTaskDropdownOpen, setIsTaskDropdownOpen] = useState(false);
  const [isPlusTaskDropdownOpen, setIsPlusTaskDropdownOpen] = useState(false);
  const [isAddGenericOpen, setIsAddGenericOpen] = useState(false);
  const [genericTemplate, setGenericTemplate] = useState('');
  const [isAddLeadTaskOpen, setIsAddLeadTaskOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [leadTemplate, setLeadTemplate] = useState('');
  const [isAddCustomerTaskOpen, setIsAddCustomerTaskOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerTemplate, setCustomerTemplate] = useState('');
  const [isAddOppTaskOpen, setIsAddOppTaskOpen] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState('');
  const [oppTemplate, setOppTemplate] = useState('');
  const [isAddContactTaskOpen, setIsAddContactTaskOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [contactTemplate, setContactTemplate] = useState('');
  const [isAddCampaignTaskOpen, setIsAddCampaignTaskOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [campaignTemplate, setCampaignTemplate] = useState('');
  const [isAddInvoiceTaskOpen, setIsAddInvoiceTaskOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [invoiceTemplate, setInvoiceTemplate] = useState('');

  // Task Templates State & Management (+ New Template functionality)
  const [customTemplates, setCustomTemplates] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_task_templates');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const baseTemplates = useMemo(() => [
    'Follow-up Template',
    'Customer Meeting',
    'Payment Reminder',
    'Product Demo',
    'Delivery Coordination',
    'Service Request',
    'General Enquiry',
    'Lead Qualification',
    'Site Inspection Call',
    'Quotation Discussion',
    'Demo Scheduling',
    'Closing Followup',
    'Price Quotation Call',
    'Technical Compliance Review',
    'Commercial Negotiation',
    'Payment Collection',
    'Delivery Followup',
    'Relationship Building Call',
    'Executive Meeting',
    'Technical Consultation',
    'Service Follow-up',
    'Campaign Outreach Call',
    'Email Marketing Review',
    'Lead Response Follow-up',
    'Promo Launch Action',
    'Payment Reminder Call',
    'Tax Invoice Submission',
    'Payment Collection Follow-up',
    'Overdue Invoice Escalation',
  ], []);

  const allTemplates = useMemo(() => {
    const combined = [...baseTemplates, ...customTemplates];
    return Array.from(new Set(combined.filter(Boolean)));
  }, [baseTemplates, customTemplates]);

  const [isAddTemplateModalOpen, setIsAddTemplateModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [targetTemplateField, setTargetTemplateField] = useState<'generic' | 'lead' | 'customer' | 'opp' | 'contact' | 'campaign' | 'invoice'>('generic');

  const handleSaveNewTemplate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTemplateName.trim();
    if (!trimmed) {
      alert('Please enter a template name');
      return;
    }
    if (!customTemplates.includes(trimmed) && !baseTemplates.includes(trimmed)) {
      const updated = [...customTemplates, trimmed];
      setCustomTemplates(updated);
      try {
        localStorage.setItem('cezcon_task_templates', JSON.stringify(updated));
      } catch (err) {}
    }

    if (targetTemplateField === 'generic') setGenericTemplate(trimmed);
    else if (targetTemplateField === 'lead') setLeadTemplate(trimmed);
    else if (targetTemplateField === 'customer') setCustomerTemplate(trimmed);
    else if (targetTemplateField === 'opp') setOppTemplate(trimmed);
    else if (targetTemplateField === 'contact') setContactTemplate(trimmed);
    else if (targetTemplateField === 'campaign') setCampaignTemplate(trimmed);
    else if (targetTemplateField === 'invoice') setInvoiceTemplate(trimmed);

    setNewTemplateName('');
    setIsAddTemplateModalOpen(false);
  };

  const renderAddTemplateModal = () => {
    if (!isAddTemplateModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
              <Plus className="w-4 h-4 text-blue-600" />
              <span>Add New Template</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsAddTemplateModalOpen(false);
                setNewTemplateName('');
              }}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSaveNewTemplate} className="p-5 space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Template Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="e.g., Warranty Followup, Site Inspection, Urgent Review"
                autoFocus
                required
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                This new template will be saved and immediately selectable across all task forms.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddTemplateModalOpen(false);
                  setNewTemplateName('');
                }}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Quick-Add States for Left Form Fields (Contact, Lead, Customer, Opportunity, Campaign, Invoice)
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactForm, setNewContactForm] = useState({ contactPerson: '', customerName: '', phone: '', email: '' });

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({ company: '', name: '', phone: '', email: '' });

  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ customerName: '', contactPerson: '', phone: '', email: '' });

  const [isAddOppModalOpen, setIsAddOppModalOpen] = useState(false);
  const [newOppForm, setNewOppForm] = useState({ title: '', customer: '', value: '25000' });

  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [newCampaignForm, setNewCampaignForm] = useState({ name: '', type: 'Email', budget: '5000' });

  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [newInvoiceForm, setNewInvoiceForm] = useState({ invoiceNumber: '', customer: '', amount: '7500' });

  const renderEntityModals = () => {
    return (
      <>
        {/* Add Contact Modal */}
        {isAddContactModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Contact</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newContactForm.contactPerson.trim()) {
                    alert('Please enter a contact name');
                    return;
                  }
                  const person = newContactForm.contactPerson.trim();
                  const comp = newContactForm.customerName.trim() || `${person} Enterprise`;
                  addCustomer({
                    customerName: comp,
                    contactPerson: person,
                    phone: newContactForm.phone.trim() || '+971 50 123 4567',
                    email: newContactForm.email.trim() || 'contact@client.com',
                    owner: defaultUser,
                    companyGroup: 'Commercial',
                    status: 'Active',
                    totalDeals: 0,
                    totalSpend: 0,
                    lastActivity: 'Contact added via Task quick add',
                  });
                  setSelectedContactId(person);
                  setNewContactForm({ contactPerson: '', customerName: '', phone: '', email: '' });
                  setIsAddContactModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newContactForm.contactPerson}
                    onChange={(e) => setNewContactForm({ ...newContactForm, contactPerson: e.target.value })}
                    placeholder="e.g., Tariq Al Mansoori"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    value={newContactForm.customerName}
                    onChange={(e) => setNewContactForm({ ...newContactForm, customerName: e.target.value })}
                    placeholder="e.g., Dubai Properties Group"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newContactForm.phone}
                      onChange={(e) => setNewContactForm({ ...newContactForm, phone: e.target.value })}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newContactForm.email}
                      onChange={(e) => setNewContactForm({ ...newContactForm, email: e.target.value })}
                      placeholder="tariq@client.com"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Contact</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Lead Modal */}
        {isAddLeadModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Lead</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddLeadModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newLeadForm.company.trim() && !newLeadForm.name.trim()) {
                    alert('Please enter Company or Contact Name');
                    return;
                  }
                  const leadId = `lead-${Date.now()}`;
                  addLead({
                    leadDate: new Date().toISOString().split('T')[0],
                    leadSpecification: 'Created via Task Quick Add',
                    contactDetails: {
                      company: newLeadForm.company.trim() || newLeadForm.name.trim(),
                      name: newLeadForm.name.trim() || newLeadForm.company.trim(),
                      phone: newLeadForm.phone.trim() || '+971 50 123 4567',
                      email: newLeadForm.email.trim() || 'lead@client.com',
                    },
                    owner: defaultUser,
                    leadAssigned: { name: defaultUser },
                    createdBy: defaultUser,
                    rating: 'Warm',
                    value: 25000,
                    source: 'Direct',
                    status: 'New',
                    lastActivity: 'Lead created via Task quick add',
                    lastActivityDate: new Date().toISOString().split('T')[0],
                  });
                  setSelectedLeadId(leadId);
                  setNewLeadForm({ company: '', name: '', phone: '', email: '' });
                  setIsAddLeadModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Business Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.company}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                    placeholder="e.g., Al Futtaim Real Estate"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    placeholder="e.g., Karim Salem"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      placeholder="+971 50 000 0000"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      placeholder="info@alfuttaim.com"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddLeadModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Lead</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Customer Modal */}
        {isAddCustomerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Customer</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCustomerForm.customerName.trim()) {
                    alert('Please enter Customer Name');
                    return;
                  }
                  const custId = `cust-${Date.now()}`;
                  addCustomer({
                    customerName: newCustomerForm.customerName.trim(),
                    contactPerson: newCustomerForm.contactPerson.trim() || 'Manager',
                    phone: newCustomerForm.phone.trim() || '+971 50 123 4567',
                    email: newCustomerForm.email.trim() || 'info@customer.com',
                    owner: defaultUser,
                    companyGroup: 'Commercial',
                    status: 'Active',
                    totalDeals: 0,
                    totalSpend: 0,
                    lastActivity: 'Customer created via Task quick add',
                  });
                  setSelectedCustomerId(custId);
                  setNewCustomerForm({ customerName: '', contactPerson: '', phone: '', email: '' });
                  setIsAddCustomerModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.customerName}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, customerName: e.target.value })}
                    placeholder="e.g., Al Habtoor Trading LLC"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={newCustomerForm.contactPerson}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, contactPerson: e.target.value })}
                    placeholder="e.g., Rashid Al Nuaimi"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={newCustomerForm.phone}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                      placeholder="+971 50 000 0000"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newCustomerForm.email}
                      onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                      placeholder="rashid@habtoor.com"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Customer</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Opportunity Modal */}
        {isAddOppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Opportunity / Order</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddOppModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newOppForm.title.trim()) {
                    alert('Please enter Opportunity Title');
                    return;
                  }
                  const oppId = `opp-${Date.now()}`;
                  const code = `OPP-${Date.now().toString().slice(-4)}`;
                  addOpportunity({
                    opportunityCode: code,
                    title: newOppForm.title.trim(),
                    customer: newOppForm.customer.trim() || 'General Client LLC',
                    amount: Number(newOppForm.value || 0),
                    stage: 'Opportunity',
                    probability: 50,
                    owner: defaultUser,
                    expectedClose: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  });
                  setSelectedOppId(oppId);
                  setNewOppForm({ title: '', customer: '', value: '25000' });
                  setIsAddOppModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Opportunity / Order Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newOppForm.title}
                    onChange={(e) => setNewOppForm({ ...newOppForm, title: e.target.value })}
                    placeholder="e.g., 500KG Ice Flaker Machine supply"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newOppForm.customer}
                    onChange={(e) => setNewOppForm({ ...newOppForm, customer: e.target.value })}
                    placeholder="e.g., DAMAC Properties"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expected Value (AED)
                  </label>
                  <input
                    type="number"
                    value={newOppForm.value}
                    onChange={(e) => setNewOppForm({ ...newOppForm, value: e.target.value })}
                    placeholder="25000"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOppModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Opportunity</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Campaign Modal */}
        {isAddCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Campaign</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddCampaignModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCampaignForm.name.trim()) {
                    alert('Please enter Campaign Name');
                    return;
                  }
                  const cmpId = `cmp-${Date.now()}`;
                  addCampaign({
                    name: newCampaignForm.name.trim(),
                    type: newCampaignForm.type || 'Email',
                    status: 'Active',
                    budget: Number(newCampaignForm.budget || 0),
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    owner: { name: defaultUser },
                  });
                  setSelectedCampaignId(cmpId);
                  setNewCampaignForm({ name: '', type: 'Email', budget: '5000' });
                  setIsAddCampaignModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Campaign Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCampaignForm.name}
                    onChange={(e) => setNewCampaignForm({ ...newCampaignForm, name: e.target.value })}
                    placeholder="e.g., Summer Cooling Equipment Expo 2026"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Type</label>
                    <select
                      value={newCampaignForm.type}
                      onChange={(e) => setNewCampaignForm({ ...newCampaignForm, type: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="Email">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="Social">Social</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Budget (AED)</label>
                    <input
                      type="number"
                      value={newCampaignForm.budget}
                      onChange={(e) => setNewCampaignForm({ ...newCampaignForm, budget: e.target.value })}
                      placeholder="5000"
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddCampaignModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Campaign</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Invoice Modal */}
        {isAddInvoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
              <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-tight">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>+ New Invoice</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddInvoiceModalOpen(false)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const invNum = newInvoiceForm.invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`;
                  const invId = `inv-${Date.now()}`;
                  const numAmt = Number(newInvoiceForm.amount || 0);
                  addInvoice({
                    slNo: Date.now() % 10000,
                    invoiceNumber: invNum,
                    customer: newInvoiceForm.customer.trim() || 'General Client LLC',
                    status: 'Unpaid',
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    amount: numAmt,
                    subtotal: numAmt,
                    vatAmount: numAmt * 0.05,
                    totalAmount: numAmt * 1.05,
                    paidAmount: 0,
                    balanceAmount: numAmt * 1.05,
                    owner: defaultUser,
                  });
                  setSelectedInvoiceId(invId);
                  setNewInvoiceForm({ invoiceNumber: '', customer: '', amount: '7500' });
                  setIsAddInvoiceModalOpen(false);
                }}
                className="p-5 space-y-3.5 text-xs"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invoice Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newInvoiceForm.invoiceNumber}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, invoiceNumber: e.target.value })}
                    placeholder="e.g., INV-2026-0099"
                    autoFocus
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    value={newInvoiceForm.customer}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, customer: e.target.value })}
                    placeholder="e.g., EMAAR Properties PJSC"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount (AED)
                  </label>
                  <input
                    type="number"
                    value={newInvoiceForm.amount}
                    onChange={(e) => setNewInvoiceForm({ ...newInvoiceForm, amount: e.target.value })}
                    placeholder="7500"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddInvoiceModalOpen(false)}
                    className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Invoice</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    );
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = () => {
      setActionMenuTaskId(null);
      setIsTaskDropdownOpen(false);
      setIsPlusTaskDropdownOpen(false);
    };
    if (actionMenuTaskId || isTaskDropdownOpen || isPlusTaskDropdownOpen) {
      window.addEventListener('click', handleClickOutside);
      return () => window.removeEventListener('click', handleClickOutside);
    }
  }, [actionMenuTaskId, isTaskDropdownOpen, isPlusTaskDropdownOpen]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setSortBy('All Task');
    setAssigneeFilter('All Owners');
    setTypeFilter('All');
    setCreatedByFilter('All');
    setActiveSubtype('ALL');
    setCurrentPage(1);
  };

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (sortBy !== 'All Task') count++;
    if (assigneeFilter !== 'All Owners') count++;
    if (typeFilter !== 'All') count++;
    if (createdByFilter !== 'All') count++;
    return count;
  }, [sortBy, assigneeFilter, typeFilter, createdByFilter]);

  // Retain all real tasks (do not aggressively purge user-created tasks)
  const cleanTasks = useMemo(() => {
    return tasks.filter((t) => {
      const title = (t.taskDetails || t.title || '').trim().toLowerCase();
      const isGibberish =
        (t.assignedBy?.includes('Alex Rivera') && (title.includes('qewrty') || title.includes('efwregv')));
      return !isGibberish;
    });
  }, [tasks]);

  // Tab counts based on real tasks
  const counts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      all: cleanTasks.length,
      today: cleanTasks.filter((t) => t.dueDate === today || t.createdAt?.startsWith(today)).length,
      pending: cleanTasks.filter((t) => t.status === 'Pending' || t.status === 'Assigned' || t.status === 'Accepted').length,
      progress: cleanTasks.filter((t) => t.status === 'In Progress').length,
      overdue: cleanTasks.filter((t) => t.status === 'Overdue' || (t.status !== 'Completed' && t.status !== 'Reviewed' && t.dueDate && t.dueDate < today)).length,
      upcoming: cleanTasks.filter((t) => t.status === 'Upcoming' || (t.dueDate && t.dueDate > today)).length,
      completed: cleanTasks.filter((t) => t.status === 'Completed' || t.status === 'Reviewed').length,
      meeting: cleanTasks.filter((t) => t.taskType === 'Meeting' || t.taskType === 'Demo').length,
    };
  }, [cleanTasks]);

  // Meeting specific grouped datasets
  const todayMeetings = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return cleanTasks.filter(
      (t) => (t.taskType === 'Meeting' || t.taskType === 'Demo') && (t.dueDate === today || t.createdAt?.startsWith(today))
    );
  }, [cleanTasks]);

  const tomorrowMeetings = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return cleanTasks.filter(
      (t) => (t.taskType === 'Meeting' || t.taskType === 'Demo') && t.dueDate === tomorrowStr
    );
  }, [cleanTasks]);

  const laterMeetings = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return cleanTasks.filter(
      (t) => (t.taskType === 'Meeting' || t.taskType === 'Demo') && t.dueDate && t.dueDate > tomorrowStr
    );
  }, [cleanTasks]);

  // Tab Labels
  const tabTitles: Record<TaskTab, string> = {
    all: 'All Tasks',
    today: 'Task Today',
    pending: 'Task Pending',
    progress: 'Task In Progress',
    overdue: 'Task Overdue',
    upcoming: 'Task Upcoming',
    completed: 'Task Completed',
    meeting: 'Task Meeting',
  };

  // Subtype counts for the currently active tab
  const subtypeCounts = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentTabTasks = cleanTasks.filter((task) => {
      if (activeTab === 'all') return true;
      if (activeTab === 'today') return task.dueDate === today || task.createdAt?.startsWith(today);
      if (activeTab === 'pending') return task.status === 'Pending' || task.status === 'Assigned' || task.status === 'Accepted';
      if (activeTab === 'progress') return task.status === 'In Progress';
      if (activeTab === 'overdue') return task.status === 'Overdue' || (task.status !== 'Completed' && task.status !== 'Reviewed' && task.dueDate && task.dueDate < today);
      if (activeTab === 'upcoming') return task.status === 'Upcoming' || (task.dueDate && task.dueDate > today);
      if (activeTab === 'completed') return task.status === 'Completed' || task.status === 'Reviewed';
      if (activeTab === 'meeting') return task.taskType === 'Meeting' || task.taskType === 'Demo';
      return true;
    });

    return {
      all: currentTabTasks.length,
      followup: currentTabTasks.filter((t) => t.taskType === 'Follow-up' || t.taskType === 'Followup' || t.taskType === 'Service Order').length,
      call: currentTabTasks.filter((t) => t.taskType === 'Call').length,
      meeting: currentTabTasks.filter((t) => t.taskType === 'Meeting' || t.taskType === 'Demo').length,
      review: currentTabTasks.filter((t) => t.taskType === 'Review' || t.taskType === 'Document').length,
    };
  }, [cleanTasks, activeTab]);

  // Filter Tasks by Active Tab + Subtype + Form Filters
  const filteredTasks = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return cleanTasks
      .filter((task) => {
        // Tab Filtering
        if (activeTab === 'all') {
          // Show all tasks
        } else if (activeTab === 'today') {
          if (task.dueDate !== today && !task.createdAt?.startsWith(today)) return false;
        } else if (activeTab === 'pending') {
          if (task.status !== 'Pending' && task.status !== 'Assigned' && task.status !== 'Accepted') return false;
        } else if (activeTab === 'progress') {
          if (task.status !== 'In Progress') return false;
        } else if (activeTab === 'overdue') {
          if (task.status !== 'Overdue' && (task.status === 'Completed' || task.status === 'Reviewed' || !task.dueDate || task.dueDate >= today)) return false;
        } else if (activeTab === 'upcoming') {
          if (task.status !== 'Upcoming' && (!task.dueDate || task.dueDate <= today)) return false;
        } else if (activeTab === 'completed') {
          if (task.status !== 'Completed' && task.status !== 'Reviewed') return false;
        } else if (activeTab === 'meeting') {
          if (task.taskType !== 'Meeting' && task.taskType !== 'Demo') return false;
        }

        // Subtype Filtering
        if (activeSubtype === 'Followup') {
          if (task.taskType !== 'Follow-up' && task.taskType !== 'Followup' && task.taskType !== 'Service Order') return false;
        } else if (activeSubtype === 'Call') {
          if (task.taskType !== 'Call') return false;
        } else if (activeSubtype === 'Meeting') {
          if (task.taskType !== 'Meeting' && task.taskType !== 'Demo') return false;
        }

        // Search Query
        if (search) {
          const q = search.toLowerCase();
          const match =
            (task.taskDetails || '').toLowerCase().includes(q) ||
            (task.taskUnder || '').toLowerCase().includes(q) ||
            (task.customer || '').toLowerCase().includes(q) ||
            (task.assignee?.name || '').toLowerCase().includes(q) ||
            (task.assignedEmployee || '').toLowerCase().includes(q) ||
            (task.department || '').toLowerCase().includes(q) ||
            (task.location || '').toLowerCase().includes(q);
          if (!match) return false;
        }

        // Assignee Filter
        if (assigneeFilter !== 'All Owners') {
          const repName = task.assignedEmployee || task.assignee?.name;
          if (repName !== assigneeFilter) return false;
        }

        // Task Type Filter
        if (typeFilter !== 'All' && task.taskType !== typeFilter) {
          return false;
        }

        // Created By Filter
        if (createdByFilter !== 'All' && task.createdBy !== createdByFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Priority') {
          const pMap: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
          return (pMap[b.priority] || 1) - (pMap[a.priority] || 1);
        }
        if (sortBy === 'Assignee') {
          return (a.assignee?.name || '').localeCompare(b.assignee?.name || '');
        }
        return new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime();
      });
  }, [cleanTasks, activeTab, activeSubtype, search, assigneeFilter, typeFilter, createdByFilter, sortBy]);

  // Pagination
  const totalEntries = filteredTasks.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Form Handlers
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.taskDetails) return;
    addTask(formData);
    setIsAddModalOpen(false);
    setFormData({
      assignee: { name: defaultUser },
      taskDetails: '',
      taskUnder: 'CTEQ#1041 770KG ICE MACHINE / FOCUS EMC KITCHENS LLC',
      taskType: 'Follow-up',
      dueDate: '2026-09-23',
      dueTime: '06:00 PM',
      priority: 'High',
      status: 'Pending',
      createdBy: defaultUser,
    });
  };

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    updateTask(editingTask.id, editingTask);
    if (viewingTaskInfo && viewingTaskInfo.id === editingTask.id) {
      setViewingTaskInfo(editingTask);
    }
    setEditingTask(null);
  };

  const handleOpenPostpone = (task: CrmTask) => {
    setPostponingTask(task);
    setPostponeForm({
      dueDate: task.dueDate || '',
      dueTime: task.dueTime || '',
      comments: task.description || '',
      addNote: false,
      noteText: '',
    });
  };

  const handleConfirmPostpone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponingTask || !postponeForm.dueDate) return;
    const updates: Partial<CrmTask> = {
      dueDate: postponeForm.dueDate,
    };
    if (postponeForm.dueTime) {
      updates.dueTime = postponeForm.dueTime;
    }
    if (postponeForm.comments) {
      updates.description = postponeForm.comments;
    }
    if (postponeForm.addNote && postponeForm.noteText) {
      updates.description = (updates.description ? `${updates.description}\n` : '') + `[Note]: ${postponeForm.noteText}`;
    }
    updateTask(postponingTask.id, updates);
    if (viewingTaskInfo && viewingTaskInfo.id === postponingTask.id) {
      setViewingTaskInfo({ ...viewingTaskInfo, ...updates });
    }
    setPostponingTask(null);
  };

  const renderPostponeModal = () => {
    if (!postponingTask) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="fixed inset-0" onClick={() => setPostponingTask(null)} />
        <div className="relative z-10 bg-white rounded-lg border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden text-xs">
          {/* Header */}
          <div className="border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Postpone Task</h3>
            <button
              type="button"
              onClick={() => setPostponingTask(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 text-base leading-none"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleConfirmPostpone} className="p-6 space-y-4">
            {/* Due Date * */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <div className="col-span-9 relative flex items-center">
                <input
                  type="date"
                  required
                  placeholder="Task Due Date"
                  value={postponeForm.dueDate}
                  onChange={(e) => setPostponeForm({ ...postponeForm, dueDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs pr-9"
                />
                <div className="absolute right-0 top-0 bottom-0 px-2.5 bg-slate-100 border-l border-slate-300 flex items-center justify-center rounded-r text-slate-600 pointer-events-none">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Time */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Time
              </label>
              <div className="col-span-9 relative flex items-center">
                <input
                  type="text"
                  placeholder="--:-- --"
                  value={postponeForm.dueTime}
                  onChange={(e) => setPostponeForm({ ...postponeForm, dueTime: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs pr-14"
                />
                <div className="absolute right-2 flex items-center gap-1.5">
                  {postponeForm.dueTime && (
                    <button
                      type="button"
                      onClick={() => setPostponeForm({ ...postponeForm, dueTime: '' })}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <Clock className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className="grid grid-cols-12 gap-3 items-start">
              <label className="col-span-3 text-xs font-semibold text-slate-700 pt-1.5">
                Comments
              </label>
              <div className="col-span-9">
                <textarea
                  rows={2}
                  value={postponeForm.comments}
                  onChange={(e) => setPostponeForm({ ...postponeForm, comments: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y shadow-2xs"
                />
              </div>
            </div>

            {/* Add Note */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Add Note
              </label>
              <div className="col-span-9 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addNoteCheckbox"
                  checked={postponeForm.addNote}
                  onChange={(e) => setPostponeForm({ ...postponeForm, addNote: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                {postponeForm.addNote && (
                  <input
                    type="text"
                    placeholder="Enter note..."
                    value={postponeForm.noteText}
                    onChange={(e) => setPostponeForm({ ...postponeForm, noteText: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPostponingTask(null)}
                className="px-4 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#002B49] hover:bg-[#001E33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ── CHANGE TASK STATUS MODAL (Matches Cezcon CRM Screenshot 1) ───────
  const handleOpenChangeStatus = (task: CrmTask) => {
    let mappedStatus = 'Pending';
    const stLower = (task.status || '').toLowerCase();
    if (stLower.includes('progress')) mappedStatus = 'Progress';
    else if (stLower.includes('complete') || stLower.includes('reviewed')) mappedStatus = 'Completed';
    else mappedStatus = 'Pending';

    let mappedPriority = 'Mid';
    const prLower = (task.priority || '').toLowerCase();
    if (prLower === 'low') mappedPriority = 'Low';
    else if (prLower === 'high' || prLower === 'urgent') mappedPriority = 'High';
    else mappedPriority = 'Mid';

    setChangeStatusTask(task);
    setChangeStatusForm({
      status: mappedStatus,
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      dueTime: task.dueTime || '06:00 PM',
      priority: mappedPriority,
      comments: task.description || '',
      addNote: false,
      noteText: '',
    });
  };

  const handleUpdateChangeStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!changeStatusTask) return;

    let targetStatus: TaskStatus = 'Pending';
    if (changeStatusForm.status === 'Progress') targetStatus = 'In Progress';
    else if (changeStatusForm.status === 'Completed') targetStatus = 'Completed';
    else targetStatus = 'Pending';

    let targetPriority: TaskPriority = 'Medium';
    if (changeStatusForm.priority === 'Low') targetPriority = 'Low';
    else if (changeStatusForm.priority === 'High') targetPriority = 'High';
    else targetPriority = 'Medium';

    const updates: Partial<CrmTask> = {
      status: targetStatus,
      priority: targetPriority,
      dueDate: changeStatusForm.dueDate,
      dueTime: changeStatusForm.dueTime,
    };

    if (targetStatus === 'Completed') {
      updates.progress = 100;
    } else if (targetStatus === 'In Progress') {
      updates.progress = 50;
    }

    if (changeStatusForm.comments) {
      updates.description = changeStatusForm.comments;
    }

    if (changeStatusForm.addNote && changeStatusForm.noteText) {
      updates.description =
        (updates.description ? `${updates.description}\n` : '') + `[Note]: ${changeStatusForm.noteText}`;
    }

    updateTask(changeStatusTask.id, updates);
    if (viewingTaskInfo && viewingTaskInfo.id === changeStatusTask.id) {
      setViewingTaskInfo({ ...viewingTaskInfo, ...updates });
    }
    setChangeStatusTask(null);
  };

  const renderChangeStatusModal = () => {
    if (!changeStatusTask) return null;
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
        <div className="fixed inset-0" onClick={() => setChangeStatusTask(null)} />
        <div className="relative z-10 bg-white rounded-lg border border-slate-300 max-w-lg w-full shadow-2xl overflow-hidden text-xs">
          {/* Header */}
          <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base">Change Task Status</h3>
            <button
              type="button"
              onClick={() => setChangeStatusTask(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5 text-lg leading-none transition-colors"
              title="Close"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleUpdateChangeStatus} className="p-6 space-y-4">
            {/* Status (Segmented Buttons: Pending, Progress, Completed) */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Status
              </label>
              <div className="col-span-9 flex items-center gap-1.5">
                {(['Pending', 'Progress', 'Completed'] as const).map((st) => {
                  const isSelected = changeStatusForm.status === st;
                  const activeColor =
                    st === 'Pending'
                      ? 'bg-[#F5A623] text-white shadow-2xs font-bold'
                      : st === 'Progress'
                      ? 'bg-[#0284C7] text-white shadow-2xs font-bold'
                      : 'bg-[#10B981] text-white shadow-2xs font-bold';

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setChangeStatusForm({ ...changeStatusForm, status: st })}
                      className={`px-3.5 py-1 text-xs font-medium rounded-xs cursor-pointer transition-colors ${
                        isSelected
                          ? activeColor
                          : 'bg-[#EAEFF5] text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Due Date & Time */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Due Date
              </label>
              <div className="col-span-9 grid grid-cols-2 gap-2">
                {/* Date Input */}
                <div className="relative flex items-center">
                  <input
                    type="date"
                    required
                    value={changeStatusForm.dueDate}
                    onChange={(e) => setChangeStatusForm({ ...changeStatusForm, dueDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs pr-12"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1 text-slate-400">
                    {changeStatusForm.dueDate && (
                      <button
                        type="button"
                        onClick={() => setChangeStatusForm({ ...changeStatusForm, dueDate: '' })}
                        className="hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <Calendar className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                {/* Time Input */}
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="06:00 PM"
                    value={changeStatusForm.dueTime}
                    onChange={(e) => setChangeStatusForm({ ...changeStatusForm, dueTime: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs pr-12"
                  />
                  <div className="absolute right-1.5 flex items-center gap-1 text-slate-400">
                    {changeStatusForm.dueTime && (
                      <button
                        type="button"
                        onClick={() => setChangeStatusForm({ ...changeStatusForm, dueTime: '' })}
                        className="hover:text-slate-600 cursor-pointer p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                    <Clock className="w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Priority (Segmented Buttons: Low, Mid, High) */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Priority
              </label>
              <div className="col-span-9 flex items-center gap-1.5">
                {(['Low', 'Mid', 'High'] as const).map((pr) => {
                  const isSelected = changeStatusForm.priority === pr;
                  const activeColor =
                    pr === 'Low'
                      ? 'bg-[#0284C7] text-white shadow-2xs font-bold'
                      : pr === 'Mid'
                      ? 'bg-[#F5A623] text-white shadow-2xs font-bold'
                      : 'bg-[#DC2626] text-white shadow-2xs font-bold';

                  return (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => setChangeStatusForm({ ...changeStatusForm, priority: pr })}
                      className={`px-3.5 py-1 text-xs font-medium rounded-xs cursor-pointer transition-colors ${
                        isSelected
                          ? activeColor
                          : 'bg-[#EAEFF5] text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {pr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comments */}
            <div className="grid grid-cols-12 gap-3 items-start">
              <label className="col-span-3 text-xs font-semibold text-slate-700 pt-1.5">
                Comments
              </label>
              <div className="col-span-9">
                <textarea
                  rows={3}
                  value={changeStatusForm.comments}
                  onChange={(e) => setChangeStatusForm({ ...changeStatusForm, comments: e.target.value })}
                  placeholder=""
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-y shadow-2xs"
                />
              </div>
            </div>

            {/* Add Note */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-semibold text-slate-700">
                Add Note
              </label>
              <div className="col-span-9 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="changeStatusAddNoteCheckbox"
                  checked={changeStatusForm.addNote}
                  onChange={(e) => setChangeStatusForm({ ...changeStatusForm, addNote: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                {changeStatusForm.addNote && (
                  <input
                    type="text"
                    placeholder="Enter note..."
                    value={changeStatusForm.noteText}
                    onChange={(e) => setChangeStatusForm({ ...changeStatusForm, noteText: e.target.value })}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  />
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setChangeStatusTask(null)}
                className="px-4 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded bg-[#002B49] hover:bg-[#001E33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const handleBulkAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.targetAssignee) return;
    assignForm.selectedTaskIds.forEach((id) => {
      updateTask(id, { assignee: { name: assignForm.targetAssignee } });
    });
    setIsAssignModalOpen(false);
    setAssignForm({ targetAssignee: defaultUser, selectedTaskIds: [] });
  };

  // ── FULL PAGE ASSIGN TASKS VIEW (Matches Cezcon CRM Reference) ───────
  if (isAssignModalOpen) {
    const assignFilteredTasks = tasks.filter((task) => {
      if (assignAssigneeFilter !== 'All Owners' && task.assignee.name !== assignAssigneeFilter) return false;
      if (assignTypeFilter !== 'All' && task.taskType !== assignTypeFilter) return false;
      if (assignCreatedByFilter !== 'All' && task.createdBy !== assignCreatedByFilter) return false;
      if (assignStatusFilter !== 'All' && task.status !== assignStatusFilter) return false;
      if (assignDueDateFilter && task.dueDate !== assignDueDateFilter) return false;
      if (assignSearch) {
        const q = assignSearch.toLowerCase();
        const match =
          task.taskDetails?.toLowerCase().includes(q) ||
          task.taskUnder?.toLowerCase().includes(q) ||
          task.assignee?.name?.toLowerCase().includes(q) ||
          task.slNo?.toString().includes(q);
        if (!match) return false;
      }
      return true;
    });

    const assignTotalPages = Math.ceil(assignFilteredTasks.length / assignPageSize) || 1;
    const assignPaginatedTasks = assignFilteredTasks.slice(
      (assignCurrentPage - 1) * assignPageSize,
      assignCurrentPage * assignPageSize
    );

    const isAllAssignSelected =
      assignPaginatedTasks.length > 0 &&
      assignPaginatedTasks.every((t) => assignSelectedIds.includes(t.id));

    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800 animate-in fade-in duration-150">
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Assign Tasks</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Filter Card */}
            <div className="border border-slate-200 rounded p-4 bg-white shadow-2xs space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-3">
                {/* Row 1, Col 1: Sort By */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Sort By</label>
                  <select
                    value={assignSortBy}
                    onChange={(e) => setAssignSortBy(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All Task">All Task</option>
                    <option value="Due Date Asc">Due Date (Earliest)</option>
                    <option value="Due Date Desc">Due Date (Latest)</option>
                    <option value="Priority">Priority</option>
                  </select>
                </div>

                {/* Row 1, Col 2: Assignee */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Assignee</label>
                  <select
                    value={assignAssigneeFilter}
                    onChange={(e) => setAssignAssigneeFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All Owners">All Owners</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 1, Col 3: Task Type */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Task Type</label>
                  <select
                    value={assignTypeFilter}
                    onChange={(e) => setAssignTypeFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Follow-up">Followup</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Lead">Lead</option>
                    <option value="Customer">Customer</option>
                    <option value="Opportunity">Opportunity</option>
                    <option value="Campaign">Campaign</option>
                  </select>
                </div>

                {/* Row 2, Col 1: Created By */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Created By</label>
                  <select
                    value={assignCreatedByFilter}
                    onChange={(e) => setAssignCreatedByFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                {/* Row 2, Col 2: Task Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Task Status</label>
                  <select
                    value={assignStatusFilter}
                    onChange={(e) => setAssignStatusFilter(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Row 2, Col 3: Task Due */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">Task Due</label>
                  <div className="flex-1 relative">
                    <input
                      type="date"
                      value={assignDueDateFilter}
                      onChange={(e) => setAssignDueDateFilter(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Load Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setAssignCurrentPage(1)}
                  className="px-4 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Search className="w-3 h-3" />
                  <span>Load</span>
                </button>
              </div>
            </div>

            {/* Table Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <span>Shows</span>
                <select
                  value={assignPageSize}
                  onChange={(e) => {
                    setAssignPageSize(Number(e.target.value));
                    setAssignCurrentPage(1);
                  }}
                  className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search Task"
                  value={assignSearch}
                  onChange={(e) => {
                    setAssignSearch(e.target.value);
                    setAssignCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Tasks Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded">
              <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                <thead className="bg-[#FAFBFD] border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-14 text-center whitespace-nowrap">SL.NO</th>
                    <th className="py-2.5 px-2 w-20 text-center whitespace-nowrap">ASSIGNEE</th>
                    <th className="py-2.5 px-3 min-w-[260px]">TASK DETAILS</th>
                    <th className="py-2.5 px-3 min-w-[220px]">TASK UNDER</th>
                    <th className="py-2.5 px-3 w-28 whitespace-nowrap">TASK TYPE</th>
                    <th className="py-2.5 px-3 w-32 whitespace-nowrap text-left sm:text-center">DUE DATE</th>
                    <th className="py-2.5 px-2 w-20 text-center whitespace-nowrap">PRIORITY</th>
                    <th className="py-2.5 px-2 w-20 text-center whitespace-nowrap">STATUS</th>
                    <th className="py-2.5 px-3 w-24 text-center whitespace-nowrap">
                      <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isAllAssignSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const newIds = Array.from(
                                new Set([...assignSelectedIds, ...assignPaginatedTasks.map((t) => t.id)])
                              );
                              setAssignSelectedIds(newIds);
                            } else {
                              setAssignSelectedIds(
                                assignSelectedIds.filter((id) => !assignPaginatedTasks.some((t) => t.id === id))
                              );
                            }
                          }}
                          className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span className="text-[10px] uppercase font-bold text-slate-600">SELECT ALL</span>
                      </label>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignPaginatedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    assignPaginatedTasks.map((task, idx) => {
                      const slNo = (assignCurrentPage - 1) * assignPageSize + idx + 1;
                      const isSelected = assignSelectedIds.includes(task.id);
                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{slNo}</td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-2xs">
                                {task.assignee.name ? task.assignee.name[0] : 'U'}
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-start gap-1.5">
                              <p
                                className="text-[#0284C7] hover:underline font-normal leading-snug flex-1 cursor-pointer text-xs"
                                onClick={() => setViewingTaskInfo(task)}
                              >
                                {task.taskDetails}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingTaskInfo(task)}
                                className="text-[#0284C7] hover:text-[#0369A1] p-0.5 flex-shrink-0 cursor-pointer"
                                title="View Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 text-xs">{task.taskUnder || '—'}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-xs">
                            {task.taskType === 'Follow-up' ? 'Followup' : task.taskType}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px] text-left sm:text-center">
                            <div>{task.dueDate}</div>
                            <div className="text-[10px] text-slate-500">{task.dueTime}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white shadow-2xs">
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{task.priority === 'High' ? 'High' : 'Mid'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white shadow-2xs">
                              {task.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setAssignSelectedIds([...assignSelectedIds, task.id]);
                                } else {
                                  setAssignSelectedIds(assignSelectedIds.filter((id) => id !== task.id));
                                }
                              }}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 pt-1">
              <div>
                Showing {assignFilteredTasks.length > 0 ? (assignCurrentPage - 1) * assignPageSize + 1 : 0} to{' '}
                {Math.min(assignCurrentPage * assignPageSize, assignFilteredTasks.length)} of {assignFilteredTasks.length} entries
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={assignCurrentPage === 1}
                  onClick={() => setAssignCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  «
                </button>
                {Array.from({ length: Math.min(5, assignTotalPages) }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setAssignCurrentPage(pg)}
                    className={`px-2.5 py-1 border rounded text-xs font-semibold cursor-pointer shadow-2xs ${
                      assignCurrentPage === pg
                        ? 'bg-[#007EA7] border-[#007EA7] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={assignCurrentPage === assignTotalPages}
                  onClick={() => setAssignCurrentPage((p) => Math.min(assignTotalPages, p + 1))}
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold hover:bg-slate-50 disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  »
                </button>
              </div>
            </div>

            {/* Bottom Assign Bar */}
            <div className="pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Assign To Dropdown */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-700 shrink-0">
                  Assign To <span className="text-red-600 font-bold">*</span>
                </label>
                <select
                  value={assignTargetAssignee}
                  onChange={(e) => setAssignTargetAssignee(e.target.value)}
                  className="w-64 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                >
                  <option value="">Select</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (!assignTargetAssignee) {
                      alert('Please select an assignee from the dropdown');
                      return;
                    }
                    if (assignSelectedIds.length === 0) {
                      alert('Please select at least one task using the checkboxes');
                      return;
                    }
                    assignSelectedIds.forEach((id) => {
                      updateTask(id, { assignee: { name: assignTargetAssignee } });
                    });
                    alert(`${assignSelectedIds.length} tasks successfully reassigned to ${assignTargetAssignee}!`);
                    setAssignSelectedIds([]);
                    setAssignTargetAssignee('');
                    setIsAssignModalOpen(false);
                  }}
                  className="px-4 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Assign</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1"
                >
                  <span>←</span>
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── FULL PAGE EDIT TASK VIEW (Matches Cezcon CRM Reference) ─────────
  if (editingTask) {
    const oppName = editingTask.taskUnder?.split(' / ')[0] || editingTask.taskUnder || '770KG ICE MACHINE';
    return (
      <div className="space-y-3.5 pb-28 sm:pb-32 w-full animate-in fade-in duration-150">
        <form onSubmit={handleUpdateTask} className="bg-white rounded-lg border border-slate-300 shadow-sm flex flex-col text-xs overflow-hidden">
          {/* Top Header */}
          <div className="bg-[#EAEFF5] border-b border-slate-300 px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <span>Edit Task</span>
            </div>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="w-5 h-5 rounded bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors cursor-pointer font-black text-xs shadow-2xs flex-shrink-0"
              title="Close"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-7 space-y-6">
            {/* Opportunity Strip */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0284C7]">
              <Info className="w-4 h-4 text-[#0284C7] flex-shrink-0" />
              <span className="text-slate-800">Opportunity:</span>
              <span className="text-[#0284C7] uppercase">{oppName}</span>
            </div>

            {/* 2-Column Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Assignee */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Assignee
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={editingTask.assignee.name}
                      onChange={(e) => setEditingTask({ ...editingTask, assignee: { name: e.target.value } })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Type * */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={editingTask.taskType === 'Follow-up' ? 'Followup' : editingTask.taskType}
                      onChange={(e) => setEditingTask({ ...editingTask, taskType: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      <option value="Followup">Followup</option>
                      <option value="Call">Call</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Demo">Demo</option>
                      <option value="Service Order">Service Order</option>
                      <option value="Email">Email</option>
                      <option value="Review">Review</option>
                      <option value="Document">Document</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Task Details ✔ */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1 pt-1.5">
                    <span className="text-emerald-700">Task Details</span>
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                  </label>
                  <div className="sm:col-span-9">
                    <textarea
                      required
                      rows={3}
                      value={editingTask.taskDetails}
                      onChange={(e) => setEditingTask({ ...editingTask, taskDetails: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 resize-y shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Due Date
                  </label>
                  <div className="sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Date input with clear & calendar */}
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        value={editingTask.dueDate || ''}
                        onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs pr-7"
                      />
                      {editingTask.dueDate && (
                        <button
                          type="button"
                          onClick={() => setEditingTask({ ...editingTask, dueDate: '' })}
                          className="absolute right-7 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Time input with clear & clock */}
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        value={editingTask.dueTime || '06:00 PM'}
                        onChange={(e) => setEditingTask({ ...editingTask, dueTime: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 shadow-2xs pr-8"
                      />
                      <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#0284C7] flex-shrink-0" />
                    <span>Location</span>
                  </label>
                  <div className="sm:col-span-9 relative">
                    <input
                      type="text"
                      placeholder="Search location"
                      value={editingTask.department || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, department: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs pr-7"
                    />
                    {editingTask.department && (
                      <button
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, department: '' })}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Participants */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Participants
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      <option value="">None selected</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.name}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Priority
                  </label>
                  <div className="sm:col-span-9">
                    <div className="inline-flex rounded border border-slate-300 overflow-hidden text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, priority: 'Low' })}
                        className={cn(
                          'px-3.5 py-1 transition-colors cursor-pointer border-r border-slate-300',
                          editingTask.priority === 'Low'
                            ? 'bg-[#F5A623] text-white font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        Low
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, priority: 'High' })}
                        className={cn(
                          'px-3.5 py-1 transition-colors cursor-pointer border-r border-slate-300',
                          editingTask.priority === 'High' || editingTask.priority === 'Medium'
                            ? 'bg-[#F5A623] text-white font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        Mid
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, priority: 'Urgent' })}
                        className={cn(
                          'px-3.5 py-1 transition-colors cursor-pointer',
                          editingTask.priority === 'Urgent'
                            ? 'bg-[#F5A623] text-white font-bold'
                            : 'bg-white text-slate-700 hover:bg-slate-50'
                        )}
                      >
                        High
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-center">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700">
                    Status
                  </label>
                  <div className="sm:col-span-9 relative">
                    <select
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 appearance-none cursor-pointer pr-8 shadow-2xs"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Upcoming">Upcoming</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Comments */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:items-start">
                  <label className="sm:col-span-3 text-xs font-semibold text-slate-700 pt-1.5">
                    Comments
                  </label>
                  <div className="sm:col-span-9">
                    <textarea
                      rows={3}
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500 resize-y shadow-2xs leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="border-t border-slate-200 px-6 py-3 bg-[#FAFBFD] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-4 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-[#002B49] hover:bg-[#001E33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── FULL PAGE TASK DETAIL VIEW ──────────────────────────────────────────
  if (viewingTaskInfo) {
    return (
      <div className="space-y-3.5 pb-28 sm:pb-32 w-full animate-in fade-in duration-150">
        {renderChangeStatusModal()}
        {renderPostponeModal()}
        {/* Full Page Cezcon-Style Task Detail Workbench */}
        <div className="bg-white rounded-lg border border-slate-300 shadow-sm flex flex-col text-xs overflow-hidden">
          {/* Top Notice Header Strip */}
          <div className="bg-[#EAEFF5] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wide truncate">
              <Edit2 className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
              <span className="truncate">
                TASK CREATED BY {viewingTaskInfo.createdBy || viewingTaskInfo.assignedBy || 'MUHAMMED SHIBIL'} ON{' '}
                {viewingTaskInfo.createdAt
                  ? new Date(viewingTaskInfo.createdAt).toLocaleString('en-GB', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }).toUpperCase()
                  : 'MON, 28/09/2026, 15:51:30'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setViewingTaskInfo(null)}
              className="w-5 h-5 rounded bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors cursor-pointer font-black text-xs shadow-2xs flex-shrink-0"
              title="Close and return to task list"
            >
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* Sub-Tabs */}
          <div className="border-b border-slate-200 px-5 pt-3 bg-white flex items-center gap-6 text-xs font-bold">
            <button
              type="button"
              className="flex items-center gap-1.5 pb-2.5 text-slate-900 border-b-2 border-[#D91E5B] cursor-pointer"
            >
              <Menu className="w-3.5 h-3.5 text-slate-700" />
              <span>Task Details</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 pb-2.5 text-slate-500 hover:text-slate-800 cursor-pointer font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Task History Details</span>
            </button>
          </div>

          {/* Body: 2-Column Layout */}
          <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
            {/* Left Column: Task Details Table (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-2xs">
                <div className="bg-[#FAFBFD] border-b border-slate-200 px-3.5 py-2 flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                  <Menu className="w-3.5 h-3.5 text-slate-500" />
                  <span>Task Details</span>
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <tbody className="divide-y divide-slate-100">
                    {/* Assignee */}
                    <tr>
                      <td className="w-32 sm:w-36 bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Assignee
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-2">
                          {viewingTaskInfo.assignee.avatar ? (
                            <img
                              src={viewingTaskInfo.assignee.avatar}
                              alt={viewingTaskInfo.assignee.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 shadow-2xs"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-[#002B49] text-white font-bold text-[9px] flex items-center justify-center shadow-2xs">
                              {viewingTaskInfo.assignee.name[0]}
                            </div>
                          )}
                          <span className="font-bold text-slate-900 uppercase">
                            {viewingTaskInfo.assignee.name}
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Task */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Task
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 leading-relaxed">
                        {viewingTaskInfo.taskDetails}
                      </td>
                    </tr>

                    {/* Due Date */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Due Date
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {viewingTaskInfo.dueDate}
                      </td>
                    </tr>

                    {/* Time */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Time
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {viewingTaskInfo.dueTime || '06:00 PM'}
                      </td>
                    </tr>

                    {/* Status (Clickable to open Change Task Status modal) */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Status
                      </td>
                      <td className="py-2.5 px-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenChangeStatus(viewingTaskInfo)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold text-white shadow-2xs transition-all cursor-pointer hover:shadow-xs ${
                            (viewingTaskInfo.status || '').toLowerCase().includes('progress')
                              ? 'bg-[#0284C7] hover:bg-[#0369a1]'
                              : (viewingTaskInfo.status || '').toLowerCase().includes('complete') || (viewingTaskInfo.status || '').toLowerCase().includes('reviewed')
                              ? 'bg-[#10B981] hover:bg-[#059669]'
                              : 'bg-[#F5A623] hover:bg-[#E09612]'
                          }`}
                          title="Click to Change Task Status"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>{viewingTaskInfo.status}</span>
                        </button>
                      </td>
                    </tr>

                    {/* Task Under */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200 align-top">
                        Task Under
                      </td>
                      <td className="py-2.5 px-3.5 space-y-1">
                        {/* Opportunity / Deal Ref */}
                        <div className="flex items-center gap-1.5 text-[#0284C7] font-semibold text-xs">
                          <Key className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                          <span className="hover:underline cursor-pointer">
                            {viewingTaskInfo.taskUnder?.split(' / ')[0] || viewingTaskInfo.taskUnder || 'lcc'}
                          </span>
                          <Info className="w-3.5 h-3.5 text-[#0284C7]" />
                        </div>

                        {/* Customer */}
                        {(viewingTaskInfo.customer || viewingTaskInfo.taskUnder?.includes(' / ') || viewingTaskInfo.taskUnder?.toLowerCase().includes('lcc')) && (
                          <div className="flex items-center gap-1.5 text-[#0284C7] font-semibold text-xs">
                            <Shield className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                            <span className="uppercase hover:underline cursor-pointer">
                              {viewingTaskInfo.customer || viewingTaskInfo.taskUnder?.split(' / ')[1] || 'LCC'}
                            </span>
                            <Info className="w-3.5 h-3.5 text-[#0284C7]" />
                          </div>
                        )}

                        {/* Manager / Created By */}
                        {(viewingTaskInfo.assignedBy || viewingTaskInfo.createdBy || viewingTaskInfo.department) && (
                          <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs pt-0.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                            <span>
                              <span className="text-slate-400 text-[11px] font-normal">Assigned by Manager: </span>
                              <span className="text-slate-900 font-bold">{viewingTaskInfo.assignedBy || viewingTaskInfo.createdBy || `${viewingTaskInfo.department} Manager`}</span>
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Task Type */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Task Type
                      </td>
                      <td className="py-2.5 px-3.5 font-medium text-slate-800">
                        {viewingTaskInfo.taskType === 'Follow-up' ? 'Followup' : viewingTaskInfo.taskType}
                      </td>
                    </tr>

                    {/* Priority (Clickable to open Change Task Status modal) */}
                    <tr>
                      <td className="bg-[#FAFBFD] py-2.5 px-3.5 font-bold text-slate-700 border-r border-slate-200">
                        Priority
                      </td>
                      <td className="py-2.5 px-3.5">
                        <button
                          type="button"
                          onClick={() => handleOpenChangeStatus(viewingTaskInfo)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-2xs transition-all cursor-pointer hover:shadow-xs ${
                            (viewingTaskInfo.priority || '').toLowerCase() === 'low'
                              ? 'bg-[#0284C7] hover:bg-[#0369a1]'
                              : (viewingTaskInfo.priority || '').toLowerCase() === 'high' || (viewingTaskInfo.priority || '').toLowerCase() === 'urgent'
                              ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                              : 'bg-[#F5A623] hover:bg-[#E09612]'
                          }`}
                          title="Click to Change Priority / Status"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                          <span>{viewingTaskInfo.priority === 'High' ? 'High' : viewingTaskInfo.priority === 'Low' ? 'Low' : 'Mid'}</span>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Action Buttons: Postpone, Mark as Completed, Edit, Delete */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenPostpone(viewingTaskInfo)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0F2844] hover:bg-[#0A1D33] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Postpone</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    updateTask(viewingTaskInfo.id, { status: 'Completed', progress: 100 });
                    setViewingTaskInfo({ ...viewingTaskInfo, status: 'Completed', progress: 100 });
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#475569] hover:bg-[#334155] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Completed</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingTask(viewingTaskInfo);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete Task #${viewingTaskInfo.slNo}?`)) {
                      deleteTask(viewingTaskInfo.id);
                      setViewingTaskInfo(null);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Right Column: ATTACHMENTS (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="border border-slate-200 rounded-md overflow-hidden shadow-2xs flex flex-col h-full bg-white">
                {/* Attachments Header */}
                <div className="bg-[#FAFBFD] border-b border-slate-200 px-3.5 py-2 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 text-xs uppercase">
                    <span>📎</span>
                    <span>ATTACHMENTS</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="px-2.5 py-0.5 rounded bg-[#2563EB] text-white font-bold text-[10px] shadow-2xs"
                    >
                      ≡ List
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-semibold text-[10px]"
                    >
                      🖼 Slider
                    </button>
                  </div>
                </div>

                {/* Empty State / Body */}
                <div className="p-8 text-center text-slate-400 space-y-2 my-auto">
                  <div className="w-12 h-12 mx-auto rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 text-xl">
                    📁
                  </div>
                  <p className="text-xs font-semibold text-slate-400">No attachments yet</p>
                </div>

                {/* Add More Attachments Section */}
                <div className="p-3.5 border-t border-slate-100 bg-[#FAFBFD] space-y-2 flex-shrink-0">
                  <div className="text-[11px] font-bold text-[#0284C7] flex items-center gap-1">
                    <Plus className="w-3 h-3" />
                    <span>ADD MORE ATTACHMENTS</span>
                  </div>

                  <label className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center block hover:border-blue-400 transition-colors cursor-pointer bg-white">
                    <input type="file" multiple className="hidden" />
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0284C7] flex items-center justify-center mx-auto mb-1">
                      ☁️
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      Drop files here or <span className="text-[#0284C7] underline font-bold">click to browse</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Multiple files supported</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer with Back button */}
          <div className="border-t border-slate-200 px-5 py-3 bg-[#FAFBFD] flex items-center justify-end">
            <button
              type="button"
              onClick={() => setViewingTaskInfo(null)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <span>←</span>
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Postpone Task Modal inside viewingTaskInfo */}
        {renderPostponeModal()}

      </div>
    );
  }

  if (isAddGenericOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Generic Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddGenericOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!genericTemplate) {
                alert('Please select a template');
                return;
              }
              addTask({
                title: `${genericTemplate.toUpperCase()} TASK`,
                taskDetails: `Generic task created using ${genericTemplate}`,
                taskUnder: 'GENERIC TASK / GENERAL ASSIGNMENT',
                taskType: 'Follow-up',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'Medium',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Generic task created successfully!');
              setGenericTemplate('');
              setIsAddGenericOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 max-w-xl">
              <label className="sm:w-28 text-xs font-medium text-slate-700 shrink-0">
                Template <span className="text-red-600 font-bold">*</span>
              </label>
              <div className="flex-1 flex items-center gap-1.5">
                <select
                  value={genericTemplate}
                  onChange={(e) => {
                    if (e.target.value === '__ADD_NEW__') {
                      setTargetTemplateField('generic');
                      setIsAddTemplateModalOpen(true);
                    } else {
                      setGenericTemplate(e.target.value);
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Select Template</option>
                  {allTemplates.map((tpl) => (
                    <option key={tpl} value={tpl}>
                      {tpl}
                    </option>
                  ))}
                  <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                    + New Template...
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setTargetTemplateField('generic');
                    setIsAddTemplateModalOpen(true);
                  }}
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                  title="Add New Template"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddGenericOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddLeadTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Lead Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddLeadTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedLeadId) {
                alert('Please select a lead');
                return;
              }
              const matchedLead = leads?.find((l) => l.id === selectedLeadId || String(l.slNo) === selectedLeadId);
              const leadName = matchedLead
                ? matchedLead.contactDetails?.company || matchedLead.contactDetails?.name || `Lead #${matchedLead.slNo}`
                : selectedLeadId;
              addTask({
                title: `${leadTemplate ? leadTemplate.toUpperCase() : 'LEAD FOLLOWUP'} - ${leadName}`,
                taskDetails: `Lead task for ${leadName} using ${leadTemplate || 'Follow-up Template'}`,
                taskUnder: `LEAD / ${leadName}`,
                taskType: 'Lead',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'High',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Lead task created successfully!');
              setSelectedLeadId('');
              setLeadTemplate('');
              setIsAddLeadTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Lead Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Lead <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedLeadId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddLeadModalOpen(true);
                      } else {
                        setSelectedLeadId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Lead</option>
                    {leads && leads.length > 0 ? (
                      leads.map((l) => (
                        <option key={l.id} value={l.id}>
                          LEAD#{l.slNo || l.id} - {l.contactDetails?.company || l.contactDetails?.name || 'Inquiry'}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="LEAD#1082 - DAMAC PROPERTIES">LEAD#1082 - DAMAC PROPERTIES</option>
                        <option value="LEAD#1083 - EMAAR DEVELOPMENT">LEAD#1083 - EMAAR DEVELOPMENT</option>
                        <option value="LEAD#1084 - SOBHA REALTY LLC">LEAD#1084 - SOBHA REALTY LLC</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Lead...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddLeadModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Lead"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={leadTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('lead');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setLeadTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('lead');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddLeadTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddCustomerTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Customer Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddCustomerTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCustomerId) {
                alert('Please select a customer');
                return;
              }
              const matchedCustomer = customers?.find(
                (c) => c.id === selectedCustomerId || String(c.slNo) === selectedCustomerId
              );
              const custName = matchedCustomer ? matchedCustomer.customerName : selectedCustomerId;
              addTask({
                title: `${customerTemplate ? customerTemplate.toUpperCase() : 'CUSTOMER TASK'} - ${custName}`,
                taskDetails: `Customer task for ${custName} using ${customerTemplate || 'Follow-up Template'}`,
                taskUnder: `CUSTOMER / ${custName}`,
                taskType: 'Customer',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'High',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Customer task created successfully!');
              setSelectedCustomerId('');
              setCustomerTemplate('');
              setIsAddCustomerTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Customer Name Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-28 text-xs font-medium text-slate-700 shrink-0">
                  Customer Name <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddCustomerModalOpen(true);
                      } else {
                        setSelectedCustomerId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Customer</option>
                    {customers && customers.length > 0 ? (
                      customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.customerName}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="EMAAR PROPERTIES PJSC">EMAAR PROPERTIES PJSC</option>
                        <option value="DAMAC PROPERTIES LLC">DAMAC PROPERTIES LLC</option>
                        <option value="AL HABTOOR GROUP">AL HABTOOR GROUP</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Customer...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Customer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-28 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={customerTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('customer');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setCustomerTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('customer');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCustomerTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddOppTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Opportunity / Order Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddOppTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedOppId) {
                alert('Please select an opportunity or order');
                return;
              }
              const matchedOpp = salesOpportunities?.find(
                (o) => o.id === selectedOppId || String(o.slNo) === selectedOppId || o.opportunityCode === selectedOppId
              );
              const oppTitle = matchedOpp
                ? `${matchedOpp.opportunityCode || `OPP#${matchedOpp.slNo || matchedOpp.id}`} - ${matchedOpp.title || matchedOpp.customer}`
                : selectedOppId;
              addTask({
                title: `${oppTemplate ? oppTemplate.toUpperCase() : 'OPPORTUNITY TASK'} - ${oppTitle}`,
                taskDetails: `Task for ${oppTitle} using ${oppTemplate || 'Follow-up Template'}`,
                taskUnder: `OPPORTUNITY / ${oppTitle}`,
                taskType: 'Opportunity',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'High',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Opportunity / Order task created successfully!');
              setSelectedOppId('');
              setOppTemplate('');
              setIsAddOppTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Opportunity / Order Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-36 text-xs font-medium text-slate-700 shrink-0">
                  Opportunity / Order <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedOppId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddOppModalOpen(true);
                      } else {
                        setSelectedOppId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Opportunity</option>
                    {salesOpportunities && salesOpportunities.length > 0 ? (
                      salesOpportunities.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.opportunityCode || `OPP#${o.slNo || o.id}`} - {o.title || o.customer}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="CTEQ#1041 770KG ICE MACHINE / FOCUS EMC">CTEQ#1041 770KG ICE MACHINE / FOCUS EMC</option>
                        <option value="OPP#1042 CHILLER SYSTEM / DAMAC PROPERTIES">OPP#1042 CHILLER SYSTEM / DAMAC PROPERTIES</option>
                        <option value="ORD#2019 HVAC DUCTING / SOBHA REALTY">ORD#2019 HVAC DUCTING / SOBHA REALTY</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Opportunity...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddOppModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Opportunity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={oppTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('opp');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setOppTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('opp');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOppTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddContactTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Contact Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddContactTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedContactId) {
                alert('Please select a contact');
                return;
              }
              const matchedCustomer = customers?.find((c) => c.contactPerson === selectedContactId || c.id === selectedContactId);
              const contactName = matchedCustomer ? `${matchedCustomer.contactPerson} (${matchedCustomer.customerName})` : selectedContactId;
              addTask({
                title: `${contactTemplate ? contactTemplate.toUpperCase() : 'CONTACT TASK'} - ${contactName}`,
                taskDetails: `Task for contact ${contactName} using ${contactTemplate || 'Follow-up Template'}`,
                taskUnder: `CONTACT / ${contactName}`,
                taskType: 'Call',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'Medium',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Contact task created successfully!');
              setSelectedContactId('');
              setContactTemplate('');
              setIsAddContactTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Contact Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">
                  Contact <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedContactId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddContactModalOpen(true);
                      } else {
                        setSelectedContactId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Contact</option>
                    {customers && customers.length > 0 ? (
                      customers
                        .filter((c) => c.contactPerson)
                        .map((c) => (
                          <option key={c.id} value={c.contactPerson}>
                            {c.contactPerson} - {c.customerName}
                          </option>
                        ))
                    ) : (
                      <>
                        <option value="Bishoy George">Bishoy George - EMAAR PROPERTIES</option>
                        <option value="Ahmed Al Mansoori">Ahmed Al Mansoori - DAMAC</option>
                        <option value="Sarah Jenkins">Sarah Jenkins - SOBHA REALTY</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Contact...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddContactModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Contact"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={contactTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('contact');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setContactTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('contact');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddContactTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddCampaignTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Campaign Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddCampaignTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedCampaignId) {
                alert('Please select a campaign');
                return;
              }
              const matchedCampaign = campaigns?.find(
                (c) => c.id === selectedCampaignId || String(c.slNo) === selectedCampaignId || c.name === selectedCampaignId
              );
              const cmpName = matchedCampaign ? matchedCampaign.name : selectedCampaignId;
              addTask({
                title: `${campaignTemplate ? campaignTemplate.toUpperCase() : 'CAMPAIGN TASK'} - ${cmpName}`,
                taskDetails: `Campaign task for ${cmpName} using ${campaignTemplate || 'Follow-up Template'}`,
                taskUnder: `CAMPAIGN / ${cmpName}`,
                taskType: 'Campaign',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'Medium',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Campaign task created successfully!');
              setSelectedCampaignId('');
              setCampaignTemplate('');
              setIsAddCampaignTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Campaign Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-24 text-xs font-medium text-slate-700 shrink-0">
                  Campaign <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddCampaignModalOpen(true);
                      } else {
                        setSelectedCampaignId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Campaign</option>
                    {campaigns && campaigns.length > 0 ? (
                      campaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="HVAC Commercial Campaign 2026">HVAC Commercial Campaign 2026</option>
                        <option value="Google Ads Search Q3">Google Ads Search Q3</option>
                        <option value="Email Outreach - Architects">Email Outreach - Architects</option>
                        <option value="Social Media Promo 2026">Social Media Promo 2026</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Campaign...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddCampaignModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Campaign"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={campaignTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('campaign');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setCampaignTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('campaign');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddCampaignTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAddInvoiceTaskOpen) {
    return (
      <div className="space-y-3 pb-28 font-sans text-slate-800">
        {renderAddTemplateModal()}
        {renderEntityModals()}
        <div className="bg-white border border-slate-200 rounded-sm shadow-2xs overflow-hidden font-sans text-slate-800">
          {/* Top Header Banner */}
          <div className="bg-[#E2E8F0] border-b border-slate-300 px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-tight text-[11px] sm:text-xs">
              <Menu className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Add Invoice Task</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAddInvoiceTaskOpen(false)}
              className="bg-[#DC2626] hover:bg-[#B91C1C] text-white w-5 h-5 flex items-center justify-center rounded-xs transition-colors cursor-pointer text-xs font-bold"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Form Content */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!selectedInvoiceId) {
                alert('Please select an invoice');
                return;
              }
              const matchedInvoice = invoices?.find(
                (inv) => inv.id === selectedInvoiceId || String(inv.slNo) === selectedInvoiceId || inv.invoiceNumber === selectedInvoiceId
              );
              const invTitle = matchedInvoice
                ? `${matchedInvoice.invoiceNumber} - ${matchedInvoice.customer}`
                : selectedInvoiceId;
              addTask({
                title: `${invoiceTemplate ? invoiceTemplate.toUpperCase() : 'INVOICE TASK'} - ${invTitle}`,
                taskDetails: `Invoice task for ${invTitle} using ${invoiceTemplate || 'Follow-up Template'}`,
                taskUnder: `INVOICE / ${invTitle}`,
                taskType: 'Follow-up',
                dueDate: new Date().toISOString().split('T')[0],
                dueTime: '06:00 PM',
                priority: 'High',
                status: 'Pending',
                assignee: { name: defaultUser },
                createdBy: defaultUser,
              });
              alert('Invoice task created successfully!');
              setSelectedInvoiceId('');
              setInvoiceTemplate('');
              setIsAddInvoiceTaskOpen(false);
            }}
            className="p-6 text-xs text-slate-700"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {/* Invoice Field (LEFT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Invoice <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={selectedInvoiceId}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setIsAddInvoiceModalOpen(true);
                      } else {
                        setSelectedInvoiceId(e.target.value);
                      }
                    }}
                    required
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Invoice</option>
                    {invoices && invoices.length > 0 ? (
                      invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.invoiceNumber} - {inv.customer}
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="INV-2026-001 - EMAAR PROPERTIES PJSC">INV-2026-001 - EMAAR PROPERTIES PJSC</option>
                        <option value="INV-2026-002 - DAMAC PROPERTIES LLC">INV-2026-002 - DAMAC PROPERTIES LLC</option>
                        <option value="INV-2026-003 - SOBHA REALTY LLC">INV-2026-003 - SOBHA REALTY LLC</option>
                        <option value="INV-2026-004 - FOCUS EMC KITCHENS">INV-2026-004 - FOCUS EMC KITCHENS</option>
                      </>
                    )}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Invoice...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => setIsAddInvoiceModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Invoice"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>

              {/* Template Field (RIGHT FIELD with + New) */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="sm:w-20 text-xs font-medium text-slate-700 shrink-0">
                  Template <span className="text-red-600 font-bold">*</span>
                </label>
                <div className="flex-1 flex items-center gap-1.5">
                  <select
                    value={invoiceTemplate}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setTargetTemplateField('invoice');
                        setIsAddTemplateModalOpen(true);
                      } else {
                        setInvoiceTemplate(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    {allTemplates.map((tpl) => (
                      <option key={tpl} value={tpl}>
                        {tpl}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-bold text-blue-600 bg-blue-50">
                      + New Template...
                    </option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetTemplateField('invoice');
                      setIsAddTemplateModalOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer shrink-0"
                    title="Add New Template"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer Buttons */}
            <div className="mt-20 pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddInvoiceTaskOpen(false)}
                className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0B2A4A] hover:bg-[#071D33] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-28 sm:pb-32 w-full">
      {/* ── Top Horizontal Cezcon-Style Sub-Tabs Bar ─────────────────── */}
      <div className="bg-white border border-slate-200 px-3 sm:px-4 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 select-none shadow-xs rounded-lg">
        {/* Tab 0: All Tasks */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('all');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'all'
            ? 'bg-slate-900 text-white font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <Book className="w-3.5 h-3.5" />
          <span>All Tasks</span>
          <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-slate-700 text-white">
            {counts.all}
          </span>
        </button>

        {/* Tab 1: Today */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('today');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'today'
            ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <span className="w-2.5 h-2.5 rounded-xs bg-blue-500 inline-block" />
          <span>Today</span>
          <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-blue-600 text-white">
            {counts.today}
          </span>
        </button>

        {/* Tab 2: Pending (Active in screenshot) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('pending');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'pending'
            ? 'bg-[#FFF7ED] text-[#EA580C] border border-[#FDBA74] font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#EA580C]" />
          <span>Pending</span>
          <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-[#F97316] text-white">
            {counts.pending}
          </span>
        </button>

        {/* Tab 3: Progress */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('progress');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'progress'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Progress</span>
          <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-[#22C55E] text-white">
            {counts.progress}
          </span>
        </button>

        {/* Tab 4: Overdue */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('overdue');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'overdue'
            ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Overdue</span>
          <span className="px-2 py-0.2 rounded text-[11px] font-bold bg-[#EF4444] text-white">
            {counts.overdue}
          </span>
        </button>

        {/* Tab 5: Upcoming */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('upcoming');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'upcoming'
            ? 'bg-blue-50 text-blue-800 border border-blue-300 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-500" />
          <span>Upcoming</span>
        </button>

        {/* Tab 6: Completed */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('completed');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'completed'
            ? 'bg-teal-50 text-teal-800 border border-teal-300 font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
          <span>Completed</span>
        </button>

        {/* Tab 7: Meeting */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('meeting');
            setActiveSubtype('ALL');
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'meeting'
            ? 'bg-[#FEF2F2] text-[#E11D48] border border-[#FECDD3] font-bold shadow-xs'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
        >
          <Video className="w-3.5 h-3.5 text-[#E11D48]" />
          <span>Meeting</span>
        </button>
      </div>

      {/* ── Conditional Rendering: Meeting View vs Standard 2-Column View ── */}
      {activeTab === 'meeting' ? (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-6">
          {/* Section 1: Today (Wed, 23 Sep) */}
          <div>
            <div className="flex items-center">
              <div className="bg-[#D91E5B] text-white px-3.5 py-1.5 rounded-t-md font-bold text-xs shadow-2xs">
                Today (Wed, 23 Sep)
              </div>
            </div>
            <div className="border-t-2 border-[#D91E5B] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead className="bg-[#FAFBFD] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">SL.No</th>
                    <th className="py-2.5 px-4 w-32">Assignee</th>
                    <th className="py-2.5 px-4 min-w-[240px]">Task Under</th>
                    <th className="py-2.5 px-4 min-w-[260px]">Task Details</th>
                    <th className="py-2.5 px-4 w-28 whitespace-nowrap">Time</th>
                    <th className="py-2.5 px-4 w-24 text-center">Priority</th>
                    <th className="py-2.5 px-4 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-3.5 px-4 text-slate-500 font-normal italic text-xs">
                        No Records.
                      </td>
                    </tr>
                  ) : (
                    todayMeetings.map((task, idx) => {
                      const parts = task.taskUnder.split(' / ');
                      const oppRef = parts[0] || task.taskUnder;
                      const customerName = parts[1] || 'FOCUS EMC KITCHENS LLC';

                      return (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-semibold text-slate-600">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                  {task.assignee.name[0]}
                                </div>
                              )}
                              <span className="font-medium text-slate-800 text-[11px]">{task.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              {/* Manager Name */}
                              <div className="flex items-center gap-1.5 text-slate-800 font-medium text-[11px]">
                                <UserCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                                <span
                                  className="truncate hover:underline cursor-pointer font-bold text-slate-900"
                                  onClick={() => setViewingTaskInfo(task)}
                                >
                                  {task.assignedBy || task.createdBy || `${task.department || 'Sales'} Manager`}
                                </span>
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>{task.dueTime || '04:00 PM'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-1.5">
                              <p
                                className="text-[#0284C7] hover:underline font-normal leading-snug flex-1 cursor-pointer"
                                onClick={() => setViewingTaskInfo(task)}
                              >
                                {task.taskDetails}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingTaskInfo(task)}
                                className="text-[#0284C7] hover:text-[#0369A1] p-0.5"
                                title="View Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                            {task.dueTime || '03:30 PM'}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white">
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{task.priority === 'High' ? 'Mid' : task.priority}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Tomorrow (Thu, 24 Sep) */}
          <div>
            <div className="flex items-center">
              <div className="bg-[#2D45B0] text-white px-3.5 py-1.5 rounded-t-md font-bold text-xs shadow-2xs">
                Tomorrow (Thu, 24 Sep)
              </div>
            </div>
            <div className="border-t-2 border-[#2D45B0] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead className="bg-[#FAFBFD] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">SL.No</th>
                    <th className="py-2.5 px-4 w-32">Assignee</th>
                    <th className="py-2.5 px-4 min-w-[240px]">Task Under</th>
                    <th className="py-2.5 px-4 min-w-[260px]">Task Details</th>
                    <th className="py-2.5 px-4 w-28 whitespace-nowrap">Time</th>
                    <th className="py-2.5 px-4 w-24 text-center">Priority</th>
                    <th className="py-2.5 px-4 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tomorrowMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-3.5 px-4 text-slate-500 font-normal italic text-xs">
                        No Records.
                      </td>
                    </tr>
                  ) : (
                    tomorrowMeetings.map((task, idx) => {
                      const parts = task.taskUnder.split(' / ');
                      const oppRef = parts[0] || task.taskUnder;
                      const customerName = parts[1] || 'LUXURY CASTLE CONTRACTING';

                      return (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-semibold text-slate-600">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                  {task.assignee.name[0]}
                                </div>
                              )}
                              <span className="font-medium text-slate-800 text-[11px]">{task.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[#0284C7] font-medium text-[11px]">
                                <Key className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                                <span className="truncate hover:underline cursor-pointer" onClick={() => setViewingTaskInfo(task)}>
                                  {oppRef}
                                </span>
                                <button type="button" onClick={() => setViewingTaskInfo(task)} className="text-[#0284C7] p-0.5">
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#0284C7] font-medium text-[11px]">
                                <Shield className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                                <span className="truncate uppercase hover:underline cursor-pointer" onClick={() => setViewingTaskInfo(task)}>
                                  {customerName}
                                </span>
                                <button type="button" onClick={() => setViewingTaskInfo(task)} className="text-[#0284C7] p-0.5">
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-1.5">
                              <p
                                className="text-[#0284C7] hover:underline font-normal leading-snug flex-1 cursor-pointer"
                                onClick={() => setViewingTaskInfo(task)}
                              >
                                {task.taskDetails}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingTaskInfo(task)}
                                className="text-[#0284C7] hover:text-[#0369A1] p-0.5"
                                title="View Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                            {task.dueTime || '11:00 AM'}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white">
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{task.priority === 'High' ? 'Mid' : task.priority}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Later (Fri, 25 Sep - Fri, 02 Oct) */}
          <div>
            <div className="flex items-center">
              <div className="bg-[#2E9946] text-white px-3.5 py-1.5 rounded-t-md font-bold text-xs shadow-2xs">
                Later (Fri, 25 Sep - Fri, 02 Oct)
              </div>
            </div>
            <div className="border-t-2 border-[#2E9946] overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead className="bg-[#FAFBFD] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 w-16 text-center">SL.No</th>
                    <th className="py-2.5 px-4 w-32">Assignee</th>
                    <th className="py-2.5 px-4 min-w-[240px]">Task Under</th>
                    <th className="py-2.5 px-4 min-w-[260px]">Task Details</th>
                    <th className="py-2.5 px-4 w-32 whitespace-nowrap">Due Date</th>
                    <th className="py-2.5 px-4 w-24 text-center">Priority</th>
                    <th className="py-2.5 px-4 w-24 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {laterMeetings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-3.5 px-4 text-slate-500 font-normal italic text-xs">
                        No Records.
                      </td>
                    </tr>
                  ) : (
                    laterMeetings.map((task, idx) => {
                      const parts = task.taskUnder.split(' / ');
                      const oppRef = parts[0] || task.taskUnder;
                      const customerName = parts[1] || 'EMAAR PROPERTIES PJSC';

                      return (
                        <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-semibold text-slate-600">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                                  {task.assignee.name[0]}
                                </div>
                              )}
                              <span className="font-medium text-slate-800 text-[11px]">{task.assignee.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[#0284C7] font-medium text-[11px]">
                                <Key className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                                <span className="truncate hover:underline cursor-pointer" onClick={() => setViewingTaskInfo(task)}>
                                  {oppRef}
                                </span>
                                <button type="button" onClick={() => setViewingTaskInfo(task)} className="text-[#0284C7] p-0.5">
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-1.5 text-[#0284C7] font-medium text-[11px]">
                                <Shield className="w-3.5 h-3.5 text-[#EF4444] flex-shrink-0" />
                                <span className="truncate uppercase hover:underline cursor-pointer" onClick={() => setViewingTaskInfo(task)}>
                                  {customerName}
                                </span>
                                <button type="button" onClick={() => setViewingTaskInfo(task)} className="text-[#0284C7] p-0.5">
                                  <Info className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-start gap-1.5">
                              <p
                                className="text-[#0284C7] hover:underline font-normal leading-snug flex-1 cursor-pointer"
                                onClick={() => setViewingTaskInfo(task)}
                              >
                                {task.taskDetails}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingTaskInfo(task)}
                                className="text-[#0284C7] hover:text-[#0369A1] p-0.5"
                                title="View Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap text-slate-700 font-medium text-[11px]">
                            {task.dueDate} {task.dueTime}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white">
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{task.priority === 'High' ? 'Mid' : task.priority}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {task.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* ── Main 2-Column Cezcon Layout with Proper Sizing & Alignment ── */
        <div className="flex flex-col lg:flex-row gap-3.5 items-start w-full">
          {/* Left Column: Filter Panel (Collapsible & Compact) */}
          {showFilterSidebar && (
            <div className="w-full lg:w-56 xl:w-60 flex-shrink-0 bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Filter className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                      {activeFilterCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-[11px] text-slate-500 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowFilterSidebar(false)}
                    className="w-5 h-5 rounded bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors shadow-xs cursor-pointer"
                    title="Hide filter panel"
                  >
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* Field 1: Sort By */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All Task">All Task</option>
                    <option value="Due Date">Due Date</option>
                    <option value="Priority">Priority (High to Low)</option>
                    <option value="Assignee">Assignee (A-Z)</option>
                  </select>
                </div>

                {/* Field 2: Assignee */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Assignee</label>
                  <select
                    value={assigneeFilter}
                    onChange={(e) => setAssigneeFilter(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All Owners">All Owners</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Task Type */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Task Type</label>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Follow-up">Followup</option>
                    <option value="Call">Call</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Demo">Demo</option>
                    <option value="Email">Email</option>
                    <option value="Review">Review</option>
                    <option value="Document">Document</option>
                  </select>
                </div>

                {/* Field 4: Created By */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 block">Created By</label>
                  <select
                    value={createdByFilter}
                    onChange={(e) => setCreatedByFilter(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
                  >
                    <option value="All">All</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Operations Manager">Operations Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Right Column: Main Task Table Container (Fluid & Edge-to-Edge) */}
          <div className="flex-1 min-w-0 w-full bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
            {/* Header Strip with Action Buttons */}
            <div className="bg-[#EAEFF5] border-b border-slate-200 px-3.5 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Menu className="w-4 h-4 text-slate-600 flex-shrink-0" />
                  <h2 className="text-xs font-bold text-slate-800 tracking-wide whitespace-nowrap">
                    {tabTitles[activeTab]}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFilterSidebar(!showFilterSidebar)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] font-semibold transition-colors cursor-pointer shadow-2xs ${showFilterSidebar
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  title="Toggle filter options"
                >
                  <Filter className="w-3 h-3" />
                  <span>Filter</span>
                  {activeFilterCount > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${showFilterSidebar ? 'bg-white text-[#2563EB]' : 'bg-[#2563EB] text-white'}`}>
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs flex-wrap sm:flex-nowrap relative">
                {/* 1. Assign Task Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAssignForm({
                      targetAssignee: defaultUser,
                      selectedTaskIds: filteredTasks.map((t) => t.id),
                    });
                    setIsAssignModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#0B2A4A] hover:bg-[#071D33] text-white font-semibold transition-colors cursor-pointer shadow-2xs text-xs whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Assign Task</span>
                </button>

                {/* 2. ++ TASK Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsTaskDropdownOpen((prev) => !prev);
                      setIsPlusTaskDropdownOpen(false);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold transition-colors cursor-pointer shadow-2xs text-xs whitespace-nowrap"
                  >
                    <span>++ TASK</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 ml-0.5 transition-transform duration-150", isTaskDropdownOpen && "rotate-180")} />
                  </button>

                  {/* Task Type Dropdown Menu (Exact Cezcon CRM Image 2) */}
                  {isTaskDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded border border-slate-200 shadow-xl py-1 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {[
                        { label: 'Generic', icon: Wrench, type: 'Follow-up' },
                        { label: 'Lead', icon: List, type: 'Lead' },
                        { label: 'Customer', icon: Shield, type: 'Customer' },
                        { label: 'Opportunity / Order', icon: Key, type: 'Opportunity' },
                        { label: 'Contact', icon: User, type: 'Contact' },
                        { label: 'Campaign', icon: DollarSign, type: 'Campaign' },
                        { label: 'Invoice', icon: FileText, type: 'Invoice' },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setIsTaskDropdownOpen(false);
                              if (item.label === 'Generic') {
                                setIsAddGenericOpen(true);
                              } else if (item.label === 'Lead') {
                                setIsAddLeadTaskOpen(true);
                              } else if (item.label === 'Customer') {
                                setIsAddCustomerTaskOpen(true);
                              } else if (item.label === 'Opportunity / Order') {
                                setIsAddOppTaskOpen(true);
                              } else if (item.label === 'Contact') {
                                setIsAddContactTaskOpen(true);
                              } else if (item.label === 'Campaign') {
                                setIsAddCampaignTaskOpen(true);
                              } else if (item.label === 'Invoice') {
                                setIsAddInvoiceTaskOpen(true);
                              } else {
                                setFormData((prev) => ({ ...prev, taskType: item.type as any }));
                                setIsAddModalOpen(true);
                              }
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. + TASK Dropdown Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsPlusTaskDropdownOpen((prev) => !prev);
                      setIsTaskDropdownOpen(false);
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold transition-colors cursor-pointer shadow-2xs text-xs whitespace-nowrap"
                  >
                    <span>+ TASK</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 ml-0.5 transition-transform duration-150", isPlusTaskDropdownOpen && "rotate-180")} />
                  </button>

                  {isPlusTaskDropdownOpen && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded border border-slate-200 shadow-xl py-1 z-50 text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                    >
                      {[
                        { label: 'Generic Task', icon: Wrench, action: () => setIsAddGenericOpen(true) },
                        { label: 'Lead Task', icon: List, action: () => setIsAddLeadTaskOpen(true) },
                        { label: 'Customer Task', icon: Shield, action: () => setIsAddCustomerTaskOpen(true) },
                        { label: 'Opportunity Task', icon: Key, action: () => setIsAddOppTaskOpen(true) },
                        { label: 'Contact Task', icon: User, action: () => setIsAddContactTaskOpen(true) },
                        { label: 'Campaign Task', icon: DollarSign, action: () => setIsAddCampaignTaskOpen(true) },
                        { label: 'Invoice Task', icon: FileText, action: () => setIsAddInvoiceTaskOpen(true) },
                        { label: 'Standard Task Form', icon: CheckCircle2, action: () => setIsAddModalOpen(true) },
                      ].map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setIsPlusTaskDropdownOpen(false);
                              item.action();
                            }}
                            className="w-full text-left px-3.5 py-2 text-xs hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 hover:text-slate-900 font-medium transition-colors cursor-pointer"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Controls (Rows selector & Search box) */}
            <div className="px-4 py-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs bg-white">
              <div className="flex items-center gap-2 text-slate-600 font-medium">
                <span>Shows</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span>Rows</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search Task"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Subtype Filter Strip inside Table (Followup / Call / All) */}
            <div className="px-4 py-2 bg-[#FAFBFD] border-b border-slate-200 flex items-center gap-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveSubtype('Followup')}
                className={`transition-colors cursor-pointer ${activeSubtype === 'Followup'
                  ? 'text-[#F97316] font-bold border-b-2 border-[#F97316] pb-0.5'
                  : 'text-[#F97316]/80 hover:text-[#F97316]'
                  }`}
              >
                Followup <span className="text-[#F97316] font-bold">({subtypeCounts.followup})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubtype('Call')}
                className={`transition-colors cursor-pointer ${activeSubtype === 'Call'
                  ? 'text-[#0284C7] font-bold border-b-2 border-[#0284C7] pb-0.5'
                  : 'text-[#0284C7]/80 hover:text-[#0284C7]'
                  }`}
              >
                Call <span className="text-[#0284C7] font-bold">({subtypeCounts.call})</span>
              </button>

              {activeSubtype !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setActiveSubtype('ALL')}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer font-medium ml-2"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {/* ── Mobile View: Task Cards (Screens < md) ── */}
            <div className="block md:hidden space-y-3 p-3">
              {paginatedTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium text-xs bg-white rounded border border-slate-200">
                  No records found.
                </div>
              ) : (
                paginatedTasks.map((task, idx) => {
                  const slNo = (currentPage - 1) * pageSize + idx + 1;
                  const isCompleted = task.status === 'Completed';
                  const parts = (task.taskUnder || '').split(' / ');
                  const oppRef = parts[0] || task.equipmentTag || task.taskUnder || 'Client Account';
                  const customerName = task.customer || (parts.length > 1 ? parts[1] : '');

                  return (
                    <div
                      key={task.id}
                      className={cn(
                        'bg-white border rounded-lg p-3.5 shadow-xs space-y-2.5 transition-all text-xs',
                        isCompleted ? 'bg-slate-50/70 border-slate-200 opacity-80' : 'border-slate-200'
                      )}
                    >
                      {/* Top Row: SL No, Assignee, Priority, Actions */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            #{slNo}
                          </span>
                          <div className="flex items-center gap-1.5 min-w-0">
                            {task.assignee.avatar ? (
                              <img
                                src={task.assignee.avatar}
                                alt={task.assignee.name}
                                className="w-5 h-5 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                                {task.assignee.name[0]}
                              </div>
                            )}
                            <span className="font-semibold text-slate-800 text-xs truncate">
                              {task.assignee.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 relative">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5A623] text-white">
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>{task.priority === 'High' ? 'Mid' : task.priority}</span>
                          </span>

                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActionMenuTaskId(actionMenuTaskId === task.id ? null : task.id);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-[#006f8e] hover:bg-[#005f7a] text-white text-[11px] font-medium cursor-pointer shadow-xs transition-colors"
                            >
                              <Settings className="w-3 h-3" />
                              <ChevronDown className="w-2.5 h-2.5" />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {actionMenuTaskId === task.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-[4px] shadow-xl z-50 py-1 text-left text-[13px] text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setViewingTaskInfo(task);
                                    setActionMenuTaskId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Book className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTask(task);
                                    setActionMenuTaskId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Edit2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    handleOpenPostpone(task);
                                    setActionMenuTaskId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Calendar className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                  <span>Postpone</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    updateTask(task.id, { status: 'Completed', progress: 100 });
                                    setActionMenuTaskId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                  <span>Mark as Completed</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete this task?`)) {
                                      deleteTask(task.id);
                                    }
                                    setActionMenuTaskId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                >
                                  <Trash2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Task Details */}
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h3
                            className={cn(
                              'text-xs font-bold text-[#0284C7] leading-snug cursor-pointer hover:underline',
                              isCompleted ? 'line-through text-slate-400' : ''
                            )}
                            onClick={() => setViewingTaskInfo(task)}
                          >
                            {task.taskDetails}
                          </h3>
                          <button
                            type="button"
                            onClick={() => setViewingTaskInfo(task)}
                            className="text-[#0284C7] p-0.5 shrink-0"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Task Under Box: Manager & Time Only */}
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium text-[11px]">
                          <UserCheck className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <span className="truncate hover:underline cursor-pointer font-bold text-slate-900" onClick={() => setViewingTaskInfo(task)}>
                            {task.assignedBy || task.createdBy || `${task.department || 'Sales'} Manager`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{task.dueTime || '04:00 PM'}</span>
                        </div>
                      </div>

                      {/* Footer: Due Date & Task Type */}
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 text-slate-600">
                        <div className="flex items-center gap-1 font-medium">
                          <span>📅</span>
                          <span>{task.dueDate} {task.dueTime}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                          {task.taskType === 'Follow-up' ? 'Followup' : task.taskType}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── Desktop View: Data Table (Screens >= md) ── */}
            <div className="hidden md:block overflow-x-auto min-h-[300px] w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[720px]">
                <thead className="bg-[#FAFBFD] border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center whitespace-nowrap">SL.NO</th>
                    <th className="py-2.5 px-2 w-16 text-center whitespace-nowrap">ASSIGNEE</th>
                    <th className="py-2.5 px-3 min-w-[200px]">TASK DETAILS</th>
                    <th className="py-2.5 px-3 min-w-[220px]">TASK UNDER</th>
                    <th className="py-2.5 px-3 w-24 whitespace-nowrap">TASK TYPE</th>
                    <th className="py-2.5 px-3 w-28 whitespace-nowrap text-left sm:text-center">DUE DATE</th>
                    <th className="py-2.5 px-2 w-20 text-center whitespace-nowrap">PRIORITY</th>
                    <th className="py-2.5 px-2 w-16 text-center whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task, idx) => {
                      const slNo = (currentPage - 1) * pageSize + idx + 1;
                      const isCompleted = task.status === 'Completed';

                      // Parse Task Under for Opportunity & Customer
                      const parts = (task.taskUnder || '').split(' / ');
                      const oppRef = parts[0] || task.equipmentTag || task.taskUnder || 'Client Account';
                      const customerName = task.customer || (parts.length > 1 ? parts[1] : '');

                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-slate-50/80 transition-colors ${isCompleted ? 'bg-slate-50/40 text-slate-400' : ''
                            }`}
                        >
                          {/* SL No */}
                          <td className="py-2.5 px-3 text-center font-semibold text-slate-600">{slNo}</td>

                          {/* Assignee Avatar */}
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center">
                              {task.assignee.avatar ? (
                                <img
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                  className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-2xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shadow-2xs">
                                  {task.assignee.name[0]}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Task Details with Info Icon */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-start gap-1.5">
                              <p
                                className={`text-[#0284C7] hover:underline font-normal leading-snug flex-1 cursor-pointer text-xs ${isCompleted ? 'line-through text-slate-400' : ''
                                  }`}
                                onClick={() => setViewingTaskInfo(task)}
                              >
                                {task.taskDetails}
                              </p>
                              <button
                                type="button"
                                onClick={() => setViewingTaskInfo(task)}
                                className="text-[#0284C7] hover:text-[#0369A1] p-0.5 flex-shrink-0 cursor-pointer"
                                title="View Details"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Task Under: Assigned Manager & Time Only */}
                          <td className="py-2.5 px-3">
                            <div className="space-y-1">
                              {/* Manager Name */}
                              <div className="flex items-center gap-1.5 text-slate-800 font-medium text-[11px]">
                                <UserCheck className="w-3.5 h-3.5 text-[#2563EB] flex-shrink-0" />
                                <span
                                  className="truncate hover:underline cursor-pointer font-bold text-slate-900"
                                  onClick={() => setViewingTaskInfo(task)}
                                >
                                  {task.assignedBy || task.createdBy || `${task.department || 'Sales'} Manager`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setViewingTaskInfo(task)}
                                  className="text-[#0284C7] hover:text-[#0369A1] p-0.5 flex-shrink-0 cursor-pointer"
                                  title="Manager Details"
                                >
                                  <Info className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                                <span>{task.dueTime || '04:00 PM'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Task Type */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-xs">
                            {task.taskType === 'Follow-up' ? 'Followup' : task.taskType}
                          </td>

                          {/* Due Date & Time */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-700 font-medium text-[11px] text-left sm:text-center">
                            <div>{task.dueDate}</div>
                            <div className="text-[10px] text-slate-500">{task.dueTime}</div>
                          </td>

                          {/* Priority Badge */}
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenChangeStatus(task)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-2xs transition-all cursor-pointer hover:shadow-xs ${
                                (task.priority || '').toLowerCase() === 'low'
                                  ? 'bg-[#0284C7] hover:bg-[#0369a1]'
                                  : (task.priority || '').toLowerCase() === 'high' || (task.priority || '').toLowerCase() === 'urgent'
                                  ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                                  : 'bg-[#F5A623] hover:bg-[#E09612]'
                              }`}
                              title="Click to Change Status / Priority"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>
                                {task.priority === 'High' ? 'High' : task.priority === 'Low' ? 'Low' : 'Mid'}
                              </span>
                            </button>
                          </td>

                          {/* Action: Gear Dropdown */}
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <div className="relative inline-block text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActionMenuTaskId(actionMenuTaskId === task.id ? null : task.id);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-[3px] bg-[#006f8e] hover:bg-[#005f7a] text-white transition-colors cursor-pointer shadow-xs text-[11px] font-medium"
                                title="Actions"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {/* Dropdown Menu matching Cezcon CRM Screenshot 2 */}
                              {actionMenuTaskId === task.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-slate-200 rounded-[4px] shadow-xl z-50 py-1 text-left text-[13px] text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                                >
                                  {/* 1. View */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setViewingTaskInfo(task);
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <Book className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                    <span>View</span>
                                  </button>

                                  {/* 2. Edit */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingTask(task);
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <Edit2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                    <span>Edit</span>
                                  </button>

                                  {/* 3. Postpone */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenPostpone(task);
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <Calendar className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                    <span>Postpone</span>
                                  </button>

                                  {/* 4. Change Status */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenChangeStatus(task);
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <Edit2 className="w-4 h-4 text-amber-500 shrink-0 stroke-[1.75]" />
                                    <span>Change Status</span>
                                  </button>

                                  {/* 5. Mark as Completed */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateTask(task.id, { status: 'Completed', progress: 100 });
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
                                    <span>Mark as Completed</span>
                                  </button>

                                  {/* 6. Delete */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete this task?`)) {
                                        deleteTask(task.id);
                                      }
                                      setActionMenuTaskId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3.5 py-2 hover:bg-slate-100 transition-colors text-slate-800 cursor-pointer text-left font-normal"
                                  >
                                    <Trash2 className="w-4 h-4 text-slate-700 shrink-0 stroke-[1.75]" />
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

            {/* Table Footer: Entries count & Pagination */}
            <div className="px-3.5 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500 bg-white">
              <div>
                {totalEntries > 0 ? (
                  <span>
                    Showing {(currentPage - 1) * pageSize + 1} to{' '}
                    {Math.min(currentPage * pageSize, totalEntries)} of {totalEntries} entries
                  </span>
                ) : (
                  <span>Showing 0 to 0 of 0 entries</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setCurrentPage(p)}
                    className={`px-2.5 py-1 rounded border text-xs font-bold transition-colors cursor-pointer ${currentPage === p
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Add New Task ────────────────────────────────────── */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Create Operational Task"
          description="Schedule a follow-up milestone, customer call, or site survey."
          icon={<CheckCircle2 className="w-5 h-5 text-blue-600" />}
          maxWidth="lg"
        >
          <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
            {/* Task Details */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Task Description / Objective <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Follow up with client regarding quotation approval & delivery timeline..."
                value={formData.taskDetails}
                onChange={(e) => setFormData({ ...formData, taskDetails: e.target.value })}
                className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-2xs resize-none"
              />
            </div>

            {/* Task Type Chips */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Task Category</label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Follow-up', icon: '🔄', value: 'Follow-up' },
                  { label: 'Client Call', icon: '📞', value: 'Call' },
                  { label: 'Site Meeting', icon: '🤝', value: 'Meeting' },
                  { label: 'Product Demo', icon: '🎯', value: 'Demo' },
                  { label: 'Email Outreach', icon: '✉️', value: 'Email' },
                  { label: 'Proposal Review', icon: '📋', value: 'Review' },
                  { label: 'Documentation', icon: '📄', value: 'Document' },
                ].map((type) => {
                  const isSelected = formData.taskType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, taskType: type.value as TaskType })}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-150 cursor-pointer border',
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/30 scale-[1.02]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      )}
                    >
                      <span>{type.icon}</span>
                      <span>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Selector Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">Priority Level</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'Urgent', label: 'Urgent', dot: 'bg-rose-500', active: 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-500/20 shadow-xs' },
                  { value: 'High', label: 'High', dot: 'bg-amber-500', active: 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-500/20 shadow-xs' },
                  { value: 'Medium', label: 'Medium', dot: 'bg-blue-500', active: 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-500/20 shadow-xs' },
                  { value: 'Low', label: 'Low', dot: 'bg-slate-400', active: 'bg-slate-100 border-slate-400 text-slate-800 ring-2 ring-slate-500/20 shadow-xs' },
                ].map((pri) => {
                  const isSelected = formData.priority === pri.value;
                  return (
                    <button
                      key={pri.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: pri.value as TaskPriority })}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all duration-150 cursor-pointer',
                        isSelected
                          ? pri.active
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      <span className={cn('w-2 h-2 rounded-full', pri.dot)} />
                      <span>{pri.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Opportunity Context & Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Related Opportunity / Account"
                placeholder="e.g. CTEQ#1041 770KG ICE MACHINE"
                value={formData.taskUnder}
                onChange={(e) => setFormData({ ...formData, taskUnder: e.target.value })}
              />
              <Select
                label="Assignee Team Member"
                value={formData.assignee.name}
                options={users.map((u) => ({ label: `${u.name} (${u.role})`, value: u.name }))}
                onChange={(e) => setFormData({ ...formData, assignee: { name: e.target.value } })}
              />
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Due Date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
              <Input
                label="Due Time"
                type="time"
                value={formData.dueTime || '18:00'}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
                Create Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL: Change Task Status Modal matching Cezcon CRM Screenshot ── */}
      {renderChangeStatusModal()}

      {/* ── MODAL: Postpone Task Modal matching Cezcon CRM Screenshot ── */}
      {renderPostponeModal()}

    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Tasks...</div>}>
      <TasksContent />
    </Suspense>
  );
}
