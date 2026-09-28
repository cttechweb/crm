'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  BarChart3,
  ArrowUpRight,
  ChevronDown,
  Globe,
  Radio,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface RepPerformanceItem {
  id: string;
  repName: string;
  assignedLeads: number;
  contactedRate: string;
  siteSurveys: number;
  proposalsSent: number;
  dealsWon: number;
  revenue: number;
  conversionRate: string;
}

const REP_REPORTS: RepPerformanceItem[] = [
  {
    id: 'REP-01',
    repName: 'Mohammed Rashid',
    assignedLeads: 48,
    contactedRate: '98.0%',
    siteSurveys: 24,
    proposalsSent: 20,
    dealsWon: 18,
    revenue: 680000,
    conversionRate: '37.5%',
  },
  {
    id: 'REP-02',
    repName: 'Alex Rivera',
    assignedLeads: 42,
    contactedRate: '95.2%',
    siteSurveys: 19,
    proposalsSent: 16,
    dealsWon: 14,
    revenue: 520000,
    conversionRate: '33.3%',
  },
  {
    id: 'REP-03',
    repName: 'Sarah Al-Mansoor',
    assignedLeads: 25,
    contactedRate: '100.0%',
    siteSurveys: 12,
    proposalsSent: 10,
    dealsWon: 10,
    revenue: 390000,
    conversionRate: '40.0%',
  },
];

function LeadReportsContent() {
  const [reports, setReports] = useState<RepPerformanceItem[]>(REP_REPORTS);
  const [dateRange, setDateRange] = useState('This Quarter');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const totalLeads = reports.reduce((sum, r) => sum + r.assignedLeads, 0);
  const totalDeals = reports.reduce((sum, r) => sum + r.dealsWon, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const avgWinRate = totalLeads > 0 ? ((totalDeals / totalLeads) * 100).toFixed(1) : '0';

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Lead Reports &amp; Analytics</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Sales team conversion efficiency, acquisition velocity, and closed contract revenue breakdown.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Exporting Lead Analytics Report to CSV...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Total Leads Handled</span>
          <p className="text-xl font-black text-slate-900 mt-1">{totalLeads}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Active Pipeline</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600">Surveys Completed</span>
          <p className="text-xl font-black text-blue-600 mt-1">55</p>
          <span className="text-[10px] text-blue-600 font-semibold">On-site technical</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600">Proposals Sent</span>
          <p className="text-xl font-black text-indigo-600 mt-1">46</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Formal quotes</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600">Won Contracts</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{totalDeals}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Converted</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600">Win Rate %</span>
          <p className="text-xl font-black text-purple-600 mt-1">{avgWinRate}%</p>
          <span className="text-[10px] text-purple-600 font-semibold">Conversion ratio</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700">Contract Revenue</span>
          <p className="text-xl font-black text-emerald-700 mt-1">AED {(totalRevenue / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Deal value won</span>
        </div>
      </div>

      {/* Sales Rep Conversion Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Sales Representative Conversion Log</h2>
          <span className="text-xs text-slate-500">{reports.length} Reps</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Sales Representative</th>
                <th className="py-3 px-3 text-center">Assigned Leads</th>
                <th className="py-3 px-3 text-center">Contact Rate %</th>
                <th className="py-3 px-3 text-center">Site Surveys</th>
                <th className="py-3 px-3 text-center">Proposals Sent</th>
                <th className="py-3 px-3 text-center">Deals Won</th>
                <th className="py-3 px-3 text-right">Revenue Generated</th>
                <th className="py-3 px-4 text-right">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{rep.repName}</td>
                  <td className="py-3.5 px-3 text-center font-bold text-blue-700">{rep.assignedLeads}</td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-700">{rep.contactedRate}</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{rep.siteSurveys}</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">{rep.proposalsSent}</td>
                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">{rep.dealsWon}</td>
                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">AED {rep.revenue.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      {rep.conversionRate}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function LeadReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Lead Analytics...</div>}>
      <LeadReportsContent />
    </Suspense>
  );
}
