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
  MessageSquare,
  Mail,
  Smartphone,
  Share2,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

export default function ManagerCreateCampaignPage() {
  const router = useRouter();
  const { addCampaign } = useEnterpriseCrm();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Service Promotion',
    channel: 'WhatsApp & Email',
    targetSegment: 'Commercial Facilities',
    ownerName: 'Manager',
    budget: 10000,
    targetLeads: 120,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Active' as const,
    listing: true,
    promoCode: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    const newCampaign = {
      name: formData.name.trim(),
      type: formData.type,
      channel: formData.channel || 'Multi-channel',
      budget: Number(formData.budget) || 0,
      leadsGenerated: 0,
      conversionRate: '0.0%',
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      status: (isDraft ? 'Draft' : formData.status || 'Active') as 'Active' | 'Draft' | 'Inactive' | 'Completed' | 'Paused',
      listing: formData.listing,
      owner: {
        name: formData.ownerName || 'Manager',
      },
    };

    addCampaign(newCampaign);
    setSuccessToast(true);

    setTimeout(() => {
      router.push('/manager/marketing?tab=campaigns');
    }, 450);
  };

  return (
    <div className="w-full min-h-screen space-y-5 pb-20 font-sans text-slate-800">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-[#002B49] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-sky-400/30 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Campaign &quot;{formData.name}&quot; successfully created &amp; saved!</span>
        </div>
      )}

      {/* 1. TOP FULL-WIDTH HEADER */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/manager/marketing?tab=campaigns"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center cursor-pointer flex-shrink-0"
            title="Back to Marketing"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-[#1677FF]">
                <Megaphone className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-none">
                Create New Outreach Campaign
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Configure multi-channel marketing parameters, timeline, budget allocation, and target audience cohorts.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/manager/marketing?tab=campaigns"
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
            className="px-5 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Saving...' : 'Save & Launch Campaign'}</span>
          </button>
        </div>
      </div>

      {/* 2. FULL-WIDTH FORM CARD */}
      <form onSubmit={(e) => handleSubmit(e, false)} className="w-full">
        <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-2xs space-y-7">
          {/* SECTION 1: Campaign Identity */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1677FF]" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Campaign Identity &amp; Channel</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div className="md:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Campaign Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Commercial HVAC Chiller Maintenance Blast"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Outreach Channel <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="WhatsApp & Email">WhatsApp &amp; Email (Omnichannel)</option>
                  <option value="Email Marketing">Email Marketing</option>
                  <option value="WhatsApp Broadcast">WhatsApp Broadcast</option>
                  <option value="SMS Automated">SMS Automated</option>
                  <option value="Google & Meta Ads">Google &amp; Meta Ads</option>
                  <option value="Website Inbound">Website Inbound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Target Audience Segment <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.targetSegment}
                  onChange={(e) => setFormData({ ...formData, targetSegment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Commercial Facilities">Commercial Facilities &amp; Malls</option>
                  <option value="Existing AMC Clients">Existing AMC Contract Clients</option>
                  <option value="Industrial & Warehousing">Industrial &amp; Warehousing Hubs</option>
                  <option value="Residential Towers">Residential Towers &amp; Compounds</option>
                  <option value="Hospitality & Hotels">Hospitality &amp; Hotels</option>
                  <option value="New Inquiries">Recent Website Inquiries</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Owner & Financial Target */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Ownership &amp; Budget Allocation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Campaign Owner / Lead</label>
                <select
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Manager">Marketing Manager</option>
                  <option value="Muhammed Shibil">Muhammed Shibil</option>
                  <option value="Mohammed Rashid">Mohammed Rashid</option>
                  <option value="Operations Team">Operations Team</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Budget Allocation (AED)</label>
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
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Schedule &amp; Execution Status</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Date</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">End Date (Optional)</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Campaign Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Active">Active (Launch Immediately)</option>
                  <option value="Draft">Draft (Save Without Launching)</option>
                  <option value="Paused">Paused (On Hold)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: Description, Promo Code & Lead Capture */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategy, Discount &amp; Lead Pipeline</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Campaign Description &amp; Strategy
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter key message pointers, target customer pain points, seasonal discounts, or maintenance package details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Promo / Referral Code</label>
                  <div className="relative">
                    <Tag className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. COOL-CHILL-20"
                      value={formData.promoCode}
                      onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium uppercase"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Used for tracking attribution on inbound leads.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="listingSwitch"
                  checked={formData.listing}
                  onChange={(e) => setFormData({ ...formData, listing: e.target.checked })}
                  className="rounded text-[#1677FF] focus:ring-blue-500 h-4 w-4 cursor-pointer"
                />
                <div>
                  <label htmlFor="listingSwitch" className="text-xs font-bold text-slate-800 cursor-pointer select-none block">
                    Enable Auto Lead Capture &amp; Inbound Sync
                  </label>
                  <p className="text-[11px] text-slate-500 select-none">
                    Automatically route responses and incoming messages into the Sales &amp; Lead Management pipeline.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Form Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100">
            <Link
              href="/manager/marketing?tab=campaigns"
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 active:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Zap className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save & Launch Campaign'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
