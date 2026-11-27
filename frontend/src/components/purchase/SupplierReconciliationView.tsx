'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  DollarSign,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  Download,
  Printer,
  ShieldCheck,
  Search,
  Filter,
  Layers,
} from 'lucide-react';
import {
  ApAgingReport,
  SupplierStatementEntry,
  SupplierStatementReconciliation,
  CrmSupplier,
} from '@/types/enterprise-crm';
import {
  supplierReconciliationApiService,
  supplierApiService,
} from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface SupplierReconciliationViewProps {
  currentUser: MockAuthUser | null;
  onNavigateToInvoice?: (invoiceNumber: string) => void;
  onNavigateToPayment?: (supplierId: string) => void;
}

export function SupplierReconciliationView({
  currentUser,
  onNavigateToInvoice,
  onNavigateToPayment,
}: SupplierReconciliationViewProps) {
  const [activeTab, setActiveTab] = useState<'ap-aging' | 'statement-reconciliation'>('ap-aging');

  // Suppliers Directory
  const [suppliers, setSuppliers] = useState<CrmSupplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');

  // AP Ageing State
  const [agingLoading, setAgingLoading] = useState(false);
  const [agingReport, setAgingReport] = useState<ApAgingReport | null>(null);
  const [agingError, setAgingError] = useState<string | null>(null);

  // Statement Reconciliation State
  const [reconLoading, setReconLoading] = useState(false);
  const [reconError, setReconError] = useState<string | null>(null);
  const [statementSupplierId, setStatementSupplierId] = useState<string>('');
  const [statementDate, setStatementDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statementClosingBalance, setStatementClosingBalance] = useState<string>('0');
  const [statementEntries, setStatementEntries] = useState<SupplierStatementEntry[]>([
    { statementInvoiceNo: '', date: '', amount: 0 },
  ]);
  const [reconciliationResult, setReconciliationResult] =
    useState<SupplierStatementReconciliation | null>(null);
  const [reconActiveView, setReconActiveView] = useState<
    'all' | 'matched' | 'variance' | 'missingCrm' | 'missingStmt' | 'duplicates' | 'payments'
  >('all');
  const [selectedAgingBucket, setSelectedAgingBucket] = useState<'all' | 'current' | 'days31_60' | 'days61_90' | 'days90_plus'>('all');

  // Load Suppliers
  useEffect(() => {
    async function loadSuppliers() {
      try {
        const res = await supplierApiService.getSuppliers();
        if (res.success && res.suppliers) {
          setSuppliers(res.suppliers);
          if (res.suppliers.length > 0 && !statementSupplierId) {
            setStatementSupplierId(res.suppliers[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
      }
    }
    loadSuppliers();
  }, []);

  // Load AP Aging Report
  const loadAgingReport = useCallback(async (supplierId?: string) => {
    try {
      setAgingLoading(true);
      setAgingError(null);
      const res = await supplierReconciliationApiService.getApAging(
        supplierId && supplierId !== 'ALL' ? supplierId : undefined
      );
      if (res.success) {
        setAgingReport({
          asOfDate: res.asOfDate,
          grandTotal: res.grandTotal,
          totalUnpaidInvoices: res.totalUnpaidInvoices,
          buckets: res.buckets,
          supplierSummary: res.supplierSummary,
        });
      } else {
        setAgingError('Failed to fetch AP aging report from CRM API.');
      }
    } catch (err: any) {
      console.error('AP Aging fetch failed:', err);
      setAgingError(err?.message || 'Error loading AP aging report.');
    } finally {
      setAgingLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgingReport(selectedSupplierId);
  }, [loadAgingReport, selectedSupplierId]);

  // Handle Statement Entry Row Edits
  const handleEntryChange = (
    index: number,
    field: keyof SupplierStatementEntry,
    value: any
  ) => {
    setStatementEntries((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddEntryRow = () => {
    setStatementEntries((prev) => [
      ...prev,
      { statementInvoiceNo: '', date: statementDate, amount: 0 },
    ]);
  };

  const handleRemoveEntryRow = (index: number) => {
    setStatementEntries((prev) => {
      if (prev.length === 1) return [{ statementInvoiceNo: '', date: '', amount: 0 }];
      return prev.filter((_, i) => i !== index);
    });
  };

  // Pre-load Sample Statement Entries for demonstration / testing (all cases)
  const handleLoadSampleStatement = () => {
    setStatementDate(new Date().toISOString().split('T')[0]);
    setStatementClosingBalance('5250.00');
    setStatementEntries([
      { statementInvoiceNo: 'INV-2026-001', date: '2026-10-15', amount: 2500 },
      { statementInvoiceNo: 'INV-2026-002', date: '2026-10-20', amount: 1550 },
      { statementInvoiceNo: 'INV-2026-001', date: '2026-10-15', amount: 2500 }, // Duplicate entry
      { statementInvoiceNo: 'INV-2026-099', date: '2026-10-25', amount: 1200 }, // Missing in CRM
      { statementInvoiceNo: 'PMT-REM-2026-01', date: '2026-10-26', amount: -500 }, // Payment entry
    ]);
  };

  // Run Statement Reconciliation
  const handleRunReconciliation = async () => {
    if (!statementSupplierId) {
      alert('Please select a supplier for statement reconciliation.');
      return;
    }

    const cleanEntries = statementEntries
      .filter((e) => e.statementInvoiceNo.trim() && !isNaN(Number(e.amount)))
      .map((e) => ({
        statementInvoiceNo: e.statementInvoiceNo.trim(),
        date: e.date || undefined,
        amount: Number(e.amount),
      }));

    if (cleanEntries.length === 0) {
      alert('Please enter at least one valid statement invoice line item.');
      return;
    }

    try {
      setReconLoading(true);
      setReconError(null);
      const res = await supplierReconciliationApiService.reconcileStatement({
        supplierId: statementSupplierId,
        statementDate,
        statementClosingBalance: Number(statementClosingBalance) || 0,
        entries: cleanEntries,
      });

      if (res.success && res.reconciliation) {
        setReconciliationResult(res.reconciliation);
        setReconActiveView('all');
      } else {
        setReconError('Reconciliation execution failed.');
      }
    } catch (err: any) {
      console.error('Reconciliation execution failed:', err);
      setReconError(err?.message || 'Error running statement reconciliation.');
    } finally {
      setReconLoading(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* 1. Header Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <DollarSign className="w-4 h-4" />
            <span>Financial Governance &amp; Payables Audit</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Accounts Payable &amp; Supplier Statement Reconciliation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real AP ageing buckets, non-destructive statement matching, discrepancy detection, and vendor ledger audit.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab('ap-aging')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'ap-aging'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Accounts Payable Ageing
          </button>
          <button
            onClick={() => setActiveTab('statement-reconciliation')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'statement-reconciliation'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Statement Reconciliation
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-amber-950 block">Strict Financial Records Integrity</strong>
          <span>
            Reconciliation identifies discrepancies and billing variances without automatically mutating financial records, ledger entries, or payment allocations. All discrepancies remain visible for audit and manual resolution.
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW A: ACCOUNTS PAYABLE (AP) AGEING                                      */}
      {/* ========================================================================= */}
      {activeTab === 'ap-aging' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter by Supplier:
              </span>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 font-medium focus:outline-rose-500"
              >
                <option value="ALL">All Suppliers (Consolidated AP)</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.supplierName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                As of: <strong className="text-slate-700 font-mono">{agingReport?.asOfDate || new Date().toISOString().split('T')[0]}</strong>
              </span>
              <button
                onClick={() => loadAgingReport(selectedSupplierId)}
                disabled={agingLoading}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                <RefreshCw className={`w-3 h-3 text-slate-500 ${agingLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {agingError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
              <span>{agingError}</span>
              <button onClick={() => loadAgingReport(selectedSupplierId)} className="underline font-bold">
                Retry
              </button>
            </div>
          )}

          {/* Ageing Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Bucket 1: 0-30 Days */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">
                0–30 Days (Current)
              </span>
              <div className="mt-2 text-xl font-bold text-slate-900">
                AED {(agingReport?.buckets.current.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {agingReport?.buckets.current.count || 0} invoices
              </span>
            </div>

            {/* Bucket 2: 31-60 Days */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-600 block uppercase">
                31–60 Days
              </span>
              <div className="mt-2 text-xl font-bold text-slate-900">
                AED {(agingReport?.buckets.days31_60.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {agingReport?.buckets.days31_60.count || 0} invoices
              </span>
            </div>

            {/* Bucket 3: 61-90 Days */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-orange-600 block uppercase">
                61–90 Days
              </span>
              <div className="mt-2 text-xl font-bold text-slate-900">
                AED {(agingReport?.buckets.days61_90.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-500 mt-1 block">
                {agingReport?.buckets.days61_90.count || 0} invoices
              </span>
            </div>

            {/* Bucket 4: 90+ Days Overdue */}
            <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-rose-600 block uppercase">
                90+ Days (Overdue)
              </span>
              <div className="mt-2 text-xl font-bold text-rose-600">
                AED {(agingReport?.buckets.days90_plus.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-rose-700 mt-1 block font-medium">
                {agingReport?.buckets.days90_plus.count || 0} invoices overdue
              </span>
            </div>

            {/* Grand Total */}
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">
                Grand Total Balance Due
              </span>
              <div className="mt-2 text-xl font-bold text-white">
                AED {(agingReport?.grandTotal || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-400 mt-1 block">
                {agingReport?.totalUnpaidInvoices || 0} total unpaid invoices
              </span>
            </div>
          </div>

          {/* Detailed Invoices Audit Table (Requirements 4 & 5) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-800">Accounts Payable Invoices Audit &amp; Due Date Analysis</h3>
              </div>
              {/* Filter Tabs by Bucket */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                {(['all', 'current', 'days31_60', 'days61_90', 'days90_plus'] as const).map((bKey) => {
                  const labelMap = {
                    all: 'All Buckets',
                    current: '0–30 Days',
                    days31_60: '31–60 Days',
                    days61_90: '61–90 Days',
                    days90_plus: '90+ Days',
                  };
                  return (
                    <button
                      key={bKey}
                      onClick={() => setSelectedAgingBucket(bKey)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        selectedAgingBucket === bKey
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {labelMap[bKey]}
                    </button>
                  );
                })}
              </div>
            </div>

            {(() => {
              if (!agingReport) return null;
              const allInvoices = [
                ...(selectedAgingBucket === 'all' || selectedAgingBucket === 'current' ? agingReport.buckets.current.invoices : []),
                ...(selectedAgingBucket === 'all' || selectedAgingBucket === 'days31_60' ? agingReport.buckets.days31_60.invoices : []),
                ...(selectedAgingBucket === 'all' || selectedAgingBucket === 'days61_90' ? agingReport.buckets.days61_90.invoices : []),
                ...(selectedAgingBucket === 'all' || selectedAgingBucket === 'days90_plus' ? agingReport.buckets.days90_plus.invoices : []),
              ];

              if (allInvoices.length === 0) {
                return (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <span>No outstanding invoices matching the selected bucket criteria.</span>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">Invoice Date</th>
                        <th className="py-2.5 px-3">Due Date &amp; Status</th>
                        <th className="py-2.5 px-3 text-right">Total Billed</th>
                        <th className="py-2.5 px-3 text-right">Amount Paid</th>
                        <th className="py-2.5 px-3 text-right font-bold text-slate-900">Balance Due</th>
                        <th className="py-2.5 px-3 text-center">Overdue</th>
                        <th className="py-2.5 px-3 text-center">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">
                            {onNavigateToInvoice ? (
                              <button
                                onClick={() => onNavigateToInvoice(inv.invoice_number)}
                                className="text-rose-600 hover:underline font-bold"
                              >
                                {inv.invoice_number}
                              </button>
                            ) : (
                              inv.invoice_number
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{inv.supplier_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.invoice_date}</td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-800">{inv.due_date || inv.invoice_date}</span>
                              {inv.isDueDateEstimated ? (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200" title="No formal due date specified; estimated from invoice issue date">
                                  ESTIMATED
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200" title="Confirmed contractual due date">
                                  CONFIRMED
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700">AED {Number(inv.total_amount).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right">
                            {Number(inv.amount_paid) > 0 ? (
                              <span className="text-emerald-700 font-medium">AED {Number(inv.amount_paid).toFixed(2)} (Partial)</span>
                            ) : (
                              <span className="text-slate-400">AED 0.00</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">AED {Number(inv.balance_due).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            {inv.daysOverdue > 0 ? (
                              <span className="text-rose-600 font-bold">{inv.daysOverdue} days</span>
                            ) : (
                              <span className="text-emerald-600 font-medium">Current</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.payment_status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.payment_status === 'Partially_Paid'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}>
                              {inv.payment_status || 'Unpaid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW B: SUPPLIER STATEMENT RECONCILIATION ENGINE                          */}
      {/* ========================================================================= */}
      {activeTab === 'statement-reconciliation' && (
        <div className="space-y-5">
          {/* Configuration Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Step 1: Supplier Statement Parameters
                </h3>
                <p className="text-xs text-slate-500">
                  Select the supplier and enter closing balance from the vendor's statement of accounts.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLoadSampleStatement}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition"
              >
                Load Sample Vendor Statement
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Supplier Name <span className="text-rose-500">*</span>
                </label>
                <select
                  value={statementSupplierId}
                  onChange={(e) => setStatementSupplierId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 font-medium"
                >
                  <option value="">Select a Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Statement Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={statementDate}
                  onChange={(e) => setStatementDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Statement Closing Balance (AED) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={statementClosingBalance}
                  onChange={(e) => setStatementClosingBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Step 2: Line Items on Statement */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">
                  Step 2: Line Items on Vendor Statement ({statementEntries.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddEntryRow}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Statement Row
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 w-12 text-center">#</th>
                      <th className="py-2 px-3">Statement Invoice / Ref #</th>
                      <th className="py-2 px-3">Date on Statement</th>
                      <th className="py-2 px-3 text-right">Statement Billed Amount (AED)</th>
                      <th className="py-2 px-3 w-16 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {statementEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            value={entry.statementInvoiceNo}
                            onChange={(e) => handleEntryChange(idx, 'statementInvoiceNo', e.target.value)}
                            placeholder="e.g. INV-2026-001"
                            className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-800"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={entry.date || ''}
                            onChange={(e) => handleEntryChange(idx, 'date', e.target.value)}
                            className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs text-slate-700"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            step="0.01"
                            value={entry.amount || ''}
                            onChange={(e) => handleEntryChange(idx, 'amount', e.target.value)}
                            placeholder="0.00"
                            className="w-full px-2.5 py-1 border border-slate-200 rounded text-xs text-right font-semibold text-slate-900"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveEntryRow(idx)}
                            className="text-slate-400 hover:text-rose-600 transition"
                          >
                            <Trash2 className="w-4 h-4 mx-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Run Reconciliation Action Button */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Compares each statement line against CRM Purchase Invoices, detects quantity/rate discrepancies, and flags missing vouchers.
              </span>
              <button
                type="button"
                onClick={handleRunReconciliation}
                disabled={reconLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                {reconLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Statement...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Statement Reconciliation</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {reconError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              {reconError}
            </div>
          )}

          {/* Reconciliation Audit Results Section */}
          {reconciliationResult && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
              {/* Status Header */}
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                reconciliationResult.isReconciled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    reconciliationResult.isReconciled ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {reconciliationResult.isReconciled ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold">
                      {reconciliationResult.isReconciled
                        ? 'Vendor Statement Fully Reconciled'
                        : 'Discrepancies Identified During Reconciliation'}
                    </h3>
                    <p className="text-xs opacity-90">
                      Reconciled for <strong>{reconciliationResult.supplierName}</strong> as of {reconciliationResult.statementDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-[11px] opacity-75 block">Net Statement Variance:</span>
                    <span className={`text-base font-bold ${
                      reconciliationResult.netVariance === 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {reconciliationResult.netVariance > 0 ? '+' : ''}
                      AED {reconciliationResult.netVariance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 4 Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 block">Statement Balance</span>
                  <span className="text-sm font-bold text-slate-900">
                    AED {reconciliationResult.statementClosingBalance.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 block">CRM Ledger Balance</span>
                  <span className="text-sm font-bold text-slate-900">
                    AED {reconciliationResult.internalLedgerBalance.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <span className="text-emerald-700 block">Exact Matches</span>
                  <span className="text-sm font-bold text-emerald-900">
                    {reconciliationResult.summary.matchedCount} invoices
                  </span>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                  <span className="text-rose-700 block">Variances / Unrecorded</span>
                  <span className="text-sm font-bold text-rose-900">
                    {reconciliationResult.summary.varianceCount +
                      reconciliationResult.summary.missingInCrmCount +
                      reconciliationResult.summary.missingInStatementCount} items
                  </span>
                </div>
              </div>

              {/* Filter Tabs for Results */}
              <div className="flex items-center gap-1 border-b border-slate-200 pt-2 text-xs">
                <button
                  onClick={() => setReconActiveView('all')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition ${
                    reconActiveView === 'all'
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Entries ({reconciliationResult.summary.totalStatementEntries})
                </button>
                <button
                  onClick={() => setReconActiveView('matched')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition ${
                    reconActiveView === 'matched'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Exact Matches ({reconciliationResult.summary.matchedCount})
                </button>
                <button
                  onClick={() => setReconActiveView('variance')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition ${
                    reconActiveView === 'variance'
                      ? 'border-amber-600 text-amber-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Price Variances ({reconciliationResult.summary.varianceCount})
                </button>
                <button
                  onClick={() => setReconActiveView('missingCrm')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition ${
                    reconActiveView === 'missingCrm'
                      ? 'border-rose-600 text-rose-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Missing in CRM ({reconciliationResult.summary.missingInCrmCount})
                </button>
                <button
                  onClick={() => setReconActiveView('missingStmt')}
                  className={`px-3 py-1.5 font-bold border-b-2 transition ${
                    reconActiveView === 'missingStmt'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Missing in Statement ({reconciliationResult.summary.missingInStatementCount})
                </button>
                {(reconciliationResult.duplicateEntries && reconciliationResult.duplicateEntries.length > 0) && (
                  <button
                    onClick={() => setReconActiveView('duplicates')}
                    className={`px-3 py-1.5 font-bold border-b-2 transition ${
                      reconActiveView === 'duplicates'
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Statement Duplicates ({reconciliationResult.duplicateEntries.length})
                  </button>
                )}
                {(reconciliationResult.paymentEntries && reconciliationResult.paymentEntries.length > 0) && (
                  <button
                    onClick={() => setReconActiveView('payments')}
                    className={`px-3 py-1.5 font-bold border-b-2 transition ${
                      reconActiveView === 'payments'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Statement Payments ({reconciliationResult.paymentEntries.length})
                  </button>
                )}
              </div>

              {/* Matched & Variance Table */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Invoice / Ref Number</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Statement Billed</th>
                      <th className="py-2.5 px-3 text-right">CRM Recorded</th>
                      <th className="py-2.5 px-3 text-right">Variance</th>
                      <th className="py-2.5 px-3">Audit Classification</th>
                      <th className="py-2.5 px-3">Notes / Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* 1. Matched Entries */}
                    {(reconActiveView === 'all' || reconActiveView === 'matched') &&
                      reconciliationResult.matchedEntries.map((m, idx) => (
                        <tr key={`m-${idx}`} className="hover:bg-emerald-50/30">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{m.statementInvoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-500">{m.date}</td>
                          <td className="py-2.5 px-3 text-right font-medium">AED {m.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-medium">AED {m.crmAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">AED 0.00</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              EXACT MATCH
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">Amounts identical; verified</td>
                        </tr>
                      ))}

                    {/* 2. Variance Entries */}
                    {(reconActiveView === 'all' || reconActiveView === 'variance') &&
                      reconciliationResult.varianceEntries.map((v, idx) => (
                        <tr key={`v-${idx}`} className="hover:bg-amber-50/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{v.statementInvoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-500">{v.date}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-amber-900">AED {v.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-800">AED {v.crmAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-600">
                            {v.variance > 0 ? '+' : ''}AED {v.variance.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              PRICE VARIANCE
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">{v.notes}</td>
                        </tr>
                      ))}

                    {/* 3. Missing in CRM */}
                    {(reconActiveView === 'all' || reconActiveView === 'missingCrm') &&
                      reconciliationResult.missingInCrmEntries.map((c, idx) => (
                        <tr key={`c-${idx}`} className="hover:bg-rose-50/40">
                          <td className="py-2.5 px-3 font-semibold text-rose-900">{c.statementInvoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-500">{c.date || '—'}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-rose-700">AED {c.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-600">+AED {c.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              MISSING IN CRM
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-rose-700 font-medium">{c.notes}</td>
                        </tr>
                      ))}

                    {/* 4. Missing on Statement */}
                    {(reconActiveView === 'all' || reconActiveView === 'missingStmt') &&
                      reconciliationResult.missingInStatementEntries.map((s, idx) => (
                        <tr key={`s-${idx}`} className="hover:bg-blue-50/40">
                          <td className="py-2.5 px-3 font-semibold text-blue-900">{s.invoiceNumber}</td>
                          <td className="py-2.5 px-3 text-slate-500">{s.invoiceDate}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-800">AED {s.totalAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-600">-AED {s.balanceDue.toFixed(2)}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                              MISSING IN STATEMENT
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-blue-800 font-medium">{s.notes}</td>
                        </tr>
                      ))}

                    {/* 5. Statement Duplicates */}
                    {(reconActiveView === 'all' || reconActiveView === 'duplicates') &&
                      (reconciliationResult.duplicateEntries || []).map((d, idx) => (
                        <tr key={`d-${idx}`} className="hover:bg-purple-50/40">
                          <td className="py-2.5 px-3 font-semibold text-purple-900">{d.statementInvoiceNo}</td>
                          <td className="py-2.5 px-3 text-slate-500">{d.date || '—'}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-purple-700">AED {d.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-slate-400 font-mono">—</td>
                          <td className="py-2.5 px-3 text-right font-bold text-purple-600">DUPLICATE</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              DUPLICATE ON STATEMENT
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-purple-800 font-medium">{d.notes}</td>
                        </tr>
                      ))}

                    {/* 6. Statement Payments */}
                    {(reconActiveView === 'all' || reconActiveView === 'payments') &&
                      (reconciliationResult.paymentEntries || []).map((p, idx) => (
                        <tr key={`p-${idx}`} className="hover:bg-indigo-50/40">
                          <td className="py-2.5 px-3 font-semibold text-indigo-900">{p.statementRef}</td>
                          <td className="py-2.5 px-3 text-slate-500">{p.date || '—'}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-indigo-700">AED {p.statementAmount.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-medium text-slate-800">
                            {p.crmAmount !== undefined ? `AED ${Number(p.crmAmount).toFixed(2)}` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                            {p.status === 'PAYMENT_MATCHED' ? 'MATCHED' : 'UNMATCHED'}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              p.status === 'PAYMENT_MATCHED'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : 'bg-rose-100 text-rose-800 border-rose-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-indigo-800 font-medium">{p.notes}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
