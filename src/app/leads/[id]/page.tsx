'use client';

import React, { useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ExternalLink,
  X,
  List,
  FileText,
  Edit,
  UserCheck,
  CornerUpRight,
  Trash2,
  Phone,
  MessageCircle,
  Plus,
  Calendar,
  CheckSquare,
  Paperclip,
  MapPin,
  Tag,
  Send,
  Download,
  Clock,
  Building,
  User,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const {
    leads,
    updateLead,
    deleteLead,
    addCustomer,
    addOpportunity,
    users,
    tasks,
    addTask,
  } = useEnterpriseCrm();

  // Find lead by ID or slNo or name
  const lead = useMemo(() => {
    const rawId = decodeURIComponent(resolvedParams.id);
    const found = leads.find(
      (l) =>
        l.id.toLowerCase() === rawId.toLowerCase() ||
        l.slNo.toString() === rawId ||
        l.id.replace('lead-', '').toLowerCase() === rawId.toLowerCase()
    );

    if (found) return found;

    // Fallback: If not found, use first lead or Mubarak lead
    return (
      leads[0] || {
        id: 'lead-mubarak',
        slNo: 2,
        leadDate: '23 Sep 2026',
        assignedDate: '23 Sep 2026',
        leadAssigned: {
          name: 'JISMON JOSE',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        },
        contactDetails: {
          name: 'Mr. MUBARAK',
          phone: '+971522350408',
          company: 'SPACE DYNAMIC',
          email: 'mubarak@spacedynamic.ae',
          whatsapp: '+971522350408',
        },
        leadSpecification: 'Supply of hydraulic flexible hoses and industrial fittings',
        createdBy: 'JISMON JOSE',
        createdByAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        owner: 'JISMON JOSE',
        ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rating: 'Cold' as LeadRating,
        status: 'Contacted' as LeadStatus,
        lastActivity: '23 Sep 2026 2:15:17 PM',
        lastActivityDate: '23 Sep 2026 2:15:17 PM',
        lastActivityTimeAgo: '1 day',
        value: 45000,
        source: 'Direct Inquiry',
        comments: 'REQUESTED HOSE NOT AVAILABLE WITH US',
      }
    );
  }, [leads, resolvedParams.id]);

  // Tab State for Activities
  const [activeActivityTab, setActiveActivityTab] = useState<'Notes' | 'Task' | 'Files' | 'Sales Visit'>('Notes');

  // Local state for activities (with defaults)
  const [leadNotes, setLeadNotes] = useState<Array<{ id: string; author: string; avatar?: string; date: string; content: string }>>(
    lead.notes || []
  );
  const [leadFiles, setLeadFiles] = useState<Array<{ id: string; name: string; size: string; uploadedBy: string; date: string }>>(
    lead.files || []
  );
  const [leadSalesVisits, setLeadSalesVisits] = useState<Array<{ id: string; visitor: string; date: string; location: string; summary: string }>>(
    lead.salesVisits || []
  );

  // Filter tasks belonging to this lead
  const leadTasks = useMemo(() => {
    return tasks.filter(
      (t) =>
        t.taskUnder.toLowerCase().includes(lead.contactDetails.company.toLowerCase()) ||
        t.taskUnder.toLowerCase().includes(lead.contactDetails.name.toLowerCase())
    );
  }, [tasks, lead]);

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignOwner, setAssignOwner] = useState(lead.owner || 'JISMON JOSE');
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);
  const [isAddVisitModalOpen, setIsAddVisitModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Chat message state
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; sender: string; time: string; text: string; isSelf: boolean }>>([
    {
      id: '1',
      sender: lead.owner || 'JISMON JOSE',
      time: '2:15 PM',
      text: `Customer ${lead.contactDetails.name} inquired regarding hydraulic hose specifications. Requested hose not in stock currently.`,
      isSelf: false,
    },
    {
      id: '2',
      sender: 'Alex Rivera',
      time: '2:18 PM',
      text: `Checking with European supplier catalog for alternative compatible model.`,
      isSelf: true,
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Form states for modals
  const [editFormData, setEditFormData] = useState({
    name: lead.contactDetails.name,
    company: lead.contactDetails.company,
    phone: lead.contactDetails.phone,
    email: lead.contactDetails.email || '',
    whatsapp: lead.contactDetails.whatsapp || lead.contactDetails.phone,
    rating: lead.rating,
    status: lead.status,
    comments: lead.comments || 'REQUESTED HOSE NOT AVAILABLE WITH US',
    specification: lead.leadSpecification,
    owner: lead.owner,
  });

  const [newNoteText, setNewNoteText] = useState('');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    type: 'Follow-up' as const,
    priority: 'High' as const,
    dueDate: '2026-09-25',
    dueTime: '02:00 PM',
  });
  const [newFileName, setNewFileName] = useState('');
  const [newVisitData, setNewVisitData] = useState({
    visitor: lead.owner || 'JISMON JOSE',
    date: '2026-09-25',
    location: lead.contactDetails.company + ' Site / Office',
    summary: '',
  });

  // Action: Open Add modal according to current tab
  const handleAddClick = () => {
    if (activeActivityTab === 'Notes') setIsAddNoteModalOpen(true);
    else if (activeActivityTab === 'Task') setIsAddTaskModalOpen(true);
    else if (activeActivityTab === 'Files') setIsAddFileModalOpen(true);
    else if (activeActivityTab === 'Sales Visit') setIsAddVisitModalOpen(true);
  };

  // Add note
  const handleSaveNote = () => {
    if (!newNoteText.trim()) return;
    const note = {
      id: `note-${Date.now()}`,
      author: lead.owner || 'JISMON JOSE',
      avatar: lead.ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      content: newNoteText.trim(),
    };
    const updated = [note, ...leadNotes];
    setLeadNotes(updated);
    updateLead(lead.id, { notes: updated });
    setNewNoteText('');
    setIsAddNoteModalOpen(false);
  };

  // Add task
  const handleSaveTask = () => {
    if (!newTaskData.title.trim()) return;
    addTask({
      assignee: {
        name: lead.owner || 'Alex Rivera',
        avatar: lead.ownerAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
      taskDetails: newTaskData.title,
      taskUnder: `${lead.contactDetails.name} / ${lead.contactDetails.company}`,
      taskType: newTaskData.type,
      dueTime: newTaskData.dueTime,
      dueDate: newTaskData.dueDate,
      priority: newTaskData.priority,
      status: 'Pending',
      createdBy: 'Super Admin',
    });
    setNewTaskData({
      title: '',
      type: 'Follow-up',
      priority: 'High',
      dueDate: '2026-09-25',
      dueTime: '02:00 PM',
    });
    setIsAddTaskModalOpen(false);
  };

  // Add file
  const handleSaveFile = () => {
    if (!newFileName.trim()) return;
    const file = {
      id: `file-${Date.now()}`,
      name: newFileName.trim(),
      size: '2.4 MB',
      uploadedBy: lead.owner || 'JISMON JOSE',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    };
    const updated = [file, ...leadFiles];
    setLeadFiles(updated);
    updateLead(lead.id, { files: updated });
    setNewFileName('');
    setIsAddFileModalOpen(false);
  };

  // Add sales visit
  const handleSaveVisit = () => {
    if (!newVisitData.summary.trim()) return;
    const visit = {
      id: `visit-${Date.now()}`,
      visitor: newVisitData.visitor,
      date: newVisitData.date,
      location: newVisitData.location,
      summary: newVisitData.summary.trim(),
    };
    const updated = [visit, ...leadSalesVisits];
    setLeadSalesVisits(updated);
    updateLead(lead.id, { salesVisits: updated });
    setNewVisitData({
      visitor: lead.owner || 'JISMON JOSE',
      date: '2026-09-25',
      location: lead.contactDetails.company + ' Site / Office',
      summary: '',
    });
    setIsAddVisitModalOpen(false);
  };

  // Send Chat message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;
    const msg = {
      id: `chat-${Date.now()}`,
      sender: 'Alex Rivera',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: newChatText.trim(),
      isSelf: true,
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewChatText('');
  };

  // Edit Lead Submit
  const handleSaveEdit = () => {
    updateLead(lead.id, {
      contactDetails: {
        ...lead.contactDetails,
        name: editFormData.name,
        company: editFormData.company,
        phone: editFormData.phone,
        email: editFormData.email,
        whatsapp: editFormData.whatsapp,
      },
      rating: editFormData.rating,
      status: editFormData.status,
      comments: editFormData.comments,
      leadSpecification: editFormData.specification,
      owner: editFormData.owner,
    });
    setIsEditModalOpen(false);
  };

  // Delete Lead Action
  const handleDeleteLead = () => {
    deleteLead(lead.id);
    router.push('/leads');
  };

  return (
    <div className="w-full max-w-full space-y-3 pb-16">
      {/* ── 1. Top Header Banner Bar ───────────────────────────────── */}
      <div className="bg-[#f8fafc] border border-slate-200 rounded-[3px] shadow-xs px-3 sm:px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <ExternalLink className="w-4 h-4 text-slate-700 flex-shrink-0 stroke-[2]" />
          <h1 className="text-xs sm:text-sm font-bold text-[#1e293b] uppercase tracking-wide truncate">
            {lead.contactDetails.name} &nbsp; {lead.contactDetails.company}
          </h1>
        </div>

        {/* Red Close Button */}
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              window.close();
              router.push('/leads');
            } else {
              router.push('/leads');
            }
          }}
          title="Close tab and back to leads"
          className="flex-shrink-0 bg-[#e74c3c] hover:bg-[#c0392b] text-white p-1 rounded-[2px] transition-colors shadow-xs cursor-pointer"
        >
          <X className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ── 2. Subnav Tab Strip ────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-1 bg-slate-50/50 px-1 pt-1">
        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 bg-white border border-slate-200 border-b-transparent rounded-t-[3px] text-xs font-semibold text-slate-800 shadow-xs -mb-[1px]"
        >
          <List className="w-3.5 h-3.5 text-slate-700" />
          <span>Lead</span>
        </button>
      </div>

      {/* ── 3. Lead Details Card ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#f1f3f7] border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs sm:text-[13px] font-bold text-slate-800">Lead Details</h2>
        </div>

        {/* Card Body (2 Columns on desktop, stacked on mobile) */}
        <div className="p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-3.5 gap-x-10 text-xs sm:text-[13px]">
            {/* ── Left Column ── */}
            <div className="space-y-3">
              {/* Lead Owner */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Lead Owner</span>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
                  <img
                    src={
                      lead.ownerAvatar ||
                      lead.createdByAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={lead.owner}
                    className="w-5 h-5 rounded-full object-cover border border-slate-300 flex-shrink-0"
                  />
                  <span className="font-bold text-slate-800 uppercase tracking-tight">
                    {lead.owner || 'JISMON JOSE'}
                  </span>
                </div>
              </div>

              {/* Lead Date */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Lead Date</span>
                <span className="font-semibold text-slate-800 mt-0.5 sm:mt-0">
                  {lead.leadDate || '23 Sep 2026'}
                </span>
              </div>

              {/* Created */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Created</span>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
                  <img
                    src={
                      lead.createdByAvatar ||
                      lead.ownerAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={lead.createdBy}
                    className="w-5 h-5 rounded-full object-cover border border-slate-300 flex-shrink-0"
                  />
                  <span className="font-semibold text-slate-800">
                    {lead.lastActivityDate || '23 Sep 2026 2:15:17 PM'}
                  </span>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Last Activity</span>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-0 flex-wrap">
                  <img
                    src={
                      lead.ownerAvatar ||
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={lead.owner}
                    className="w-5 h-5 rounded-full object-cover border border-slate-300 flex-shrink-0"
                  />
                  <span className="font-semibold text-slate-800">
                    {lead.lastActivityDate || lead.lastActivity || '23 Sep 2026 2:15:17 PM'}
                  </span>
                  <span className="bg-[#5bc0de] text-white text-[11px] px-2 py-0.5 rounded font-medium shadow-xs">
                    {lead.lastActivityTimeAgo || '1 day'}
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right Column ── */}
            <div className="space-y-3">
              {/* Contact Name */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Contact Name</span>
                <span className="font-bold text-slate-900 mt-0.5 sm:mt-0">
                  {lead.contactDetails.name}
                </span>
              </div>

              {/* Customer Name */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Customer Name</span>
                <span className="font-bold text-slate-900 uppercase mt-0.5 sm:mt-0">
                  {lead.contactDetails.company}
                </span>
              </div>

              {/* Business Mobile */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="sm:w-36 flex-shrink-0 flex items-center gap-1.5 text-slate-700 font-normal">
                  <span className="w-1.5 h-3 bg-orange-500 rounded-xs inline-block" />
                  <span>Business Mobile</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 sm:mt-0">
                  <span className="font-bold text-slate-900">{lead.contactDetails.phone}</span>
                  <a
                    href={`https://wa.me/${(lead.contactDetails.whatsapp || lead.contactDetails.phone).replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Chat on WhatsApp"
                    className="flex items-center justify-center w-5 h-5 rounded-full bg-[#25D366] text-white hover:opacity-90 shadow-xs transition-opacity"
                  >
                    <MessageCircle className="w-3 h-3 fill-current" />
                  </a>
                </div>
              </div>

              {/* Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Rating</span>
                <div className="mt-0.5 sm:mt-0">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#337ab7] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                    <Tag className="w-3 h-3" />
                    <span>{lead.rating.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal">Status</span>
                <div className="mt-0.5 sm:mt-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded bg-[#337ab7] text-white text-[11px] font-medium shadow-xs">
                    <Edit className="w-3 h-3" />
                    <span>{lead.status}</span>
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div className="flex flex-col sm:flex-row sm:items-start">
                <span className="text-slate-600 sm:w-36 flex-shrink-0 font-normal pt-0.5">Comments</span>
                <span className="font-bold text-slate-900 uppercase mt-0.5 sm:mt-0">
                  {lead.comments || 'REQUESTED HOSE NOT AVAILABLE WITH US'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Bar at bottom right */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-end flex-wrap gap-2">
            {/* 1. Edit Button */}
            <button
              type="button"
              onClick={() => router.push(`/leads/${lead.id}/edit`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[#337ab7] hover:bg-[#286090] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {/* 2. Assign Lead Button */}
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[#34495e] hover:bg-[#2c3e50] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Assign Lead</span>
            </button>

            {/* 3. Convert Button */}
            <button
              type="button"
              onClick={() => router.push(`/leads/${lead.id}/convert`)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <CornerUpRight className="w-3.5 h-3.5" />
              <span>Convert</span>
            </button>

            {/* 4. Delete Button */}
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[3px] bg-[#d9534f] hover:bg-[#c9302c] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Lead Activities Card ─────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-[3px] shadow-xs overflow-hidden">
        {/* Header */}
        <div className="bg-[#f1f3f7] border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center gap-2">
          <List className="w-4 h-4 text-slate-600" />
          <h2 className="text-xs sm:text-[13px] font-bold text-slate-800">Lead Activities</h2>
        </div>

        {/* Sub-Tabs Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
            {/* Notes Tab */}
            <button
              type="button"
              onClick={() => setActiveActivityTab('Notes')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer',
                activeActivityTab === 'Notes'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Notes</span>
              {leadNotes.length > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                  {leadNotes.length}
                </span>
              )}
            </button>

            {/* Task Tab */}
            <button
              type="button"
              onClick={() => setActiveActivityTab('Task')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer',
                activeActivityTab === 'Task'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Task</span>
              {leadTasks.length > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                  {leadTasks.length}
                </span>
              )}
            </button>

            {/* Files Tab */}
            <button
              type="button"
              onClick={() => setActiveActivityTab('Files')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer',
                activeActivityTab === 'Files'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <Paperclip className="w-3.5 h-3.5 text-slate-500" />
              <span>Files</span>
              {leadFiles.length > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                  {leadFiles.length}
                </span>
              )}
            </button>

            {/* Sales Visit Tab */}
            <button
              type="button"
              onClick={() => setActiveActivityTab('Sales Visit')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] text-xs font-medium transition-colors cursor-pointer',
                activeActivityTab === 'Sales Visit'
                  ? 'bg-white text-slate-900 border border-slate-200 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>Sales Visit</span>
              {leadSalesVisits.length > 0 && (
                <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 text-[10px] rounded-full">
                  {leadSalesVisits.length}
                </span>
              )}
            </button>
          </div>

          {/* + Add Button on right */}
          <button
            type="button"
            onClick={handleAddClick}
            className="flex items-center gap-1 px-3 py-1 rounded-[3px] bg-[#5cb85c] hover:bg-[#4cae4c] text-white text-xs font-medium transition-colors shadow-xs cursor-pointer flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="p-4 sm:p-6 min-h-[140px]">
          {/* Notes Tab Content */}
          {activeActivityTab === 'Notes' && (
            <div>
              {leadNotes.length === 0 ? (
                <p className="text-xs sm:text-[13px] text-slate-700">No Notes.</p>
              ) : (
                <div className="space-y-3">
                  {leadNotes.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-[3px] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{n.author}</span>
                          <span className="text-[11px] text-slate-500">{n.date}</span>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{n.content}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const filtered = leadNotes.filter((x) => x.id !== n.id);
                          setLeadNotes(filtered);
                          updateLead(lead.id, { notes: filtered });
                        }}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Task Tab Content */}
          {activeActivityTab === 'Task' && (
            <div>
              {leadTasks.length === 0 ? (
                <p className="text-xs sm:text-[13px] text-slate-700">No Tasks scheduled for this lead.</p>
              ) : (
                <div className="space-y-2">
                  {leadTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between gap-3 text-xs flex-wrap"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-800">{t.taskDetails}</p>
                        <p className="text-[11px] text-slate-500">
                          Due: {t.dueDate} at {t.dueTime} • Assignee: {t.assignee.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-medium">
                          {t.taskType}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded font-medium">
                          {t.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Files Tab Content */}
          {activeActivityTab === 'Files' && (
            <div>
              {leadFiles.length === 0 ? (
                <p className="text-xs sm:text-[13px] text-slate-700">No Files uploaded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {leadFiles.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-[3px] flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 truncate">{f.name}</p>
                          <p className="text-[10px] text-slate-500">{f.size} • {f.date}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => alert(`Downloading ${f.name}`)}
                        className="h-7 w-7 p-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sales Visit Tab Content */}
          {activeActivityTab === 'Sales Visit' && (
            <div>
              {leadSalesVisits.length === 0 ? (
                <p className="text-xs sm:text-[13px] text-slate-700">No Sales Visits recorded.</p>
              ) : (
                <div className="space-y-3">
                  {leadSalesVisits.map((v) => (
                    <div
                      key={v.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-[3px] space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800">{v.visitor}</span>
                        <span className="text-[11px] text-slate-500">{v.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-red-500" />
                        <span>{v.location}</span>
                      </p>
                      <p className="text-slate-700 bg-white p-2 border border-slate-200 rounded-[2px]">
                        {v.summary}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Floating "Business Chat" Pill Button ─────────────────── */}
      <button
        type="button"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-5 right-5 z-40 bg-[#e83e8c] hover:bg-[#d63384] text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
      >
        <MessageCircle className="w-4 h-4 fill-white text-[#e83e8c]" />
        <span>Business Chat</span>
      </button>

      {/* ── 6. Business Chat Popup Drawer ───────────────────────────── */}
      {isChatOpen && (
        <div className="fixed bottom-16 right-4 sm:right-6 w-[340px] sm:w-[380px] max-w-[calc(100vw-32px)] bg-white border border-slate-300 rounded-lg shadow-2xl z-50 overflow-hidden flex flex-col h-[450px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#e83e8c] text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              <div>
                <h3 className="text-xs font-bold leading-tight">Business Chat</h3>
                <p className="text-[10px] text-pink-100">{lead.contactDetails.name} ({lead.contactDetails.company})</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-50 text-xs">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={cn('flex flex-col', m.isSelf ? 'items-end' : 'items-start')}
              >
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-0.5">
                  <span>{m.sender}</span>
                  <span>•</span>
                  <span>{m.time}</span>
                </div>
                <div
                  className={cn(
                    'p-2.5 rounded-lg max-w-[85%] leading-relaxed shadow-xs',
                    m.isSelf
                      ? 'bg-[#e83e8c] text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                  )}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="p-2 border-t border-slate-200 bg-white flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message to team..."
              value={newChatText}
              onChange={(e) => setNewChatText(e.target.value)}
              className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded focus:outline-none focus:border-[#e83e8c]"
            />
            <button
              type="submit"
              disabled={!newChatText.trim()}
              className="p-2 bg-[#e83e8c] hover:bg-[#d63384] text-white rounded disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* ── MODALS ─────────────────────────────────────────────────── */}

      {/* 1. Edit Lead Modal */}
      {isEditModalOpen && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Lead Details"
          description="Update contact information, rating, status, and lead notes."
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Contact Name *"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              />
              <Input
                label="Customer / Company Name *"
                value={editFormData.company}
                onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
              />
              <Input
                label="Business Mobile / Phone *"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
              <Input
                label="WhatsApp Number"
                value={editFormData.whatsapp}
                onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
              />
              <Select
                label="Rating"
                value={editFormData.rating}
                onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value as LeadRating })}
                options={[
                  { label: 'COLD', value: 'Cold' },
                  { label: 'WARM', value: 'Warm' },
                  { label: 'HOT', value: 'Hot' },
                ]}
              />
              <Select
                label="Status"
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as LeadStatus })}
                options={[
                  { label: 'New', value: 'New' },
                  { label: 'Contacted', value: 'Contacted' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Qualified', value: 'Qualified' },
                  { label: 'Converted', value: 'Converted' },
                ]}
              />
            </div>

            <Input
              label="Comments / Notes"
              value={editFormData.comments}
              onChange={(e) => setEditFormData({ ...editFormData, comments: e.target.value })}
            />

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 2. Assign Lead Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800">Assign Lead</h3>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 sm:gap-4 text-xs sm:text-[13px]">
                <label className="sm:col-span-3 text-slate-700 font-normal">
                  Assign To
                </label>
                <div className="sm:col-span-9 relative flex items-center border border-slate-300 rounded-[3px] bg-white px-2.5 py-1.5 focus-within:border-[#006f8e] shadow-2xs">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                    alt="avatar"
                    className="w-4 h-4 rounded-full object-cover mr-2 flex-shrink-0"
                  />
                  <select
                    value={assignOwner}
                    onChange={(e) => setAssignOwner(e.target.value)}
                    className="w-full bg-transparent text-slate-800 text-xs sm:text-[13px] font-semibold uppercase focus:outline-none cursor-pointer pr-4 appearance-none"
                  >
                    <option value="JISMON JOSE">JISMON JOSE</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                    <option value="Elena Rostova">Elena Rostova</option>
                    <option value="Jordan Hayes">Jordan Hayes</option>
                    <option value="Mohammed Rashid">Mohammed Rashid</option>
                  </select>
                  <span className="absolute right-2.5 pointer-events-none text-slate-500 text-[10px]">▼</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#edf0f5] px-4 py-2.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="px-3.5 py-1.5 rounded-[3px] bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  updateLead(lead.id, {
                    owner: assignOwner,
                    leadAssigned: { name: assignOwner },
                    assignedDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
                  });
                  setIsAssignModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-[3px] bg-[#004b6e] hover:bg-[#003b57] text-white text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Convert Lead Modal */}
      {isConvertModalOpen && (
        <Modal
          isOpen={isConvertModalOpen}
          onClose={() => setIsConvertModalOpen(false)}
          title={`Convert Lead: ${lead.contactDetails.name}`}
          description={`Convert ${lead.contactDetails.company} into an Active Account and Opportunity.`}
        >
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] space-y-1">
              <p className="font-bold">Conversion Summary:</p>
              <p>• Account Name: <strong>{lead.contactDetails.company}</strong></p>
              <p>• Contact Person: <strong>{lead.contactDetails.name}</strong></p>
              <p>• Deal Pipeline Stage: <strong>Opportunity / Quotation</strong></p>
              <p>• Estimated Value: <strong>AED {(lead.value || 45000).toLocaleString()}</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsConvertModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white"
                onClick={() => {
                  updateLead(lead.id, { status: 'Converted' });
                  addCustomer({
                    customerName: lead.contactDetails.company,
                    contactPerson: lead.contactDetails.name,
                    phone: lead.contactDetails.phone,
                    email: lead.contactDetails.email || '',
                    owner: lead.owner || 'Alex Rivera',
                    status: 'Active',
                    lastActivity: 'Just converted from Lead',
                    companyGroup: 'Key Corporate Accounts',
                    totalDeals: 1,
                    totalSpend: lead.value || 45000,
                  });
                  addOpportunity({
                    title: `CTEQ#${Math.floor(1000 + Math.random() * 9000)} ${lead.leadSpecification || 'INDUSTRIAL FITTINGS'} / ${lead.contactDetails.company.toUpperCase()}`,
                    customer: lead.contactDetails.company,
                    amount: lead.value || 45000,
                    stage: 'Opportunity',
                    owner: lead.owner || 'Alex Rivera',
                    probability: 75,
                    expectedClose: '2026-10-15',
                  });
                  alert(`Lead "${lead.contactDetails.name}" converted successfully into Customer & Sales Opportunity!`);
                  setIsConvertModalOpen(false);
                }}
              >
                Confirm Conversion
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 4. Delete Lead Modal */}
      {isDeleteModalOpen && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Lead Record"
          description={`Are you sure you want to permanently delete lead record for ${lead.contactDetails.name} (${lead.contactDetails.company})?`}
        >
          <div className="space-y-3 text-xs">
            <p className="text-red-600 bg-red-50 p-3 border border-red-200 rounded">
              This action cannot be undone. All linked activity records will be archived.
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDeleteLead}
              >
                Delete Lead
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 5. Add Note Modal */}
      {isAddNoteModalOpen && (
        <Modal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          title="Add Note to Lead"
          description={`Record internal notes or discussion updates for ${lead.contactDetails.name}.`}
        >
          <div className="space-y-3 text-xs">
            <textarea
              rows={4}
              placeholder="Enter note details..."
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. Add Task Modal */}
      {isAddTaskModalOpen && (
        <Modal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          title="Schedule Task for Lead"
          description={`Create a follow-up or meeting task tied to ${lead.contactDetails.name}.`}
        >
          <div className="space-y-3 text-xs">
            <Input
              label="Task Details *"
              placeholder="e.g. Follow up on proposal submission"
              value={newTaskData.title}
              onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Due Date"
                type="date"
                value={newTaskData.dueDate}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
              />
              <Input
                label="Due Time"
                type="time"
                value={newTaskData.dueTime}
                onChange={(e) => setNewTaskData({ ...newTaskData, dueTime: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveTask}>
                Create Task
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. Add File Modal */}
      {isAddFileModalOpen && (
        <Modal
          isOpen={isAddFileModalOpen}
          onClose={() => setIsAddFileModalOpen(false)}
          title="Attach Document / File"
          description="Upload technical drawings, datasheets, or RFQ documents."
        >
          <div className="space-y-3 text-xs">
            <Input
              label="File Name / Title *"
              placeholder="e.g. Hydraulic_Hose_Specs_v2.pdf"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
            />
            <div className="p-4 border-2 border-dashed border-slate-300 rounded text-center text-slate-500 bg-slate-50">
              <Paperclip className="w-6 h-6 mx-auto text-slate-400 mb-1" />
              <p>Drag and drop documents here, or browse files</p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddFileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveFile}>
                Upload File
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. Add Sales Visit Modal */}
      {isAddVisitModalOpen && (
        <Modal
          isOpen={isAddVisitModalOpen}
          onClose={() => setIsAddVisitModalOpen(false)}
          title="Log Sales Visit"
          description={`Record on-site meeting notes for ${lead.contactDetails.company}.`}
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Visit Date"
                type="date"
                value={newVisitData.date}
                onChange={(e) => setNewVisitData({ ...newVisitData, date: e.target.value })}
              />
              <Input
                label="Location"
                value={newVisitData.location}
                onChange={(e) => setNewVisitData({ ...newVisitData, location: e.target.value })}
              />
            </div>
            <textarea
              rows={3}
              placeholder="Meeting discussion notes & action items..."
              value={newVisitData.summary}
              onChange={(e) => setNewVisitData({ ...newVisitData, summary: e.target.value })}
              className="w-full text-xs p-2.5 border border-slate-300 rounded focus:outline-none focus:border-blue-600"
            />
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddVisitModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSaveVisit}>
                Log Visit
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
