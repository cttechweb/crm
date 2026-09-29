'use client';

import React, { Suspense } from 'react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { LeadsContent } from '@/app/leads/page';

export default function EmployeeLeadsPage() {
  return (
    <WorkerShell
      title="My Leads"
      subtitle="View, track, and update your assigned sales leads and maintenance inquiries"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-500 text-xs">Loading Leads Directory...</div>}>
        <LeadsContent />
      </Suspense>
    </WorkerShell>
  );
}
