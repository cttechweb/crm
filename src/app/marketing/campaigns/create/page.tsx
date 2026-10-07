'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Megaphone,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Target,
  Globe,
  Radio,
  Sparkles,
  Zap,
  Tag,
  AlignLeft,
  Clock,
  Layers,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

export default function CreateCampaignPage() {
  const router = useRouter();
  const { addCampaign, users } = useEnterpriseCrm();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Inbound Portal',
    channel: 'Website Inbound',
    ownerName: users[0]?.name || 'Shaheer',
    budget: 10000,
    targetLeads: 120,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active' as const,
    listing: true,
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const newCampaign = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      type: formData.type,
      channel: formData.channel || 'Direct Inbound',
      budget: Number(formData.budget) || 0,
      spend: 0,
      leads: 0,
      deals: 0,
      revenue: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: isDraft ? ('Draft' as const) : ('Active' as const),
      listing: formData.listing,
      ownerName: formData.ownerName,
    };

    addCampaign(newCampaign);
    setSuccessToast(true);

    setTimeout(() => {
      router.push('/marketing/campaigns');
    }, 400);
  };

  return (
    <div className="w-full min-h-screen space-y-5 pb-20 font-sans text-slate-800">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#002B49] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-sky-400/30 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Campaign &quot;{formData.name}&quot; successfully created &amp; active!</span>
        </div>
      )}

      {/* 1. TOP FULL-WIDTH HEADER */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/marketing/campaigns"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
            title="Back to Campaigns"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Megaphone className="w-4 h-4" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                Create New Campaign
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Configure multi-channel marketing parameters, timeline, budget, and lead capture settings.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/marketing/campaigns"
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting || !formData.name.trim()}
            className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isSubmitting || !formData.name.trim()}
            className="px-5 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Activate'}</span>
          </button>
        </div>
      </div>

      {/* 2. FULL-WIDTH FORM CARD */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="w-full">
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-7">
          {/* SECTION 1: Basic Campaign Info */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#1677FF]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Campaign Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER SPECIAL - 2026"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Inbound Portal">Inbound Portal</option>
                  <option value="Directory Listing">Directory Listing</option>
                  <option value="Industrial Media">Industrial Media</option>
                  <option value="Telephony PBX">Telephony PBX</option>
                  <option value="Email Routing">Email Routing</option>
                  <option value="PPC Search Ads">PPC Search Ads</option>
                  <option value="Social Media Ads">Social Media Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Channel / Source</label>
                <input
                  type="text"
                  placeholder="e.g. Website Inbound"
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Owner & Financial Target */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Owner &amp; Budget Allocation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Owner</label>
                <select
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Afsal">Afsal</option>
                      <option value="Shaheer">Shaheer</option>
                      <option value="Mohammed Rashid">Mohammed Rashid</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Budget (AED)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    AED
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="10000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Leads Goal</label>
                <input
                  type="number"
                  min="1"
                  placeholder="120"
                  value={formData.targetLeads}
                  onChange={(e) => setFormData({ ...formData, targetLeads: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Timeline & Status */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Schedule &amp; Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Description & Lead Capture Settings */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Campaign Notes &amp; Lead Capture</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Description &amp; Strategy
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter campaign notes, promotional discounts, or commercial HVAC target criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="listingSwitch"
                  checked={formData.listing}
                  onChange={(e) => setFormData({ ...formData, listing: e.target.checked })}
                  className="rounded text-[#10B981] focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="listingSwitch" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
                  Enable Public Listing &amp; Auto Lead Capture (Publish to customer portal and webhook pipelines)
                </label>
              </div>
            </div>
          </div>

          {/* SECTION 5: Form Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <Link
              href="/marketing/campaigns"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Activate Campaign'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
