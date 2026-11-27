'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Database,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  getLocalStorageLeads,
  getSyncMetadata,
  migrateLeadsToRemote,
  LeadSyncItemResult,
  LeadMigrationSummary,
} from '@/services/leadStorageMigrationService';
import { cn } from '@/lib/utils';

interface LeadMigrationStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete?: () => void;
}

export function LeadMigrationStatusModal({
  isOpen,
  onClose,
  onMigrationComplete,
}: LeadMigrationStatusModalProps) {
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [items, setItems] = useState<LeadSyncItemResult[]>([]);
  const [summary, setSummary] = useState<{
    total: number;
    synced: number;
    pending: number;
    failed: number;
  }>({ total: 0, synced: 0, pending: 0, failed: 0 });

  const loadCurrentStatus = () => {
    const { leads, sourceMap } = getLocalStorageLeads();
    const meta = getSyncMetadata();

    let synced = 0;
    let failed = 0;
    let pending = 0;

    const currentItems: LeadSyncItemResult[] = leads.map((lead) => {
      const id = String(lead.id).trim();
      const m = meta[id];
      const status = m?.status || 'pending';

      if (status === 'synced' || status === 'skipped_existing') {
        synced++;
      } else if (status === 'failed' || status === 'invalid') {
        failed++;
      } else {
        pending++;
      }

      return {
        id,
        contactName: lead.contactDetails?.name || 'Unknown Contact',
        companyName: lead.contactDetails?.company || 'Unknown Company',
        status,
        errorMessage: m?.errorMessage,
        verifiedAt: m?.verifiedAt,
        sourceKey: sourceMap[id] || 'cooltech_crm_leads',
      };
    });

    setItems(currentItems);
    setSummary({
      total: leads.length,
      synced,
      pending,
      failed,
    });
  };

  useEffect(() => {
    if (isOpen) {
      loadCurrentStatus();
    }
  }, [isOpen]);

  const handleStartMigration = async () => {
    setIsMigrating(true);
    setProgress({ current: 0, total: items.length });

    try {
      const res: LeadMigrationSummary = await migrateLeadsToRemote({
        onProgress: (p) => {
          setProgress({ current: p.current, total: p.total });
          loadCurrentStatus();
        },
      });

      loadCurrentStatus();
      if (onMigrationComplete) {
        onMigrationComplete();
      }
    } catch (e) {
      console.error('[LeadMigrationStatusModal] Migration error:', e);
    } finally {
      setIsMigrating(false);
      setProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#0F2844] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
              <Database className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Cloud Database Synchronization</h2>
              <p className="text-[11px] text-slate-300">
                Migrate browser leads to Cloudflare D1 with duplicate prevention
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isMigrating}
            className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Leads</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{summary.total}</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Synced to D1</span>
              <p className="text-lg font-black text-emerald-800 mt-0.5">{summary.synced}</p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Pending</span>
              <p className="text-lg font-black text-amber-800 mt-0.5">{summary.pending}</p>
            </div>
            <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-2.5 text-center">
              <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Failed / Issues</span>
              <p className="text-lg font-black text-rose-800 mt-0.5">{summary.failed}</p>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="bg-blue-50/60 border border-blue-200/80 rounded-lg p-3 flex items-start gap-2.5 text-[11px] text-blue-950">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Safe & Non-Destructive Migration</p>
              <p className="text-blue-800">
                Your browser storage will not be cleared. Existing IDs and timestamps are preserved, and already-uploaded leads are skipped automatically to avoid duplicates.
              </p>
            </div>
          </div>

          {/* Progress Bar (when active) */}
          {isMigrating && progress && (
            <div className="space-y-1.5 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-[11px] font-semibold text-slate-700">
                <span>Synchronizing records with Cloudflare D1...</span>
                <span>{progress.current} / {progress.total}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 transition-all duration-300"
                  style={{ width: `${(progress.current / Math.max(1, progress.total)) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Record Breakdown Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-700 flex justify-between items-center">
              <span>Local Lead Records ({items.length})</span>
              <span className="text-[10px] font-normal text-slate-500">Verified by Cloudflare D1</span>
            </div>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-[11px]">
                  No local lead records found in browser storage.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/60">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 truncate">{item.contactName}</span>
                        <span className="text-slate-400 font-mono text-[10px]">({item.id})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{item.companyName}</p>
                      {item.errorMessage && (
                        <p className="text-[10px] text-rose-600 font-medium mt-0.5">{item.errorMessage}</p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1">
                      {item.status === 'synced' || item.status === 'skipped_existing' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Synced</span>
                        </span>
                      ) : item.status === 'failed' || item.status === 'invalid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800" title={item.errorMessage}>
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          <span>{item.status === 'invalid' ? 'Invalid' : 'Failed'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isMigrating}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleStartMigration}
            disabled={isMigrating || items.length === 0 || summary.pending + summary.failed === 0}
            className={cn(
              "px-5 py-1.5 text-xs font-bold rounded-lg flex items-center gap-2 text-white shadow-xs transition-all cursor-pointer",
              isMigrating
                ? "bg-blue-400 cursor-not-allowed"
                : summary.pending + summary.failed === 0
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-98"
            )}
          >
            {isMigrating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Syncing to D1...</span>
              </>
            ) : summary.pending + summary.failed === 0 ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Records Synced</span>
              </>
            ) : (
              <>
                <CloudUpload className="w-3.5 h-3.5" />
                <span>Sync {summary.pending + summary.failed} Lead(s) to Cloud</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadMigrationStatusModal;
