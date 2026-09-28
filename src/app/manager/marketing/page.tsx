'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Megaphone,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Copy,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ManagerMarketingContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'campaigns';
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: '6' },
    { id: 'email', label: 'Email Marketing', icon: Mail, count: '12' },
    { id: 'whatsapp', label: 'WhatsApp Campaigns', icon: MessageSquare, count: '8' },
    { id: 'sms', label: 'SMS Campaigns', icon: Smartphone, count: '4' },
    { id: 'segments', label: 'Customer Segments', icon: Users, count: '5' },
    { id: 'templates', label: 'Templates', icon: Copy, count: '18' },
    { id: 'reports', label: 'Campaign Reports', icon: FileText },
  ];

  const campaigns = [
    { id: 'CMP-01', name: 'Summer 2026 Emergency Chiller Overhaul Blast', channel: 'WhatsApp & Email', audience: 'Commercial Facilities', sent: '1,240', opened: '68%', leads: '34', status: 'Active' },
    { id: 'CMP-02', name: 'Annual HVAC AMC Renewal Discounts', channel: 'Email', audience: 'Existing AMC Clients', sent: '450', opened: '82%', leads: '28', status: 'Active' },
    { id: 'CMP-03', name: 'Industrial VRF Energy Efficiency Promotion', channel: 'WhatsApp Broadcast', audience: 'Factory & Warehousing Hubs', sent: '890', opened: '74%', leads: '19', status: 'Completed' },
    { id: 'CMP-04', name: 'Post-Inspection Service Satisfaction Poll', channel: 'SMS Automated', audience: 'Completed Jobs This Week', sent: '320', opened: '91%', leads: '12', status: 'Scheduled' },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1677FF]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Marketing & Outreach Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Broadcast service campaigns, WhatsApp updates, automated email sequences, and customer segment communications.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          <span>+ New Campaign</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Campaign Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Campaign Execution Register</h2>
          <span className="text-xs text-slate-500">{campaigns.length} Active Campaigns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Audience Segment</th>
                <th className="py-3 px-4">Dispatched</th>
                <th className="py-3 px-4">Open / Read Rate</th>
                <th className="py-3 px-4">Inquiries / Leads</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {campaigns.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{c.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{c.id}</p>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{c.channel}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.audience}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.sent}</td>
                  <td className="py-3.5 px-4 font-extrabold text-blue-600">{c.opened}</td>
                  <td className="py-3.5 px-4 font-extrabold text-emerald-600">{c.leads} leads</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                        c.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'Scheduled'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-700'
                      )}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#1677FF] hover:text-white font-bold text-xs transition-colors">
                      View Metrics
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ManagerMarketingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Marketing...</div>}>
      <ManagerMarketingContent />
    </Suspense>
  );
}
