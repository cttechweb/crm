'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Copy,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  Mail,
  MessageSquare,
  Smartphone,
  X,
  Tag,
  Code,
  Layers,
  Sparkles,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface TemplateItem {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  category: 'Promotion' | 'Alert' | 'Renewal' | 'Survey';
  status: 'Approved' | 'Draft' | 'Under Review';
  subjectOrHeader: string;
  content: string;
  variables: string[];
  lastModified: string;
}

const INITIAL_TEMPLATES: TemplateItem[] = [];

export function TemplatesContent() {
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [channelTab, setChannelTab] = useState<'All' | 'Email' | 'WhatsApp' | 'SMS'>('All');
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewTemplate, setViewTemplate] = useState<TemplateItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    channel: 'Email' as 'Email' | 'WhatsApp' | 'SMS',
    category: 'Promotion' as 'Promotion' | 'Alert' | 'Renewal' | 'Survey',
    subjectOrHeader: '',
    content: '',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.content) return;

    const matches = formData.content.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
    const vars = Array.from(new Set(matches.map((m) => m.replace(/[\{\}]/g, ''))));

    const newTemplate: TemplateItem = {
      id: `TMP-${Math.floor(100 + Math.random() * 900)}`,
      name: formData.name,
      channel: formData.channel,
      category: formData.category,
      status: 'Approved',
      subjectOrHeader: formData.subjectOrHeader || 'Standard Template',
      content: formData.content,
      variables: vars.length > 0 ? vars : ['customer_name'],
      lastModified: 'Just now',
    };

    setTemplates([newTemplate, ...templates]);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      channel: 'Email',
      category: 'Promotion',
      subjectOrHeader: '',
      content: '',
    });
    showToast(`Template "${newTemplate.name}" created and approved!`);
  };

  const insertVariable = (variableName: string) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content + `{{${variableName}}}`,
    }));
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('Template deleted');
  };

  const duplicateTemplate = (item: TemplateItem) => {
    const copy: TemplateItem = {
      ...item,
      id: `TMP-${Math.floor(100 + Math.random() * 900)}`,
      name: `${item.name} (Copy)`,
      status: 'Draft',
    };
    setTemplates([copy, ...templates]);
    showToast(`Template copied as "${copy.name}"`);
  };

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchChannel = channelTab === 'All' || t.channel === channelTab;
      const matchSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.content.toLowerCase().includes(search.toLowerCase()) ||
        t.category.toLowerCase().includes(search.toLowerCase());
      return matchChannel && matchSearch;
    });
  }, [templates, channelTab, search]);

  const emailCount = templates.filter((t) => t.channel === 'Email').length;
  const waCount = templates.filter((t) => t.channel === 'WhatsApp').length;
  const smsCount = templates.filter((t) => t.channel === 'SMS').length;

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
              <div className="p-1 rounded bg-teal-50 text-teal-600">
                <Copy className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Message Templates</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Standardized, pre-approved multi-channel message templates for Email, WhatsApp API, and SMS communications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Template</span>
        </button>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Templates</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{templates.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Approved assets</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Email Templates</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{emailCount}</p>
          <span className="text-[11px] font-semibold text-blue-600">Branded HTML layouts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">WhatsApp Templates</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{waCount}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Meta API Verified</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">SMS Templates</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{smsCount}</p>
          <span className="text-[11px] font-semibold text-purple-600">TRA Compliant</span>
        </div>
      </div>

      {/* Channel Switcher Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          {(['All', 'Email', 'WhatsApp', 'SMS'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setChannelTab(tab)}
              className={cn(
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                channelTab === tab
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              {tab === 'All' ? 'All Channels' : tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search templates, variables, text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-teal-200 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'p-1.5 rounded-lg',
                      item.channel === 'Email'
                        ? 'bg-blue-50 text-blue-600'
                        : item.channel === 'WhatsApp'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-purple-50 text-purple-600'
                    )}
                  >
                    {item.channel === 'Email' && <Mail className="w-4 h-4" />}
                    {item.channel === 'WhatsApp' && <MessageSquare className="w-4 h-4" />}
                    {item.channel === 'SMS' && <Smartphone className="w-4 h-4" />}
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">{item.name}</h2>
                    <p className="text-[11px] text-slate-400">{item.id} • {item.category}</p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {item.status}
                </span>
              </div>

              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-mono whitespace-pre-wrap line-clamp-3 leading-relaxed">
                {item.content}
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tags:</span>
                {item.variables.map((v, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-[10px] font-mono font-bold border border-teal-200"
                  >
                    {`{{${v}}}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-[11px] text-slate-400">Updated {item.lastModified}</span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewTemplate(item)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-xs transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => duplicateTemplate(item)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-teal-50"
                  title="Clone Template"
                >
                  <Copy className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteTemplate(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: Create Template */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Create New Message Template</h2>
                <p className="text-xs text-slate-500">Draft reusable omnichannel marketing communications</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Template Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Chillers Seasonal Maintenance Invitation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Email">Email Marketing</option>
                    <option value="WhatsApp">WhatsApp Broadcast</option>
                    <option value="SMS">SMS Campaign</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Promotion">Promotion &amp; Special Offers</option>
                    <option value="Renewal">AMC Contract Renewal</option>
                    <option value="Alert">Operational / Breakdown Alert</option>
                    <option value="Survey">Customer Satisfaction Survey</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subject Line / Header</label>
                <input
                  type="text"
                  placeholder="e.g. Exclusive Seasonal Maintenance Discounts for {{company_name}}"
                  value={formData.subjectOrHeader}
                  onChange={(e) => setFormData({ ...formData, subjectOrHeader: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Template Body *</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Insert Tag:</span>
                    {['contact_name', 'company_name', 'emirate', 'discount'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-teal-100 text-teal-800 text-[10px] font-mono font-bold"
                      >
                        +{v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter message template text..."
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
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  Save &amp; Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Template Details */}
      {viewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{viewTemplate.name}</h2>
                <p className="text-xs text-slate-500">{viewTemplate.channel} • {viewTemplate.category}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="font-bold text-slate-900 mb-1">Header / Subject:</p>
                <p className="text-slate-600 font-medium">{viewTemplate.subjectOrHeader}</p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <p className="font-bold text-slate-900">Message Content:</p>
                <p className="whitespace-pre-wrap font-mono text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {viewTemplate.content}
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewTemplate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Templates...</div>}>
      <TemplatesContent />
    </Suspense>
  );
}
