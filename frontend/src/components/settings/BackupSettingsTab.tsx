'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Database, Download, Upload, CheckCircle, RefreshCw } from 'lucide-react';

export function BackupSettingsTab() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const backupPayload = {
          timestamp: new Date().toISOString(),
          users: localStorage.getItem('cezcon_crm_users_list') || '[]',
          profiles: localStorage.getItem('cezcon_crm_profiles_list') || '[]',
          leads: localStorage.getItem('crm_leads_data') || '[]',
          customers: localStorage.getItem('crm_customers_data') || '[]',
          opportunities: localStorage.getItem('crm_opportunities_data') || '[]',
          tasks: localStorage.getItem('crm_tasks_data') || '[]',
          orders: localStorage.getItem('crm_orders_data') || '[]',
          invoices: localStorage.getItem('crm_invoices_data') || '[]',
        };

        const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cezcon_crm_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } catch (e) {
        console.error(e);
        setIsExporting(false);
      }
    }, 600);
  };

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      {exportSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Full CRM Data Backup downloaded successfully.
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-slate-900">Backup, Data Export & System Snapshot</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Export full CRM databases and snapshots for safekeeping and offline backup.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Complete Database</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Download an instant JSON snapshot of all your manually entered users, leads, customers, deals, tasks, and settings.
          </p>
          <Button
            onClick={handleExportData}
            disabled={isExporting}
            variant="primary"
            size="sm"
            icon={isExporting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          >
            {isExporting ? 'Generating Snapshot...' : 'Download JSON Backup'}
          </Button>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>Restore From Backup</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Upload a previously exported backup file to restore system records and configuration.
          </p>
          <input
            type="file"
            accept=".json"
            className="block w-full text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
      </div>
    </Card>
  );
}
