'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Megaphone,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  Copy,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

import { CampaignsContent } from '@/app/marketing/campaigns/page';
import { EmailMarketingContent } from '@/app/marketing/email/page';
import { WhatsAppContent } from '@/app/marketing/whatsapp/page';
import { SmsContent } from '@/app/marketing/sms/page';
import { CustomerSegmentsContent } from '@/app/marketing/segments/page';
import { TemplatesContent } from '@/app/marketing/templates/page';
import { CampaignReportsContent } from '@/app/marketing/reports/page';

export function MarketingMainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'campaigns';

  const { campaigns } = useEnterpriseCrm();

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, count: campaigns.length > 0 ? String(campaigns.length) : undefined },
    { id: 'email', label: 'Email Marketing', icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp Campaigns', icon: MessageSquare },
    { id: 'sms', label: 'SMS Campaigns', icon: Smartphone },
    { id: 'segments', label: 'Customer Segments', icon: Users },
    { id: 'templates', label: 'Templates', icon: Copy },
    { id: 'reports', label: 'Campaign Reports', icon: FileText },
  ];

  const handleTabChange = (tabId: string) => {
    router.push(`/marketing?tab=${tabId}`);
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16 font-sans text-slate-800">
      {/* 1. MARKETING MODULE TOP-LEVEL SUB-TABS NAVIGATION */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 bg-white/70 backdrop-blur-xs p-2 rounded-2xl border shadow-2xs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
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

      {/* 2. DYNAMIC SUB-VIEW RENDER */}
      <div>
        {currentTab === 'campaigns' && <CampaignsContent />}
        {currentTab === 'email' && <EmailMarketingContent />}
        {currentTab === 'whatsapp' && <WhatsAppContent />}
        {currentTab === 'sms' && <SmsContent />}
        {currentTab === 'segments' && <CustomerSegmentsContent />}
        {currentTab === 'templates' && <TemplatesContent />}
        {currentTab === 'reports' && <CampaignReportsContent />}
      </div>
    </div>
  );
}

export default function MarketingRootPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Marketing Operations...</div>}>
      <MarketingMainContent />
    </Suspense>
  );
}
