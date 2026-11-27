'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  Boxes,
  Truck,
  Download,
  Upload,
  Play,
  RotateCcw,
  Check,
  Clock,
  History,
  FileCheck,
  Search,
  Filter,
} from 'lucide-react';
import {
  LegacyValidationSummary,
  LegacyValidationRecord,
  LegacyMigrationReport,
} from '@/types/enterprise-crm';
import { legacyMigrationApiService } from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface LegacyMigrationViewProps {
  currentUser: MockAuthUser | null;
  onNavigateToPo?: (poId?: string) => void;
}

export function LegacyMigrationView({
  currentUser,
  onNavigateToPo,
}: LegacyMigrationViewProps) {
  // Input State
  const [inputMode, setInputMode] = useState<'structured' | 'json'>('structured');
  const [rawJson, setRawJson] = useState<string>('');
  const [structuredRows, setStructuredRows] = useState<
    Array<{
      type: 'PO' | 'GRN';
      number: string;
      supplier: string;
      amount: number;
      date: string;
      linkedPo?: string;
    }>
  >([
    { type: 'PO', number: 'CTPO-LEGACY-001', supplier: 'Lutfi Trading LLC', amount: 3500, date: '2025-06-15' },
    { type: 'PO', number: 'CTPO-EXISTING-01', supplier: 'Al-Futtaim HVAC Supplies', amount: 1000, date: '2025-05-10' },
    { type: 'GRN', number: 'GRN-LEGACY-001', supplier: 'Lutfi Trading LLC', amount: 3500, date: '2025-06-20', linkedPo: 'CTPO-LEGACY-001' },
    { type: 'GRN', number: 'GRN-ORPHAN-999', supplier: 'Unknown Vendor', amount: 0, date: '2025-07-01', linkedPo: 'CTPO-NON-EXISTENT' },
  ]);

  // Validation State
  const [validating, setValidating] = useState<boolean>(false);
  const [validationSummary, setValidationSummary] = useState<LegacyValidationSummary | null>(null);
  const [validationRecords, setValidationRecords] = useState<LegacyValidationRecord[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'VALID' | 'DUPLICATE' | 'AMBIGUOUS'>('ALL');

  // Import State
  const [importing, setImporting] = useState<boolean>(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
  const [confirmedApproval, setConfirmedApproval] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<{
    batchId: string;
    importedCount: number;
    skippedCount: number;
    message: string;
  } | null>(null);

  // Past Migration Reports
  const [reports, setReports] = useState<LegacyMigrationReport[]>([]);
  const [loadingReports, setLoadingReports] = useState<boolean>(false);

  const loadPastReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const res = await legacyMigrationApiService.getMigrationReports();
      if (res.success) {
        setReports(res.reports);
      }
    } catch (err) {
      console.error('Failed to load past migration reports:', err);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useEffect(() => {
    loadPastReports();
  }, [loadPastReports]);

  // Pre-fill Sample Legacy Dataset
  const handleLoadSampleDataset = () => {
    setStructuredRows([
      { type: 'PO', number: 'CTPO-LEGACY-2025-01', supplier: 'Lutfi Trading LLC', amount: 4800, date: '2025-04-12' },
      { type: 'PO', number: 'CTPO-LEGACY-2025-02', supplier: 'Central Trading Company LLC', amount: 12500, date: '2025-05-18' },
      { type: 'PO', number: 'CTPO-EXISTING-01', supplier: 'Al-Futtaim HVAC Supplies', amount: 1000, date: '2025-05-10' },
      { type: 'PO', number: 'CTPO-LEGACY-2025-01', supplier: 'Lutfi Trading LLC', amount: 4800, date: '2025-04-12' }, // Internal batch duplicate
      { type: 'GRN', number: 'GRN-2025-101', supplier: 'Lutfi Trading LLC', amount: 4800, date: '2025-04-20', linkedPo: 'CTPO-LEGACY-2025-01' },
      { type: 'GRN', number: 'GRN-MISSING-REF', supplier: 'General Airconditioning', amount: 0, date: '2025-06-01', linkedPo: 'CTPO-DOES-NOT-EXIST' },
    ]);
    setValidationSummary(null);
    setValidationRecords([]);
    setImportResult(null);
  };

  // Run Dry-Run Validation
  const handleRunValidation = async () => {
    try {
      setValidating(true);
      setValidationError(null);
      setImportResult(null);

      let recordsToValidate: any[] = [];
      if (inputMode === 'structured') {
        recordsToValidate = structuredRows.map((r) => ({
          type: r.type,
          poNumber: r.type === 'PO' ? r.number : undefined,
          stockInNo: r.type === 'GRN' ? r.number : undefined,
          purchaseOrderNumber: r.linkedPo,
          supplier: r.supplier,
          amount: Number(r.amount),
          date: r.date,
        }));
      } else {
        try {
          const parsed = JSON.parse(rawJson);
          if (!Array.isArray(parsed)) {
            throw new Error('JSON payload must be an array of records.');
          }
          recordsToValidate = parsed;
        } catch (jsonErr: any) {
          setValidationError(`JSON syntax error: ${jsonErr.message}`);
          setValidating(false);
          return;
        }
      }

      const res = await legacyMigrationApiService.validateLegacyRecords(recordsToValidate);
      if (res.success) {
        setValidationSummary(res.summary);
        setValidationRecords(res.records);
      } else {
        setValidationError('Validation failed on server.');
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      setValidationError(err?.message || 'Error executing legacy validation dry-run.');
    } finally {
      setValidating(false);
    }
  };

  // Execute Controlled Import
  const handleExecuteImport = async () => {
    if (!confirmedApproval) {
      alert('You must acknowledge and explicitly approve the migration before proceeding.');
      return;
    }

    try {
      setImporting(true);
      const validPayload = validationRecords
        .filter((r) => r.status === 'VALID')
        .map((r) => r.raw);

      if (validPayload.length === 0) {
        alert('There are no valid non-duplicate records to import.');
        setConfirmModalOpen(false);
        return;
      }

      const res = await legacyMigrationApiService.importLegacyRecords(validPayload);
      if (res.success) {
        setImportResult({
          batchId: res.batchId,
          importedCount: res.importedCount,
          skippedCount: res.skippedCount,
          message: res.message,
        });
        setConfirmModalOpen(false);
        setConfirmedApproval(false);
        await loadPastReports();
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
      alert(err?.message || 'Failed to execute legacy import.');
    } finally {
      setImporting(false);
    }
  };

  const filteredRecords = validationRecords.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="space-y-5 text-slate-800">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Layers className="w-4 h-4" />
            <span>Legacy Data Migration &amp; Reconciliation Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Purchase Orders &amp; Stock Receipts Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify duplicate purchase orders, duplicate stock receipts, missing references, and prepare safe migration procedures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSampleDataset}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
          >
            Load Sample Legacy Dataset
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-3 text-xs text-sky-900">
        <ShieldCheck className="w-5 h-5 text-sky-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-sky-950 block">
            Safe Dry-Run Mode &amp; Production Data Protection
          </strong>
          <span>
            Legacy reconciliation is strictly read-only and non-destructive during dry-run validation. No production data is imported without explicit administrative confirmation. All imported records are assigned unique batch identifiers (<code className="font-mono bg-sky-100 px-1 rounded">MIG-BATCH-xxx</code>) and flagged with <code className="font-mono bg-sky-100 px-1 rounded">is_legacy_migrated = 1</code>.
          </span>
        </div>
      </div>

      {/* 2. Legacy Data Input Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Legacy Procurement Records for Audit
            </h3>
            <p className="text-xs text-slate-500">
              Input legacy purchase orders and goods receipt notes to analyze against current CRM database records.
            </p>
          </div>

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setInputMode('structured')}
              className={`px-3 py-1 rounded-md transition ${
                inputMode === 'structured' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Structured Table ({structuredRows.length})
            </button>
            <button
              onClick={() => {
                setInputMode('json');
                if (!rawJson) {
                  setRawJson(JSON.stringify(structuredRows, null, 2));
                }
              }}
              className={`px-3 py-1 rounded-md transition ${
                inputMode === 'json' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Raw JSON
            </button>
          </div>
        </div>

        {/* Structured Table Editor */}
        {inputMode === 'structured' && (
          <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 w-12 text-center">#</th>
                  <th className="py-2 px-3 w-28">Record Type</th>
                  <th className="py-2 px-3">Reference / Number</th>
                  <th className="py-2 px-3">Supplier Name</th>
                  <th className="py-2 px-3 text-right">Amount (AED)</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Linked PO (for GRN)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {structuredRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <select
                        value={row.type}
                        onChange={(e) => {
                          const val = e.target.value as 'PO' | 'GRN';
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].type = val;
                            return copy;
                          });
                        }}
                        className="px-2 py-1 border border-slate-200 rounded font-semibold text-xs bg-slate-50 text-slate-800"
                      >
                        <option value="PO">Purchase Order</option>
                        <option value="GRN">Goods Receipt</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.number}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].number = val;
                            return copy;
                          });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.supplier}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].supplier = val;
                            return copy;
                          });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        step="0.01"
                        value={row.amount}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].amount = val;
                            return copy;
                          });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs text-right font-semibold"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="date"
                        value={row.date}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].date = val;
                            return copy;
                          });
                        }}
                        className="w-full px-2 py-1 border border-slate-200 rounded text-xs"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={row.linkedPo || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setStructuredRows((prev) => {
                            const copy = [...prev];
                            copy[idx].linkedPo = val;
                            return copy;
                          });
                        }}
                        placeholder="e.g. CTPO-1001"
                        className="w-full px-2 py-1 border border-slate-200 rounded font-mono text-xs text-slate-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* JSON Editor */}
        {inputMode === 'json' && (
          <div>
            <textarea
              rows={8}
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="Paste JSON array of records here..."
              className="w-full p-3 font-mono text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-500">
            Validates references, checks existing D1 database POs and GRNs, and reports duplicates.
          </span>
          <button
            type="button"
            onClick={handleRunValidation}
            disabled={validating}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {validating ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>Running Dry-Run Reconciliation...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run Dry-Run Reconciliation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
          {validationError}
        </div>
      )}

      {/* 3. Reconciliation Report */}
      {validationSummary && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
          {/* Header & Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Legacy Data Reconciliation Report
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated against Cloudflare D1 tables (<code className="font-mono">purchase_orders</code>, <code className="font-mono">stock_in_vouchers</code>).
              </p>
            </div>

            {/* Import Trigger */}
            <button
              type="button"
              onClick={() => setConfirmModalOpen(true)}
              disabled={!validationSummary.canImport}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-40"
            >
              <Upload className="w-4 h-4" />
              <span>Import Valid Records ({validationSummary.validCount})</span>
            </button>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-slate-500 block">Total Evaluated</span>
              <span className="text-lg font-bold text-slate-900">
                {validationSummary.totalRecords} records
              </span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="text-emerald-700 block">Valid &amp; New Records</span>
              <span className="text-lg font-bold text-emerald-900">
                {validationSummary.validCount} ready for import
              </span>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="text-rose-700 block">Duplicate Records Flagged</span>
              <span className="text-lg font-bold text-rose-900">
                {validationSummary.duplicateCount} blocked
              </span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-700 block">Ambiguous / Missing Ref</span>
              <span className="text-lg font-bold text-amber-900">
                {validationSummary.ambiguousCount} flagged
              </span>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-200 pt-2 text-xs">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`px-3 py-1.5 font-bold border-b-2 transition ${
                filterStatus === 'ALL'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Records ({validationSummary.totalRecords})
            </button>
            <button
              onClick={() => setFilterStatus('VALID')}
              className={`px-3 py-1.5 font-bold border-b-2 transition ${
                filterStatus === 'VALID'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Valid Only ({validationSummary.validCount})
            </button>
            <button
              onClick={() => setFilterStatus('DUPLICATE')}
              className={`px-3 py-1.5 font-bold border-b-2 transition ${
                filterStatus === 'DUPLICATE'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Duplicates Only ({validationSummary.duplicateCount})
            </button>
            <button
              onClick={() => setFilterStatus('AMBIGUOUS')}
              className={`px-3 py-1.5 font-bold border-b-2 transition ${
                filterStatus === 'AMBIGUOUS'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Ambiguous / Missing ({validationSummary.ambiguousCount})
            </button>
          </div>

          {/* Records Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 w-20">Type</th>
                  <th className="py-2.5 px-3">Reference #</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3 text-right">Amount (AED)</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Reconciliation Status</th>
                  <th className="py-2.5 px-3">Audit Details &amp; Conflict Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((r) => (
                  <tr key={r.index} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{r.index}</td>
                    <td className="py-2.5 px-3 font-semibold">{r.type}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-900 font-bold">{r.poNumber}</td>
                    <td className="py-2.5 px-3">{r.supplier}</td>
                    <td className="py-2.5 px-3 text-right font-medium">AED {r.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          r.status === 'VALID'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : r.status === 'DUPLICATE'
                            ? 'bg-rose-100 text-rose-800 border-rose-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {r.issues.length === 0 ? (
                        <span className="text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> No conflicts; clean record ready for migration
                        </span>
                      ) : (
                        <ul className="list-disc list-inside space-y-0.5 text-rose-700">
                          {r.issues.map((iss, i) => (
                            <li key={i}>{iss}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import Success Banner */}
      {importResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-950">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Legacy Migration Batch Successfully Committed!</span>
          </div>
          <p>{importResult.message}</p>
          <div className="flex items-center gap-3 font-mono text-[11px] pt-1">
            <span>Batch ID: <strong>{importResult.batchId}</strong></span>
            <span>Imported: <strong>{importResult.importedCount}</strong></span>
            <span>Skipped: <strong>{importResult.skippedCount}</strong></span>
          </div>
        </div>
      )}

      {/* 4. Safe Migration Procedure Specification Document */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Official Safe Migration Procedure Specification
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <strong className="text-slate-900 font-bold block">1. Dry-Run Validation</strong>
            <p>
              Pre-flight audit compares every legacy PO number and GRN number against active CRM tables. Duplicates and missing references are flagged before writing to database.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <strong className="text-slate-900 font-bold block">2. Batch Tracking &amp; Isolation</strong>
            <p>
              All imported records receive a unique <code className="bg-slate-200 px-1 rounded font-mono">migration_batch_id</code> and <code className="bg-slate-200 px-1 rounded font-mono">is_legacy_migrated = 1</code> flag to guarantee traceability and enable selective rollback.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <strong className="text-slate-900 font-bold block">3. Multi-Tier Governance</strong>
            <p>
              Import execution requires administrative privileges (<code className="bg-slate-200 px-1 rounded font-mono">SUPER_ADMIN</code>, <code className="bg-slate-200 px-1 rounded font-mono">ADMIN</code>, or <code className="bg-slate-200 px-1 rounded font-mono">FINANCE_CONTROLLER</code>) and records immutable audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Past Migration Reports Log */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Executed Migration Batches Audit Log</h3>
          </div>
          <span className="text-xs text-slate-400">
            {reports.length} historical batches
          </span>
        </div>

        {reports.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No legacy migration batches executed yet.
          </div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Batch Identifier</th>
                  <th className="py-2.5 px-3 text-right">Imported</th>
                  <th className="py-2.5 px-3 text-right">Skipped</th>
                  <th className="py-2.5 px-3">Executed By</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono font-bold text-indigo-700">{r.batchId}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">{r.importedCount} records</td>
                    <td className="py-2.5 px-3 text-right text-slate-500">{r.skippedCount} records</td>
                    <td className="py-2.5 px-3 text-slate-700">{r.executedBy}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Confirm Legacy Data Migration
                </h3>
                <span className="text-xs text-slate-500">Executive Confirmation Required</span>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              You are about to import <strong className="text-slate-900">{validationSummary?.validCount} valid records</strong> into the Cool Technologies CRM Purchase Module. Duplicate and ambiguous records will be skipped automatically.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmedApproval}
                  onChange={(e) => setConfirmedApproval(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-slate-700">
                  I confirm that I have reviewed the reconciliation dry-run report and explicitly approve the ingestion of these valid legacy records.
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmModalOpen(false);
                  setConfirmedApproval(false);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!confirmedApproval || importing}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Migrating...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Import</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
