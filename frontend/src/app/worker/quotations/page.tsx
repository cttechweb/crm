'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { CezconQuotationModule } from '@/components/sales/CezconQuotationModule';

function EmployeeQuotationsContent() {
  const searchParams = useSearchParams();
  const isCreate = searchParams.get('create') === 'true' || searchParams.get('action') === 'add';

  return (
    <WorkerShell
      title="Quotation"
      subtitle="Cezcon Commercial Quotations and Proposals Management"
    >
      <CezconQuotationModule initialCreate={isCreate} />
    </WorkerShell>
  );
}

export default function EmployeeQuotationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Quotation Module...</div>}>
      <EmployeeQuotationsContent />
    </Suspense>
  );
}
