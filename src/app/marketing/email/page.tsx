'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Mail,
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
  Radio,
  Calendar,
  Users,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface EmailCampaignItem {
  id: string;
  name: string;
  subject: string;
  targetSegment: string;
  sentCount: number;
  deliveredCount: number;
  openRate: string;
  clickRate: string;
  status: 'Sent' | 'Scheduled' | 'Draft' | 'Delivering';
  sentDate: string;
  senderEmail: string;
}

const INITIAL_EMAIL_CAMPAIGNS: EmailCampaignItem[] = [];

function EmailMarketingContent() {
  const [campaigns, setCampaigns] = useState<EmailCampaignItem[]>(INITIAL_EMAIL_CAMPAIGNS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<EmailCampaignItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    targetSegment: 'Existing AMC Clients (Commercial)',
    senderEmail: 'solutions@cooltechnologies.ae',
    sendSchedule: 'Immediate',
    template: 'UAE HVAC AMC VIP Offer',
    content: 'Dear Valued Client,\n\nAs part of Cool Technologies ongoing commitment to excellence...',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) return;

    const newBlast: EmailCampaignItem = {
      id: `EML-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      subject: formData.subject,
      targetSegment: formData.targetSegment,
      sentCount: formData.sendSchedule === 'Immediate' ? 1450 : 0,
      deliveredCount: formData.sendSchedule === 'Immediate' ? 1435 : 0,
      openRate: '0.0%',
      clickRate: '0.0%',
      status: formData.sendSchedule === 'Immediate' ? 'Sent' : 'Scheduled',
      sentDate: formData.sendSchedule === 'Immediate' ? 'Just now' : 'Scheduled for tomorrow',
      senderEmail: formData.senderEmail,
    };

    setCampaigns([newBlast, ...campaigns]);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      subject: '',
      targetSegment: 'Existing AMC Clients (Commercial)',
      senderEmail: 'solutions@cooltechnologies.ae',
      sendSchedule: 'Immediate',
      template: 'UAE HVAC AMC VIP Offer',
      content: '',
    });
    showToast(`Email blast "${newBlast.name}" created successfully!`);
  };

  const deleteEmailCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    showToast('Email campaign deleted successfully');
  };

  const duplicateEmailCampaign = (item: EmailCampaignItem) => {
    const copy: EmailCampaignItem = {
      ...item,
      id: `EML-${Math.floor(100 + Math.random() * 900)}`,
      name: `${item.name} (Copy)`,
      status: 'Draft',
      sentCount: 0,
      deliveredCount: 0,
      openRate: '0.0%',
      clickRate: '0.0%',
    };
    setCampaigns([copy, ...campaigns]);
    showToast(`Email campaign duplicated as "${copy.name}"`);
  };

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.subject.toLowerCase().includes(search.toLowerCase()) ||
        c.targetSegment.toLowerCase().includes(search.toLowerCase()) ||
        c.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [campaigns, search, statusFilter]);

  const totalSent = campaigns.reduce((sum, c) => sum + c.sentCount, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.deliveredCount, 0);
  const deliveredRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '100';

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Mail className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Email Marketing</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Deliver high-conversion enterprise email broadcasts, track open rates, and engage decision makers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Email Blast</span>
        </button>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Email Blasts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{campaigns.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">All campaigns</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Total Emails Sent</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalSent.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-blue-600">Dispatched</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Delivery Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{deliveredRate}%</p>
          <span className="text-[11px] font-semibold text-emerald-600">High inbox placement</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Avg. Open Rate</span>
          <p className="text-2xl font-black text-purple-600 mt-1">74.8%</p>
          <span className="text-[11px] font-semibold text-purple-600">Above industry avg</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Avg. Click Rate</span>
          <p className="text-2xl font-black text-amber-600 mt-1">24.9%</p>
          <span className="text-[11px] font-semibold text-amber-600">High engagement</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email blasts, subjects, segments..."
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
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Email Blasts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Email Campaign Records</h2>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} Campaigns</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign &amp; Subject</th>
                <th className="py-3 px-3">Target Segment</th>
                <th className="py-3 px-3 text-center">Volume Sent</th>
                <th className="py-3 px-3 text-center">Open Rate</th>
                <th className="py-3 px-3 text-center">Click Rate</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p className="text-slate-900">{item.name}</p>
                    <p className="text-[11px] text-slate-500 font-normal italic truncate max-w-xs">{item.subject}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      <Users className="w-3 h-3" />
                      <span>{item.targetSegment}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.sentCount > 0 ? item.sentCount.toLocaleString() : '—'}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {item.openRate}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      {item.clickRate}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        item.status === 'Sent'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'Delivering'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : item.status === 'Scheduled'
                          ? 'bg-amber-100 text-amber-800'
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
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="View Preview & Stats"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateEmailCampaign(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="Clone Blast"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEmailCampaign(item.id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Blast"
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

      {/* MODAL 1: Create Email Blast */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create Email Campaign Blast</h2>
                <p className="text-xs text-slate-500">Dispatch branded HTML email communications to segmented leads</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEmail} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 HVAC Facility Management Special Announcement"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Subject Line *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Save 20% on Annual Cooling Plant Maintenance"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sender Email</label>
                  <select
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="solutions@cooltechnologies.ae">solutions@cooltechnologies.ae</option>
                    <option value="accounts@cooltechnologies.ae">accounts@cooltechnologies.ae</option>
                    <option value="service@cooltechnologies.ae">service@cooltechnologies.ae</option>
                    <option value="newsletter@cooltechnologies.ae">newsletter@cooltechnologies.ae</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Segment</label>
                  <select
                    value={formData.targetSegment}
                    onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Existing AMC Clients (Commercial)">Existing AMC Clients (Commercial)</option>
                    <option value="Industrial Warehousing & Plants">Industrial Warehousing & Plants</option>
                    <option value="Hospitality & Hotels Dubai/Abu Dhabi">Hospitality & Hotels Dubai/Abu Dhabi</option>
                    <option value="Educational & Healthcare Facilities">Educational & Healthcare Facilities</option>
                    <option value="Property Developers & Facility Managers">Property Developers & Facility Managers</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Schedule</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="schedule"
                      value="Immediate"
                      checked={formData.sendSchedule === 'Immediate'}
                      onChange={() => setFormData({ ...formData, sendSchedule: 'Immediate' })}
                      className="text-blue-600"
                    />
                    <span>Send Immediately</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-semibold">
                    <input
                      type="radio"
                      name="schedule"
                      value="Schedule"
                      checked={formData.sendSchedule === 'Schedule'}
                      onChange={() => setFormData({ ...formData, sendSchedule: 'Schedule' })}
                      className="text-blue-600"
                    />
                    <span>Schedule for Later</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email Body Content</label>
                <textarea
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter email body or HTML snippet..."
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
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  {formData.sendSchedule === 'Immediate' ? 'Launch & Send Blast' : 'Schedule Blast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Email Details & Preview */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{previewItem.name}</h2>
                <p className="text-xs text-slate-500">Campaign ID: {previewItem.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <p className="font-bold text-slate-900">Subject: {previewItem.subject}</p>
                <p className="text-slate-500">From: {previewItem.senderEmail}</p>
                <p className="text-slate-500">To Segment: {previewItem.targetSegment}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-[10px] font-bold text-blue-700 uppercase">Recipients</p>
                  <p className="text-base font-black text-blue-900 mt-0.5">{previewItem.sentCount}</p>
                </div>
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-[10px] font-bold text-purple-700 uppercase">Open Rate</p>
                  <p className="text-base font-black text-purple-900 mt-0.5">{previewItem.openRate}</p>
                </div>
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase">Click Rate</p>
                  <p className="text-base font-black text-emerald-900 mt-0.5">{previewItem.clickRate}</p>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailMarketingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Email Marketing...</div>}>
      <EmailMarketingContent />
    </Suspense>
  );
}
