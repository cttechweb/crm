'use client';

import React, { Suspense } from 'react';
import { CezconContactModule } from '@/components/customers/CezconContactModule';

export default function CustomerContactsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading contacts module...</div>}>
      <div className="w-full max-w-full">
        <CezconContactModule />
      </div>
    </Suspense>
  );
}
