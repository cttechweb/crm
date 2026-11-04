'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  FileText,
  Clock,
  Boxes,
  ShoppingBag,
  FileCheck,
  Truck,
  FileSpreadsheet,
  DollarSign,
  PackageCheck,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  Building2,
  CheckCircle2,
  Check,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { ProcurementDashboardSummary } from '@/types/enterprise-crm';
import { procurementDashboardApiService } from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface PurchaseDashboardProps {
  currentUser: MockAuthUser | null;
  onNavigateTab: (tab: string, extraParams?: Record<string, string>) => void;
}

export function PurchaseDashboard({ currentUser, onNavigateTab }: PurchaseDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProcurementDashboardSummary | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeQueueTab, setActiveQueueTab] = useState<
    | 'msrfApproval'
    | 'procurementIntake'
    | 'stockShortages'
    | 'quotesReview'
    | 'poApproval'
    | 'poDelivery'
    | 'grnProcessing'
    | 'invoiceMatching'
    | 'outstandingPayments'
    | 'requesterConfirmation'
    | 'requesterClosure'
  >('msrfApproval');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await procurementDashboardApiService.getSummary();
      if (res.success && res.data) {
        setData(res.data);
        setLastRefreshed(new Date());
      } else {
        setError('Failed to load dashboard metrics from CRM API.');
      }
    } catch (err: any) {
      console.error('Failed to load procurement dashboard summary:', err);
      setError(err?.message || 'Network error fetching procurement summary.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const queues = data?.operationalQueues;

  const queueTabs = [
    {
      id: 'msrfApproval',
      label: 'MSRFs Pending Approval',
      count: queues?.msrfPendingApproval.count || 0,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: Clock,
    },
    {
      id: 'procurementIntake',
      label: 'Procurement Intake',
      count: queues?.procurementIntake.count || 0,
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Layers,
    },
    {
      id: 'stockShortages',
      label: 'Stock Shortages',
      count: (queues?.stockShortages.inventoryShortageCount || 0) + (queues?.stockShortages.msrfShortageCount || 0),
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: Boxes,
    },
    {
      id: 'quotesReview',
      label: 'Quotes Awaiting Review',
      count: queues?.quotationsAwaitingReview.count || 0,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: ShoppingBag,
    },
    {
      id: 'poApproval',
      label: 'POs Awaiting Approval',
      count: queues?.posAwaitingApproval.count || 0,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: FileCheck,
    },
    {
      id: 'poDelivery',
      label: 'POs Awaiting Delivery',
      count: queues?.posAwaitingDelivery.count || 0,
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: Truck,
    },
    {
      id: 'grnProcessing',
      label: 'GRNs Awaiting Processing',
      count: queues?.goodsReceiptsAwaitingProcessing.count || 0,
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      icon: FileSpreadsheet,
    },
    {
      id: 'invoiceMatching',
      label: 'Invoices Awaiting Matching',
      count: queues?.invoicesAwaitingMatching.count || 0,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
    },
    {
      id: 'outstandingPayments',
      label: 'Outstanding Payables',
      count: queues?.outstandingPayments.count || 0,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: DollarSign,
    },
    {
      id: 'requesterConfirmation',
      label: 'Awaiting Receipt Sign-off',
      count: queues?.requestsAwaitingConfirmation.count || 0,
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: PackageCheck,
    },
    {
      id: 'requesterClosure',
      label: 'Awaiting Final Closure',
      count: queues?.requestsAwaitingClosure.count || 0,
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="space-y-5 text-slate-800">
      {/* 1. Header & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Cool Technologies CRM Operations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Purchase & Sourcing Executive Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline across MSRFs, stock shortages, quotations, purchase commitments, 3-way matching, and payables.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadDashboardData()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
            title="Refresh real-time data from CRM database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            onClick={() => onNavigateTab('msrf')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Create Requisition</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="text-xs font-bold underline text-rose-900 hover:text-rose-700 ml-4"
          >
            Try Again
          </button>
        </div>
      )}

      {/* 2. Primary KPI Executive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: MSRF Approvals */}
        <div
          onClick={() => {
            setActiveQueueTab('msrfApproval');
            const el = document.getElementById('queue-explorer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-4 shadow-xs transition cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">MSRF Approvals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {queues?.msrfPendingApproval.count ?? 0}
            </span>
            <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              Awaiting Head Sign-off
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Est. Value:</span>
            <span className="font-semibold text-slate-700">
              AED {(queues?.msrfPendingApproval.totalValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 2: Intake & Shortages */}
        <div
          onClick={() => {
            setActiveQueueTab('procurementIntake');
            const el = document.getElementById('queue-explorer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white border border-slate-200 hover:border-rose-400 rounded-xl p-4 shadow-xs transition cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Intake & Shortages</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {queues?.procurementIntake.count ?? 0}
            </span>
            <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              Intake Queue
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Stock Shortages:</span>
            <span className="font-semibold text-rose-600">
              {(queues?.stockShortages.inventoryShortageCount || 0) + (queues?.stockShortages.msrfShortageCount || 0)} items below min
            </span>
          </div>
        </div>

        {/* Card 3: POs Awaiting Delivery */}
        <div
          onClick={() => {
            setActiveQueueTab('poDelivery');
            const el = document.getElementById('queue-explorer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs transition cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open Commitments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {data?.openCommitments.openOrdersCount ?? 0}
            </span>
            <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
              Active Orders
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Committed Value:</span>
            <span className="font-semibold text-slate-700">
              AED {(data?.openCommitments.totalCommittedValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card 4: Outstanding Payables */}
        <div
          onClick={() => {
            setActiveQueueTab('outstandingPayments');
            const el = document.getElementById('queue-explorer-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white border border-slate-200 hover:border-emerald-400 rounded-xl p-4 shadow-xs transition cursor-pointer hover:shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Outstanding Payables</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              AED {(data?.payables.totalOutstandingBalance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Unpaid Invoices:</span>
            <span className="font-semibold text-emerald-700">
              {data?.payables.unpaidInvoiceCount ?? 0} pending payment
            </span>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics Bar (Matching Discrepancy Rate, Sourcing Turnaround, PO Approval) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 3-Way Match Health */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">3-Way Matching Health</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              (data?.matchingHealth.discrepancyRate ?? 0) === 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {data?.matchingHealth.discrepancyRate ?? 0}% Discrepancy Rate
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.max(5, 100 - (data?.matchingHealth.discrepancyRate ?? 0))}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Verified / Audited: {((data?.matchingHealth.totalInvoices ?? 0) - (data?.matchingHealth.discrepanciesCount ?? 0))}</span>
            <span className="text-rose-600 font-semibold">{data?.matchingHealth.discrepanciesCount ?? 0} Discrepancies</span>
          </div>
        </div>

        {/* PO Approval Governance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">Executive PO Approvals</span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              {queues?.posAwaitingApproval.count ?? 0} In Gatekeeper
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <span className="text-[11px] text-slate-400 block">&lt; AED 100k</span>
              <span className="font-bold text-slate-800">Finance Controller</span>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
              <span className="text-[11px] text-slate-400 block">&ge; AED 100k</span>
              <span className="font-bold text-slate-800">Chief Operating Officer</span>
            </div>
          </div>
        </div>

        {/* Sourcing Quote Compliance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">&ge; 10k Sourcing Policy</span>
            <span className="text-[11px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
              {data?.sourcing.sourcingComplianceRate ?? 100}% Compliant
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-2">
            Mandates &ge; 3 distinct competing quotes before PO conversion for requisitions &ge; AED 10,000.
          </p>
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Evaluated Major Requisitions:</span>
            <span className="font-semibold text-slate-800">{data?.sourcing.largeRequisitionsCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Operational Queues Section */}
      <div id="queue-explorer-section" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Queue Switcher Navigation */}
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-bold text-slate-800">Operational Queues &amp; Action Items</h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any queue to view pending CRM records
          </span>
        </div>

        {/* Queue Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/70 border-b border-slate-200 overflow-x-auto text-xs">
          {queueTabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeQueueTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveQueueTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 font-bold shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${t.badgeColor}`}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Queue Content Panel */}
        <div className="p-4">
          {/* QUEUE 1: MSRFs Pending Approval */}
          {activeQueueTab === 'msrfApproval' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Material / Service Requests Awaiting Reporting Head Authorization
                </span>
                <button
                  onClick={() => onNavigateTab('msrf')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  View All MSRFs <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.msrfPendingApproval.items || queues.msrfPendingApproval.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No requisitions currently awaiting manager approval. All caught up!</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">MSRF #</th>
                        <th className="py-2.5 px-3">Requestor</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Priority</th>
                        <th className="py-2.5 px-3 text-right">Est. Value (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.msrfPendingApproval.items.map((it: any) => (
                        <tr key={it.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{it.msrf_number}</td>
                          <td className="py-2.5 px-3">{it.requestor_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{it.department}</td>
                          <td className="py-2.5 px-3 text-slate-500">{it.date}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              it.priority === 'Urgent' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {it.priority}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                            {Number(it.estimated_total_value || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('msrf')}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Review &amp; Authorize
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 2: Procurement Intake */}
          {activeQueueTab === 'procurementIntake' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Approved Requisitions Awaiting Acceptance into Procurement Intake
                </span>
                <button
                  onClick={() => onNavigateTab('msrf')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Open Intake Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.procurementIntake.items || queues.procurementIntake.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No requisitions waiting in procurement intake queue.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">MSRF #</th>
                        <th className="py-2.5 px-3">Requestor</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Approved Date</th>
                        <th className="py-2.5 px-3 text-right">Est. Value (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.procurementIntake.items.map((it: any) => (
                        <tr key={it.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{it.msrf_number}</td>
                          <td className="py-2.5 px-3">{it.requestor_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{it.department}</td>
                          <td className="py-2.5 px-3 text-slate-500">{it.date}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                            {Number(it.estimated_total_value || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('msrf')}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Accept Intake
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 3: Stock Shortages */}
          {activeQueueTab === 'stockShortages' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Inventory Items Below Minimum Stock Threshold &amp; Unfulfilled Requisitions
                </span>
                <button
                  onClick={() => onNavigateTab('stock', { subtab: 'minimal' })}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Minimal Stock Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.stockShortages.items || queues.stockShortages.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>All inventory items are currently above their minimal reorder threshold.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item Code</th>
                        <th className="py-2.5 px-3">Item Name</th>
                        <th className="py-2.5 px-3">Store</th>
                        <th className="py-2.5 px-3 text-right">Current Stock</th>
                        <th className="py-2.5 px-3 text-right">Minimum Stock</th>
                        <th className="py-2.5 px-3 text-right">Deficit</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.stockShortages.items.map((it: any) => {
                        const current = Number(it.current_stock ?? it.stock ?? 0);
                        const min = Number(it.minimum_stock ?? 0);
                        const deficit = Math.max(0, min - current);
                        return (
                          <tr key={it.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{it.code}</td>
                            <td className="py-2.5 px-3">{it.name}</td>
                            <td className="py-2.5 px-3 text-slate-600">{it.store || 'MAIN WAREHOUSE'}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-rose-600">{current} {it.unit || 'Pcs'}</td>
                            <td className="py-2.5 px-3 text-right text-slate-500">{min} {it.unit || 'Pcs'}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-rose-700">-{deficit}</td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                onClick={() => onNavigateTab('msrf')}
                                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-[11px] transition"
                              >
                                Requisition Parts
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 4: Supplier Quotes Review */}
          {activeQueueTab === 'quotesReview' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Supplier Quotations Awaiting Comparative Analysis &amp; Recommendation
                </span>
                <button
                  onClick={() => onNavigateTab('quotations')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Quotation Matrix <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.quotationsAwaitingReview.items || queues.quotationsAwaitingReview.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No unreviewed quotations currently pending in the sourcing queue.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Quote Ref</th>
                        <th className="py-2.5 px-3">Linked MSRF</th>
                        <th className="py-2.5 px-3">Supplier Name</th>
                        <th className="py-2.5 px-3">Quote Date</th>
                        <th className="py-2.5 px-3 text-right">Lead Time</th>
                        <th className="py-2.5 px-3 text-right">Landed Amount (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.quotationsAwaitingReview.items.map((q: any) => (
                        <tr key={q.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{q.quotation_ref}</td>
                          <td className="py-2.5 px-3 text-rose-700 font-medium">{q.msrf_number || 'Direct RFQ'}</td>
                          <td className="py-2.5 px-3">{q.supplier_name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{q.quotation_date}</td>
                          <td className="py-2.5 px-3 text-right">{q.delivery_lead_time_days || 7} days</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {Number(q.landed_total_value || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('quotations', q.msrf_id ? { msrfId: q.msrf_id } : undefined)}
                              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Compare &amp; Recommend
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 5: POs Awaiting Approval */}
          {activeQueueTab === 'poApproval' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Purchase Orders Pending Executive Financial Sign-off
                </span>
                <button
                  onClick={() => onNavigateTab('po')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Purchase Orders Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.posAwaitingApproval.items || queues.posAwaitingApproval.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No purchase orders awaiting final approval.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">Required Authority</th>
                        <th className="py-2.5 px-3 text-right">Total Amount (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.posAwaitingApproval.items.map((po: any) => (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{po.po_number}</td>
                          <td className="py-2.5 px-3 text-slate-500">{po.date}</td>
                          <td className="py-2.5 px-3">{po.supplier}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              po.required_approval_tier === 'CHIEF_OPERATING_OFFICER'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {po.required_approval_tier === 'CHIEF_OPERATING_OFFICER' ? 'COO Sign-off' : 'Finance Controller'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {Number(po.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('po', { viewId: po.id })}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Review &amp; Sign
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 6: POs Awaiting Delivery */}
          {activeQueueTab === 'poDelivery' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Approved Purchase Orders Pending Physical Delivery from Vendors
                </span>
                <button
                  onClick={() => onNavigateTab('po')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Open PO Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.posAwaitingDelivery.items || queues.posAwaitingDelivery.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No open deliveries pending from suppliers.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">PO Number</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">PO Date</th>
                        <th className="py-2.5 px-3">Expected Delivery</th>
                        <th className="py-2.5 px-3">Delivery Mode</th>
                        <th className="py-2.5 px-3 text-right">Amount (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.posAwaitingDelivery.items.map((po: any) => (
                        <tr key={po.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{po.po_number}</td>
                          <td className="py-2.5 px-3">{po.supplier}</td>
                          <td className="py-2.5 px-3 text-slate-500">{po.date}</td>
                          <td className="py-2.5 px-3 text-slate-600">{po.expected_delivery_date || 'Pending update'}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                              {(po.delivery_mode || 'Warehouse_Receipt').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {Number(po.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('stock-in', { poNumber: po.po_number })}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Receive GRN
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 7: GRNs Awaiting Processing */}
          {activeQueueTab === 'grnProcessing' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Goods Receipts Notes (GRNs) Awaiting Supplier Invoice Verification &amp; 3-Way Match
                </span>
                <button
                  onClick={() => onNavigateTab('stock-in')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Stock-In Vouchers <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.goodsReceiptsAwaitingProcessing.items || queues.goodsReceiptsAwaitingProcessing.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>All goods receipt vouchers are fully matched and audited.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">GRN #</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">Store</th>
                        <th className="py-2.5 px-3 text-right">Items Received</th>
                        <th className="py-2.5 px-3 text-right">Total Amount (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.goodsReceiptsAwaitingProcessing.items.map((g: any) => (
                        <tr key={g.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{g.stock_in_no}</td>
                          <td className="py-2.5 px-3 text-slate-500">{g.date}</td>
                          <td className="py-2.5 px-3">{g.supplier}</td>
                          <td className="py-2.5 px-3 text-slate-600">{g.store || 'MAIN WAREHOUSE'}</td>
                          <td className="py-2.5 px-3 text-right">{g.total_items} items</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">
                            {Number(g.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('invoice', { grnNumber: g.stock_in_no })}
                              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Match to Invoice
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 8: Invoices Awaiting Matching */}
          {activeQueueTab === 'invoiceMatching' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Supplier Invoices Pending Audit or Flagged with Price/Quantity Discrepancies
                </span>
                <button
                  onClick={() => onNavigateTab('invoice')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Purchase Invoices <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.invoicesAwaitingMatching.items || queues.invoicesAwaitingMatching.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>Zero invoices currently flagged with discrepancies or pending 3-way matching.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">PO Reference</th>
                        <th className="py-2.5 px-3">Matching Status</th>
                        <th className="py-2.5 px-3">Discrepancy Detail</th>
                        <th className="py-2.5 px-3 text-right">Total (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.invoicesAwaitingMatching.items.map((inv: any) => (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{inv.invoice_number}</td>
                          <td className="py-2.5 px-3">{inv.supplier_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{inv.purchase_order_number || 'No PO'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              inv.matching_status === 'Price_Discrepancy'
                                ? 'bg-rose-100 text-rose-700'
                                : inv.matching_status === 'Quantity_Discrepancy'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {(inv.matching_status || '').replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                            {inv.discrepancy_reason || 'Pending automated 3-way audit against PO & GRN'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            {Number(inv.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('invoice', { view: inv.invoice_number })}
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Resolve Audit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 9: Outstanding Supplier Payments */}
          {activeQueueTab === 'outstandingPayments' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Unsettled Vendor Invoices &amp; Balances Due for Disbursement
                </span>
                <button
                  onClick={() => onNavigateTab('payment')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Payments Register <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.outstandingPayments.items || queues.outstandingPayments.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No outstanding balances due to suppliers. Accounts payable is fully current!</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Invoice #</th>
                        <th className="py-2.5 px-3">Supplier</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Invoiced (AED)</th>
                        <th className="py-2.5 px-3 text-right">Paid (AED)</th>
                        <th className="py-2.5 px-3 text-right">Balance Due (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.outstandingPayments.items.map((it: any) => (
                        <tr key={it.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{it.invoice_number}</td>
                          <td className="py-2.5 px-3">{it.supplier_name}</td>
                          <td className="py-2.5 px-3 text-slate-500">{it.due_date || it.invoice_date}</td>
                          <td className="py-2.5 px-3 text-right text-slate-600">{Number(it.total_amount || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right text-emerald-600 font-medium">{Number(it.amount_paid || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-600">{Number(it.balance_due || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('payment', { invoiceId: it.id })}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Disburse Payment
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 10: Requester Confirmation */}
          {activeQueueTab === 'requesterConfirmation' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Approved Requisitions Delivered to Field/Site Awaiting Technical Requester Sign-off
                </span>
                <button
                  onClick={() => onNavigateTab('msrf')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Manage Requisitions <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.requestsAwaitingConfirmation.items || queues.requestsAwaitingConfirmation.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>All delivered items have verified receipt confirmations from requestors.</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">MSRF #</th>
                        <th className="py-2.5 px-3">Requestor Name</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Required By</th>
                        <th className="py-2.5 px-3 text-right">Value (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.requestsAwaitingConfirmation.items.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{r.msrf_number}</td>
                          <td className="py-2.5 px-3">{r.requestor_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.department}</td>
                          <td className="py-2.5 px-3 text-slate-500">{r.required_by_date}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{Number(r.estimated_total_value || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('msrf')}
                              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Confirm Physical Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* QUEUE 11: Requester Closure */}
          {activeQueueTab === 'requesterClosure' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-700">
                  Confirmed Requisitions Ready for Final Lifecycle Closure
                </span>
                <button
                  onClick={() => onNavigateTab('msrf')}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
                >
                  Manage Requisitions <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {(!queues?.requestsAwaitingClosure.items || queues.requestsAwaitingClosure.items.length === 0) ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <span>No requisitions waiting for final closure. Requisition register is tidy!</span>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">MSRF #</th>
                        <th className="py-2.5 px-3">Requestor Name</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">Receipt Confirmed At</th>
                        <th className="py-2.5 px-3 text-right">Value (AED)</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {queues.requestsAwaitingClosure.items.map((r: any) => (
                        <tr key={r.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-semibold text-slate-900">{r.msrf_number}</td>
                          <td className="py-2.5 px-3">{r.requestor_name}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.department}</td>
                          <td className="py-2.5 px-3 text-emerald-600 font-medium">{r.requestor_confirmed_at}</td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{Number(r.estimated_total_value || 0).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              onClick={() => onNavigateTab('msrf')}
                              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded font-medium text-[11px] transition"
                            >
                              Execute Final Closure
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Analytics Grid: Spend by Supplier & Departmental Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Suppliers by Approved Spend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Top Suppliers by Approved Spend</h3>
            </div>
            <button
              onClick={() => onNavigateTab('supplier')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700"
            >
              Suppliers Directory
            </button>
          </div>

          {(!data?.spendBySupplier || data.spendBySupplier.length === 0) ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No approved purchase order spend recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {data.spendBySupplier.map((s, idx) => {
                const total = data.spendBySupplier.reduce((acc, curr) => acc + (curr.total_spend || 0), 0) || 1;
                const pct = Math.round(((s.total_spend || 0) / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{s.supplier}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">{s.po_count} POs</span>
                        <span className="font-bold text-slate-900">AED {Number(s.total_spend || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Departmental Requisition Spend */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Departmental Requested Requisitions</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Live Requisition Value
            </span>
          </div>

          {(!data?.departmentalSpend || data.departmentalSpend.length === 0) ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No material requisition department data recorded.
            </div>
          ) : (
            <div className="space-y-3">
              {data.departmentalSpend.map((d, idx) => {
                const total = data.departmentalSpend.reduce((acc, curr) => acc + (curr.requested_value || 0), 0) || 1;
                const pct = Math.round(((d.requested_value || 0) / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{d.department}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-mono text-[11px]">{d.request_count} Requisitions</span>
                        <span className="font-bold text-slate-900">AED {Number(d.requested_value || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(3, pct))}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
