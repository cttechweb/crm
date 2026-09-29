'use client';

import React, { Suspense } from 'react';
import { LeadsContent } from '@/app/leads/page';

export default function ManagerLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading Leads Directory...</div>}>
      <LeadsContent />
    </Suspense>
  );
}
