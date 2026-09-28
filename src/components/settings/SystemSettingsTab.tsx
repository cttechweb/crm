'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, CheckCircle } from 'lucide-react';

export function SystemSettingsTab() {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> System settings saved successfully.
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-slate-900">System & Enterprise Preferences</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          General environment preferences, regional settings, and company metadata.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Company Legal Entity</label>
            <input
              type="text"
              defaultValue="Cool Technologies LLC"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Corporate Registration (TRN)</label>
            <input
              type="text"
              defaultValue="100349284900003"
              className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Operating Region</label>
            <input
              type="text"
              defaultValue="United Arab Emirates (AED / +971)"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Support Email</label>
            <input
              type="email"
              defaultValue="support@cooltechuae.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
          Save System Configuration
        </Button>
      </form>
    </Card>
  );
}
