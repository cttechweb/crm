'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, CheckCircle } from 'lucide-react';

export function SecuritySettingsTab() {
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
          <CheckCircle className="w-4 h-4" /> Security policies saved successfully.
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-slate-900">Security Policies & Authentication Controls</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage session timeouts, password complexity requirements, and Multi-Factor Authentication.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 text-xs">
        <div className="space-y-3">
          <label className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-200 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-blue-600 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Enforce Multi-Factor Authentication (MFA) for Admins & Managers</div>
              <div className="text-slate-500 text-[11px]">Requires OTP verification upon login for elevated privilege tiers.</div>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-3 rounded-md bg-slate-50 border border-slate-200 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded text-blue-600 mt-0.5" />
            <div>
              <div className="font-bold text-slate-800">Enforce Strong Password Complexity</div>
              <div className="text-slate-500 text-[11px]">Requires minimum 8 characters, uppercase, lowercase, numbers, and special symbols.</div>
            </div>
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Session Inactivity Timeout (Minutes)</label>
              <input type="number" defaultValue={60} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Max Failed Login Attempts Before Lockout</label>
              <input type="number" defaultValue={5} className="w-full px-3 py-2 border border-slate-300 rounded-md" />
            </div>
          </div>
        </div>

        <Button type="submit" variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
          Save Security Settings
        </Button>
      </form>
    </Card>
  );
}
