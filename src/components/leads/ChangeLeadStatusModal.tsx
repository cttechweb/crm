'use client';

import React, { useState, useEffect } from 'react';
import { X, ChevronDown, Plus, Check } from 'lucide-react';
import { CrmLead, LeadRating, LeadStatus } from '@/types/enterprise-crm';
import { cn } from '@/lib/utils';

export function getRatingBadgeClass(rating?: string) {
  const r = (rating || '').toLowerCase();
  if (r === 'hot') {
    return 'bg-[#d9534f] hover:bg-[#c9302c] text-white';
  }
  if (r === 'warm') {
    return 'bg-[#f0ad4e] hover:bg-[#ec971f] text-white';
  }
  return 'bg-[#337ab7] hover:bg-[#286090] text-white'; // COLD
}

export function getStatusBadgeClass(status?: string) {
  const s = (status || '').toLowerCase().trim();
  if (s === 'pending') {
    return 'bg-[#EAB308] hover:bg-[#CA8A04] text-white'; // Yellow
  }
  if (s === 'contacted') {
    return 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'; // Blue
  }
  if (s === 'disqualified' || s === 'disqualify' || s === 'lost' || s === 'cancelled' || s === 'rejected') {
    return 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'; // Red
  }
  if (s === 'inprocess' || s === 'in process' || s === 'in-process' || s === 'in progress') {
    return 'bg-[#0284C7] hover:bg-[#0369A1] text-white'; // Sky Blue
  }
  if (s === 'completed' || s === 'won' || s === 'converted') {
    return 'bg-[#16A34A] hover:bg-[#15803D] text-white'; // Green
  }
  return 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white';
}

const DEFAULT_STATUSES = ['Pending', 'Contacted', 'Disqualified'];

interface ChangeLeadStatusModalProps {
  isOpen: boolean;
  lead: CrmLead | null;
  onClose: () => void;
  onUpdate: (updatedData: {
    status: LeadStatus;
    rating: LeadRating;
    comments: string;
    addNote: boolean;
  }) => void;
}

export function ChangeLeadStatusModal({
  isOpen,
  lead,
  onClose,
  onUpdate,
}: ChangeLeadStatusModalProps) {
  const [status, setStatus] = useState<string>('Pending');
  const [rating, setRating] = useState<string>('Cold');
  const [comments, setComments] = useState<string>('');
  const [addNote, setAddNote] = useState<boolean>(false);

  // Status options list (with default 3 + custom saved statuses)
  const [availableStatuses, setAvailableStatuses] = useState<string[]>(DEFAULT_STATUSES);
  const [isAddingNewStatus, setIsAddingNewStatus] = useState<boolean>(false);
  const [newStatusInput, setNewStatusInput] = useState<string>('');

  // Load custom statuses from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('crm_lead_custom_statuses');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const combined = Array.from(new Set([...DEFAULT_STATUSES, ...parsed]));
            setAvailableStatuses(combined);
          }
        }
      } catch (e) {
        console.error('Error loading custom statuses:', e);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (lead) {
      const currentStatus = lead.status || 'Pending';
      setStatus(currentStatus);
      setRating(lead.rating || 'Cold');
      setComments(lead.comments || '');
      setAddNote(false);
      setIsAddingNewStatus(false);
      setNewStatusInput('');
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleAddNewStatus = () => {
    const trimmed = newStatusInput.trim();
    if (!trimmed) return;

    const updated = Array.from(new Set([...availableStatuses, trimmed]));
    setAvailableStatuses(updated);
    setStatus(trimmed);
    setIsAddingNewStatus(false);
    setNewStatusInput('');

    if (typeof window !== 'undefined') {
      try {
        const customOnly = updated.filter((s) => !DEFAULT_STATUSES.includes(s));
        localStorage.setItem('crm_lead_custom_statuses', JSON.stringify(customOnly));
      } catch (e) {}
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__ADD_NEW__') {
      setIsAddingNewStatus(true);
    } else {
      setStatus(val);
      setIsAddingNewStatus(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      status: status as LeadStatus,
      rating: rating as LeadRating,
      comments: comments.trim(),
      addNote,
    });
  };

  const normalizedRating = rating.toLowerCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white rounded-[4px] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150 text-[#212529]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
            Change Lead Status and Rating
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-sm cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit}>
          <div className="p-5 space-y-4 text-xs bg-white">
            {/* 1. Status Dropdown / Add New */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-normal text-slate-700">
                Status
              </label>
              <div className="col-span-9 space-y-2">
                <div className="relative">
                  <select
                    value={isAddingNewStatus ? '__ADD_NEW__' : status}
                    onChange={handleSelectChange}
                    className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer shadow-2xs"
                  >
                    {availableStatuses.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="font-semibold text-blue-600">
                      + Add New Status...
                    </option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* Inline Add New Status Input */}
                {isAddingNewStatus && (
                  <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Enter new status name (e.g. In Negotiation)..."
                      value={newStatusInput}
                      onChange={(e) => setNewStatusInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewStatus();
                        }
                      }}
                      className="flex-1 bg-white border border-blue-400 rounded-[3px] px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewStatus}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-[3px] text-xs font-semibold cursor-pointer shadow-2xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewStatus(false)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-[3px] text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Rating Toggle Buttons */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label className="col-span-3 text-xs font-normal text-slate-700 flex items-center gap-1">
                <span>Rating</span>
                <span
                  className="w-3.5 h-3.5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold cursor-help"
                  title="Lead temperature: Cold, Warm, or Hot"
                >
                  ?
                </span>
              </label>
              <div className="col-span-9 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setRating('Cold')}
                  className={cn(
                    'px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                    normalizedRating === 'cold'
                      ? 'bg-[#0284C7] text-white ring-1 ring-[#0284C7]'
                      : 'bg-[#EBF3FB] text-[#0284C7] hover:bg-[#D9EAF8] border border-sky-200'
                  )}
                >
                  COLD
                </button>
                <button
                  type="button"
                  onClick={() => setRating('Warm')}
                  className={cn(
                    'px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                    normalizedRating === 'warm'
                      ? 'bg-[#F59E0B] text-white ring-1 ring-[#F59E0B]'
                      : 'bg-[#FEF3C7] text-[#D97706] hover:bg-[#FDE68A] border border-amber-200'
                  )}
                >
                  WARM
                </button>
                <button
                  type="button"
                  onClick={() => setRating('Hot')}
                  className={cn(
                    'px-3 py-1 rounded-[2px] text-[11px] font-bold uppercase transition-all cursor-pointer shadow-2xs',
                    normalizedRating === 'hot'
                      ? 'bg-[#E11D48] text-white ring-1 ring-[#E11D48]'
                      : 'bg-[#FFE4E6] text-[#E11D48] hover:bg-[#FECDD3] border border-rose-200'
                  )}
                >
                  HOT
                </button>
              </div>
            </div>

            {/* 3. Comments Textarea */}
            <div className="grid grid-cols-12 gap-3 items-start">
              <label className="col-span-3 text-xs font-normal text-slate-700 pt-1.5">
                Comments
              </label>
              <div className="col-span-9">
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments or reason for change..."
                  className="w-full bg-white border border-slate-300 rounded-[3px] px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs resize-y"
                />
              </div>
            </div>

            {/* 4. Add Note Checkbox */}
            <div className="grid grid-cols-12 gap-3 items-center">
              <label
                htmlFor="modal-add-note-checkbox"
                className="col-span-3 text-xs font-normal text-slate-700 cursor-pointer"
              >
                Add Note
              </label>
              <div className="col-span-9 flex items-center">
                <input
                  id="modal-add-note-checkbox"
                  type="checkbox"
                  checked={addNote}
                  onChange={(e) => setAddNote(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-4 py-3 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-[3px] bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-[3px] bg-[#004b6e] hover:bg-[#003852] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
