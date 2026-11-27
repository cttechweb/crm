'use client';

import React, { Suspense } from 'react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import CustomersPage from '@/app/customers/page';

export default function EmployeeCustomersPage() {
  return (
    <WorkerShell
      title="Customer & Account Directory"
      subtitle="Directory of your assigned client facilities, maintenance contracts, and HVAC installation sites"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customers...</div>}>
        <CustomersPage />
      </Suspense>
    </WorkerShell>
  );
}

