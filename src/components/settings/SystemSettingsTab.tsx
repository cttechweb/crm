'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { companySettingsService, type CompanySettingsData } from '@/services/settingsApiService';

export function SystemSettingsTab() {
  const [formData, setFormData] = useState<CompanySettingsData>({
    companyName: 'Cool Technologies LLC',
    legalEntity: 'Cool Technologies LLC',
    trn: '100349284900003',
    operatingRegion: 'United Arab Emirates (AED / +971)',
    primaryEmail: 'support@cooltechuae.com',
    phone: '+971 4 000 0000',
    address: 'Dubai, United Arab Emirates',
    currency: 'AED',
    vatRate: 5.0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadSettings() {
      try {
        const data = await companySettingsService.getCompanySettings();
        if (isMounted && data) {
          setFormData((prev) => ({ ...prev, ...data }));
        }
      } catch (err: unknown) {
        console.warn('Using cached company settings:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const updated = await companySettingsService.updateCompanySettings(formData);
      setFormData((prev) => ({ ...prev, ...updated }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save system settings.';
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>System and company settings saved successfully to CRM backend.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-slate-900">System &amp; Enterprise Preferences</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          General environment preferences, regional settings, TRN registration, and corporate metadata.
        </p>
      </div>

      {isLoading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading system preferences...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Legal Entity</label>
              <input
                type="text"
                required
                value={formData.legalEntity}
                onChange={(e) => setFormData({ ...formData, legalEntity: e.target.value, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Registration (TRN)</label>
              <input
                type="text"
                value={formData.trn}
                onChange={(e) => setFormData({ ...formData, trn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Operating Region</label>
              <input
                type="text"
                value={formData.operatingRegion}
                onChange={(e) => setFormData({ ...formData, operatingRegion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Primary Support Email</label>
              <input
                type="email"
                value={formData.primaryEmail}
                onChange={(e) => setFormData({ ...formData, primaryEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Corporate Phone Number</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+971 4 000 0000"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Currency</label>
              <input
                type="text"
                value={formData.currency || 'AED'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                placeholder="AED"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 mb-1">Registered Business Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Dubai, United Arab Emirates"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isSaving}
            icon={isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          >
            {isSaving ? 'Saving Configuration...' : 'Save System Configuration'}
          </Button>
        </form>
      )}
    </Card>
  );
}
