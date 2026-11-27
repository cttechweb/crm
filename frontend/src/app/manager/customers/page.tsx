'use client';

import React, { Suspense } from 'react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import CustomersPage from '@/app/customers/page';

export default function ManagerCustomersPage() {
  return (
    <ManagerShell
      title="Customer & Account Directory"
      subtitle="Manage corporate client facilities, service agreements, and equipment maintenance history"
    >
      <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customers...</div>}>
        <CustomersPage />
      </Suspense>
    </ManagerShell>
  );
}

