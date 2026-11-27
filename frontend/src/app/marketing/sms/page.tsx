'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Smartphone,
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
  CreditCard,
  Users,
  MessageSquare,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface SmsCampaignItem {
  id: string;
  name: string;
  senderId: string;
  audience: string;
  sentCount: number;
  deliveredCount: number;
  deliveryRate: string;
  status: 'Sent' | 'Scheduled' | 'Delivering' | 'Draft';
  sentDate: string;
  messageText: string;
}

const INITIAL_SMS_CAMPAIGNS: SmsCampaignItem[] = [];

export function SmsContent() {
  const [campaigns, setCampaigns] = useState<SmsCampaignItem[]>(INITIAL_SMS_CAMPAIGNS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<SmsCampaignItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    senderId: 'COOLTECH',
    audience: 'Tier-1 Facility Managers Dubai',
    messageText: 'Cool Technologies: Special preventive maintenance slots available this week for central cooling systems. Call 800-COOLTECH.',
    schedule: 'Immediate',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateSms = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.messageText) return;

    const newSms: SmsCampaignItem = {
      id: `SMS-${Math.floor(300 + Math.random() * 700)}`,
      name: formData.name,
      senderId: formData.senderId,
      audience: formData.audience,
      sentCount: formData.schedule === 'Immediate' ? 1500 : 0,
      deliveredCount: formData.schedule === 'Immediate' ? 1488 : 0,
      deliveryRate: formData.schedule === 'Immediate' ? '99.2%' : '0.0%',
      status: formData.schedule === 'Immediate' ? 'Sent' : 'Scheduled',
      sentDate: formData.schedule === 'Immediate' ? 'Just now' : 'Scheduled for tomorrow',
      messageText: formData.messageText,
    };

    setCampaigns([newSms, ...campaigns]);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      senderId: 'COOLTECH',
      audience: 'Tier-1 Facility Managers Dubai',
      messageText: '',
      schedule: 'Immediate',
    });
    showToast(`SMS campaign "${newSms.name}" created!`);
  };

  const deleteSmsCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('SMS campaign deleted successfully');
  };

  const duplicateSmsCampaign = (item: SmsCampaignItem) => {
    const copy: SmsCampaignItem = {
      ...item,
      id: `SMS-${Math.floor(300 + Math.random() * 700)}`,
      name: `${item.name} (Copy)`,
      status: 'Draft',
    };
    setCampaigns([copy, ...campaigns]);
    showToast(`SMS campaign copied as "${copy.name}"`);
  };

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.senderId.toLowerCase().includes(search.toLowerCase()) ||
        c.audience.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaigns, search, statusFilter]);

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const charLength = formData.messageText.length;
  const smsCount = Math.ceil(charLength / 160) || 1;

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
              <div className="p-1 rounded bg-purple-50 text-purple-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">SMS Campaigns</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Broadcast high-priority SMS notifications and promotional alerts with verified TRA UAE Sender IDs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New SMS Campaign</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total SMS Blasts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{campaigns.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Campaign records</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Messages Dispatched</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalSent.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-purple-600">To UAE mobile networks</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Delivery Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">99.4%</p>
          <span className="text-[11px] font-semibold text-emerald-600">Direct carrier routing</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">SMS Credit Balance</span>
          <p className="text-2xl font-black text-blue-600 mt-1">18,450</p>
          <span className="text-[11px] font-semibold text-blue-600">Credits available</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-600">Sender IDs Active</span>
          <p className="text-2xl font-black text-slate-900 mt-1">3</p>
          <span className="text-[11px] font-semibold text-slate-400">TRA Registered</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search SMS campaigns, sender IDs..."
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
            <option value="Scheduled">Scheduled</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">SMS Campaign Queue</h2>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} Campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-3">Sender ID</th>
                <th className="py-3 px-3">Target Audience</th>
                <th className="py-3 px-3 text-center">Volume</th>
                <th className="py-3 px-3 text-center">Delivery %</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Sent Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{item.messageText}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 text-slate-800 border border-slate-200">
                      {item.senderId}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      <Users className="w-3 h-3" />
                      <span>{item.audience}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.sentCount > 0 ? item.sentCount.toLocaleString() : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                    {item.deliveryRate}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        item.status === 'Sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {item.sentDate}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewItem(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                        title="View SMS Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateSmsCampaign(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-purple-600 hover:bg-purple-50"
                        title="Clone Campaign"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSmsCampaign(item.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Campaign"
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

      {/* MODAL 1: Create SMS */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New SMS Campaign</h2>
                <p className="text-xs text-slate-500">Configure SMS text, character limits, and sender ID</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSms} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rapid Weekend On-Call Technician Push"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender ID</label>
                  <select
                    value={formData.senderId}
                    onChange={(e) => setFormData({ ...formData, senderId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="COOLTECH">COOLTECH (TRA Approved)</option>
                    <option value="COOLTECH-AMC">COOLTECH-AMC (TRA Approved)</option>
                    <option value="COOLTECH-ALERT">COOLTECH-ALERT (TRA Approved)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Segment</label>
                  <select
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Tier-1 Facility Managers Dubai">Tier-1 Facility Managers Dubai</option>
                    <option value="Active Today Work Orders">Active Today Work Orders</option>
                    <option value="AMC Clients Expiring in 30 Days">AMC Clients Expiring in 30 Days</option>
                    <option value="Commercial Towers Dubai Marina">Commercial Towers Dubai Marina</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">SMS Message Body *</label>
                  <span className="text-[11px] font-bold text-purple-700">
                    {charLength} chars • {smsCount} SMS Part(s)
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  value={formData.messageText}
                  onChange={(e) => setFormData({ ...formData, messageText: e.target.value })}
                  placeholder="Type SMS text..."
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs"
                >
                  Dispatch SMS Blast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SMS Mobile Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-100 w-full max-w-sm rounded-3xl shadow-2xl border-4 border-slate-800 p-4 space-y-3 animate-in zoom-in-95 duration-150">
            <div className="bg-slate-800 -mx-4 -mt-4 p-3 rounded-t-2xl flex items-center justify-between text-white">
              <div>
                <p className="font-bold text-xs">{previewItem.senderId}</p>
                <p className="text-[10px] text-slate-300">Standard SMS Message</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="text-white hover:text-slate-300 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3.5 shadow-sm text-xs text-slate-800 space-y-2 border border-slate-200">
              <p className="leading-relaxed">{previewItem.messageText}</p>
              <p className="text-[10px] text-slate-400 text-right">{previewItem.sentDate}</p>
            </div>

            <div className="pt-2">
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

export default function SmsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading SMS Campaigns...</div>}>
      <SmsContent />
    </Suspense>
  );
}
