'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { InitialSettingsTab } from '@/components/settings/InitialSettingsTab';

function InitialSettingsContent() {
  const searchParams = useSearchParams();
  const sub = searchParams?.get('sub') || 'source';
  return <InitialSettingsTab initialSubTab={sub} />;
}

export default function InitialSettingsPage() {
  return (
    <Suspense fallback={<div className="p-4 text-xs text-slate-500">Loading initial settings...</div>}>
      <InitialSettingsContent />
    </Suspense>
  );
}
