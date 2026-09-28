'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  Eye,
  Send,
  Trash2,
  Copy,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  X,
  Smartphone,
  Users,
  CheckCheck,
  PhoneCall,
  Calendar,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface WhatsAppBroadcastItem {
  id: string;
  name: string;
  templateName: string;
  audience: string;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliesCount: number;
  status: 'Sent' | 'Delivering' | 'Scheduled' | 'Failed';
  sentTime: string;
  messageText: string;
}

const INITIAL_WHATSAPP_BROADCASTS: WhatsAppBroadcastItem[] = [];

function WhatsAppContent() {
  const [broadcasts, setBroadcasts] = useState<WhatsAppBroadcastItem[]>(INITIAL_WHATSAPP_BROADCASTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<WhatsAppBroadcastItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    templateName: 'hvac_emergency_support_v2',
    audience: 'Tier-1 Facility Managers Dubai',
    senderNumber: '+971 4 800 COOL (Verified WhatsApp Official API)',
    messageText: '❄️ *Cool Technologies Official Update*\n\nDear Valued Partner, our preventive maintenance team is offering priority scheduling for your cooling plants this month.\n\nReply to this message for immediate assistance.',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newBroadcast: WhatsAppBroadcastItem = {
      id: `WA-${Math.floor(200 + Math.random() * 800)}`,
      name: formData.name,
      templateName: formData.templateName,
      audience: formData.audience,
      sentCount: 850,
      deliveredCount: 842,
      readCount: 710,
      repliesCount: 45,
      status: 'Sent',
      sentTime: 'Just now',
      messageText: formData.messageText,
    };

    setBroadcasts([newBroadcast, ...broadcasts]);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      templateName: 'hvac_emergency_support_v2',
      audience: 'Tier-1 Facility Managers Dubai',
      senderNumber: '+971 4 800 COOL (Verified WhatsApp Official API)',
      messageText: '',
    });
    showToast(`WhatsApp Broadcast "${newBroadcast.name}" dispatched!`);
  };

  const deleteBroadcast = (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    showToast('Broadcast deleted successfully');
  };

  const duplicateBroadcast = (item: WhatsAppBroadcastItem) => {
    const copy: WhatsAppBroadcastItem = {
      ...item,
      id: `WA-${Math.floor(200 + Math.random() * 800)}`,
      name: `${item.name} (Copy)`,
      sentTime: 'Draft',
    };
    setBroadcasts([copy, ...broadcasts]);
    showToast(`Broadcast copied as "${copy.name}"`);
  };

  const filtered = useMemo(() => {
    return broadcasts.filter((b) => {
      const matchSearch =
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.templateName.toLowerCase().includes(search.toLowerCase()) ||
        b.audience.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [broadcasts, search, statusFilter]);

  const totalSent = broadcasts.reduce((sum, b) => sum + b.sentCount, 0);
  const totalDelivered = broadcasts.reduce((sum, b) => sum + b.deliveredCount, 0);
  const totalRead = broadcasts.reduce((sum, b) => sum + b.readCount, 0);
  const totalReplies = broadcasts.reduce((sum, b) => sum + b.repliesCount, 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-emerald-50 text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">WhatsApp Campaigns</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Broadcast verified WhatsApp Business API messages, track real-time read receipts, and manage customer inquiries.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Send WhatsApp Broadcast</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Broadcasts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{broadcasts.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Meta Cloud API</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Messages Sent</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalSent.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Dispatched</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Delivered Rate</span>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '100'}%
          </p>
          <span className="text-[11px] font-semibold text-blue-600">Verified handoffs</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-teal-600">Read Receipts</span>
          <p className="text-2xl font-black text-teal-600 mt-1">
            {totalDelivered > 0 ? ((totalRead / totalDelivered) * 100).toFixed(1) : '0'}%
          </p>
          <span className="text-[11px] font-semibold text-teal-600">Blue double-ticks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Direct Inquiries</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{totalReplies.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-amber-600">Inbound chats</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search broadcasts, templates, audience..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Sent">Sent</option>
            <option value="Delivering">Delivering</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">WhatsApp Broadcast Log</h2>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} Broadcasts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Broadcast Name</th>
                <th className="py-3 px-3">Target Audience</th>
                <th className="py-3 px-3 text-center">Delivered</th>
                <th className="py-3 px-3 text-center">Read %</th>
                <th className="py-3 px-3 text-center">Replies</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.templateName}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Users className="w-3 h-3" />
                      <span>{item.audience}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.deliveredCount.toLocaleString()} / {item.sentCount.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center gap-1 font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      <CheckCheck className="w-3.5 h-3.5 text-teal-600" />
                      {((item.readCount / item.deliveredCount) * 100).toFixed(0)}%
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                    {item.repliesCount}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        item.status === 'Sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Delivering'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      )}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {item.sentTime}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Live Chat Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateBroadcast(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                        title="Clone Broadcast"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBroadcast(item.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Broadcast"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create Broadcast */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">New WhatsApp Broadcast</h2>
                <p className="text-xs text-slate-500">Dispatch Meta WhatsApp API verified template messages</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBroadcast} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Broadcast Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. October Chiller Preventative AMC Push"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">WhatsApp Template</label>
                  <select
                    value={formData.templateName}
                    onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="hvac_emergency_support_v2">hvac_emergency_support_v2 (Approved)</option>
                    <option value="amc_renewal_discount_oct">amc_renewal_discount_oct (Approved)</option>
                    <option value="energy_efficiency_vrf_promo">energy_efficiency_vrf_promo (Approved)</option>
                    <option value="post_service_feedback_interactive">post_service_feedback_interactive (Approved)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Segment</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Tier-1 Facility Managers Dubai">Tier-1 Facility Managers Dubai (2,450)</option>
                    <option value="Commercial AMC Contract Holders">Commercial AMC Contract Holders (1,890)</option>
                    <option value="Industrial Plant Owners & Warehouses">Industrial Plant Owners (1,200)</option>
                    <option value="Completed Jobs This Week">Completed Jobs This Week (420)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sender WhatsApp Channel</label>
                <input
                  type="text"
                  disabled
                  value={formData.senderNumber}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Message Preview Content</label>
                <textarea
                  rows={4}
                  value={formData.messageText}
                  onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Dispatch Broadcast Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: WhatsApp Live Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-[#ECE5DD] w-full max-w-sm rounded-3xl shadow-2xl border-4 border-slate-800 p-4 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="bg-[#075E54] -mx-4 -mt-4 p-3 rounded-t-2xl flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[#075E54] font-bold text-xs">
                  CT
                </div>
                <div>
                  <p className="font-bold text-xs">Cool Technologies</p>
                  <p className="text-[10px] text-emerald-200">Verified Official Account</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-white hover:text-emerald-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3.5 shadow-sm text-xs text-slate-800 space-y-2 relative">
              <p className="whitespace-pre-wrap leading-relaxed">{previewItem.messageText}</p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 pt-1">
                <span>11:32 AM</span>
                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
              </div>
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="w-full py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WhatsAppPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading WhatsApp Campaigns...</div>}>
      <WhatsAppContent />
    </Suspense>
  );
}
