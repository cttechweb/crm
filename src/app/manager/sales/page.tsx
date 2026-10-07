'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { CezconQuotationModule } from '@/components/sales/CezconQuotationModule';
import { CezconOpportunityModule } from '@/components/sales/CezconOpportunityModule';

function ManagerSalesContent() {
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') || 'opportunities';
  const activeTab = rawTab === 'quotations' || rawTab === 'quotation' ? 'quotations' : 'opportunities';

  return (
    <ManagerShell
      title="Commercial & Sales Operations"
      subtitle="Track active opportunities, pipeline velocity, quotations, and contract orders"
    >
      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-3 text-xs">
        <a
          href="/manager/sales?tab=opportunities"
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'opportunities'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Opportunities
        </a>
        <a
          href="/manager/sales?tab=quotations"
          className={`px-3 py-1.5 rounded-lg font-semibold transition ${
            activeTab === 'quotations'
              ? 'bg-blue-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Quotations
        </a>
      </div>

      {activeTab === 'quotations' ? (
        <CezconQuotationModule />
      ) : (
        <CezconOpportunityModule />
      )}
    </ManagerShell>
  );
}

export default function ManagerSalesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Sales module...</div>}>
      <ManagerSalesContent />
    </Suspense>
  );
}

