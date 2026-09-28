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
  Shield,
  Building2,
  HeartHandshake,
  PieChart,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface CustomerReportItem {
  id: string;
  company: string;
  group: string;
  totalContracts: number;
  activeAmcDeals: number;
  lifetimeSpend: number;
  healthScore: 'Healthy' | 'Moderate' | 'At-Risk';
  retentionProbability: string;
  accountManager: string;
}

const CUSTOMER_REPORT_DATA: CustomerReportItem[] = [
  {
    id: 'CR-01',
    company: 'Al Futtaim Engineering',
    group: 'Enterprise Key Accounts',
    totalContracts: 14,
    activeAmcDeals: 6,
    lifetimeSpend: 1450000,
    healthScore: 'Healthy',
    retentionProbability: '98%',
    accountManager: 'Mohammed Rashid',
  },
  {
    id: 'CR-02',
    company: 'Danube Hospitality Group',
    group: 'Hospitality & Luxury Hotels',
    totalContracts: 9,
    activeAmcDeals: 4,
    lifetimeSpend: 890000,
    healthScore: 'Healthy',
    retentionProbability: '95%',
    accountManager: 'Sarah Al-Mansoor',
  },
  {
    id: 'CR-03',
    company: 'Sharjah Industrial Bakery',
    group: 'Industrial Plants & Cold Storage',
    totalContracts: 7,
    activeAmcDeals: 3,
    lifetimeSpend: 620000,
    healthScore: 'Moderate',
    retentionProbability: '88%',
    accountManager: 'Mohammed Rashid',
  },
  {
    id: 'CR-04',
    company: 'Acme Corporation UAE',
    group: 'Commercial Real Estate',
    totalContracts: 8,
    activeAmcDeals: 4,
    lifetimeSpend: 750000,
    healthScore: 'Healthy',
    retentionProbability: '96%',
    accountManager: 'Alex Rivera',
  },
  {
    id: 'CR-05',
    company: 'Sobha Realty Facilities',
    group: 'Commercial Towers',
    totalContracts: 11,
    activeAmcDeals: 5,
    lifetimeSpend: 980000,
    healthScore: 'Healthy',
    retentionProbability: '97%',
    accountManager: 'Alex Rivera',
  },
  {
    id: 'CR-06',
    company: 'KIZAD Cold Logistics Terminal',
    group: 'Industrial Plants & Cold Storage',
    totalContracts: 4,
    activeAmcDeals: 1,
    lifetimeSpend: 340000,
    healthScore: 'At-Risk',
    retentionProbability: '62%',
    accountManager: 'Sarah Al-Mansoor',
  },
];

function CustomerReportsContent() {
  const [data, setData] = useState<CustomerReportItem[]>(CUSTOMER_REPORT_DATA);
  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const totalPortfolioValue = data.reduce((sum, d) => sum + d.lifetimeSpend, 0);
  const totalAmcDeals = data.reduce((sum, d) => sum + d.activeAmcDeals, 0);
  const healthyAccounts = data.filter((d) => d.healthScore === 'Healthy').length;
  const atRiskAccounts = data.filter((d) => d.healthScore === 'At-Risk').length;

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const matchSearch =
        d.company.toLowerCase().includes(search.toLowerCase()) ||
        d.group.toLowerCase().includes(search.toLowerCase()) ||
        d.accountManager.toLowerCase().includes(search.toLowerCase());

      const matchHealth = healthFilter === 'All' || d.healthScore === healthFilter;

      return matchSearch && matchHealth;
    });
  }, [data, search, healthFilter]);

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
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Reports &amp; LTV Analytics</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Analyze corporate customer lifetime value (LTV), contract retention velocity, and account health distribution.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Exporting Customer Portfolio Report to CSV...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Customer Report</span>
        </button>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Active Accounts</span>
          <p className="text-xl font-black text-slate-900 mt-1">{data.length}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Corporate Clients</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600">Active AMC Deals</span>
          <p className="text-xl font-black text-blue-600 mt-1">{totalAmcDeals}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Maintenance retainers</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600">Total Portfolio LTV</span>
          <p className="text-xl font-black text-emerald-600 mt-1">AED {(totalPortfolioValue / 1000000).toFixed(2)}M</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Lifetime contract sum</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600">Avg LTV per Account</span>
          <p className="text-xl font-black text-purple-600 mt-1">AED {(totalPortfolioValue / data.length / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-purple-600 font-semibold">High ticket value</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700">Healthy Retention</span>
          <p className="text-xl font-black text-emerald-700 mt-1">{healthyAccounts}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">&gt; 90% renewal prob</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600">At-Risk Accounts</span>
          <p className="text-xl font-black text-rose-600 mt-1">{atRiskAccounts}</p>
          <span className="text-[10px] text-rose-600 font-semibold">Requires re-engagement</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Account Health</label>
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs min-w-[150px] cursor-pointer"
            >
              <option value="All">All Health Tiers</option>
              <option value="Healthy">Healthy (Green)</option>
              <option value="Moderate">Moderate (Amber)</option>
              <option value="At-Risk">At-Risk (Red)</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, group, manager..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Customer LTV Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Customer Lifetime Value &amp; Health Matrix</h2>
          <span className="text-xs text-slate-500">{filtered.length} Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Corporate Customer</th>
                <th className="py-3 px-3">Industry Group</th>
                <th className="py-3 px-3 text-center">Total Contracts</th>
                <th className="py-3 px-3 text-center">Active AMC</th>
                <th className="py-3 px-3 text-right">Lifetime Spend (AED)</th>
                <th className="py-3 px-3 text-center">Account Health</th>
                <th className="py-3 px-3 text-center">Renewal Prob</th>
                <th className="py-3 px-4 text-right">Account Manager</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {item.company}
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {item.group}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.totalContracts}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-blue-700">
                    {item.activeAmcDeals}
                  </td>

                  <td className="py-3.5 px-3 text-right font-black text-emerald-700">
                    AED {item.lifetimeSpend.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        item.healthScore === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.healthScore === 'Moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      )}
                    >
                      {item.healthScore}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.retentionProbability}
                  </td>

                  <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                    {item.accountManager}
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

export default function CustomerReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customer Reports...</div>}>
      <CustomerReportsContent />
    </Suspense>
  );
}
