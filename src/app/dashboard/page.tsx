'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  Target,
  CheckSquare,
  Building2,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  ChevronRight,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  UserCheck,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DealStage } from '@/types/enterprise-crm';
import { useRouter } from 'next/navigation';
import { authMockService } from '@/services/authMockService';

export default function DashboardPage() {
  const router = useRouter();
  const { users, customers, leads, tasks, salesOpportunities } = useEnterpriseCrm();

  const [dateFilter, setDateFilter] = useState('month');
  const [repFilter, setRepFilter] = useState('all');

  React.useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user?.role === 'manager') {
      router.replace('/manager/dashboard');
    } else if (user?.role === 'employee' || user?.role === 'worker') {
      router.replace('/worker/dashboard');
    }
  }, [router]);

  // Business calculations
  const totalPipeline = salesOpportunities.reduce((acc, o) => acc + o.amount, 0);
  const hotLeadsCount = leads.filter((l) => l.rating === 'Hot').length;
  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length;
  const urgentTasksCount = tasks.filter((t) => t.priority === 'Urgent').length;

  const quotationsValue = salesOpportunities
    .filter((o) => o.stage === 'Quotation' || o.stage === 'Opportunity')
    .reduce((acc, o) => acc + o.amount, 0);

  const confirmedOrdersValue = salesOpportunities
    .filter((o) => o.stage === 'Order' || o.stage === 'Invoice' || o.stage === 'Receipt' || o.stage === 'Delivery Note')
    .reduce((acc, o) => acc + o.amount, 0);

  // Corporate pipeline breakdown
  const pipelineStages: { stage: DealStage; count: number; value: number; prob: number; color: string }[] = [
    {
      stage: 'Opportunity',
      count: salesOpportunities.filter((o) => o.stage === 'Opportunity').length,
      value: salesOpportunities.filter((o) => o.stage === 'Opportunity').reduce((a, o) => a + o.amount, 0),
      prob: 30,
      color: 'bg-blue-600',
    },
    {
      stage: 'Quotation',
      count: salesOpportunities.filter((o) => o.stage === 'Quotation').length,
      value: salesOpportunities.filter((o) => o.stage === 'Quotation').reduce((a, o) => a + o.amount, 0),
      prob: 60,
      color: 'bg-indigo-600',
    },
    {
      stage: 'Order',
      count: salesOpportunities.filter((o) => o.stage === 'Order').length,
      value: salesOpportunities.filter((o) => o.stage === 'Order').reduce((a, o) => a + o.amount, 0),
      prob: 80,
      color: 'bg-amber-600',
    },
    {
      stage: 'Proforma Invoice',
      count: salesOpportunities.filter((o) => o.stage === 'Proforma Invoice').length,
      value: salesOpportunities.filter((o) => o.stage === 'Proforma Invoice').reduce((a, o) => a + o.amount, 0),
      prob: 90,
      color: 'bg-purple-600',
    },
    {
      stage: 'Invoice',
      count: salesOpportunities.filter((o) => o.stage === 'Invoice').length,
      value: salesOpportunities.filter((o) => o.stage === 'Invoice').reduce((a, o) => a + o.amount, 0),
      prob: 95,
      color: 'bg-emerald-600',
    },
    {
      stage: 'Delivery Note',
      count: salesOpportunities.filter((o) => o.stage === 'Delivery Note').length,
      value: salesOpportunities.filter((o) => o.stage === 'Delivery Note').reduce((a, o) => a + o.amount, 0),
      prob: 100,
      color: 'bg-teal-600',
    },
  ];

  // Monthly revenue performance
  const monthlyRevenueRows = [
    { month: 'September 2026', target: 100000, achieved: 128000, variance: 28000, pct: 128, status: 'Exceeded' },
    { month: 'August 2026', target: 90000, achieved: 112000, variance: 22000, pct: 124, status: 'Exceeded' },
    { month: 'July 2026', target: 85000, achieved: 104000, variance: 19000, pct: 122, status: 'Exceeded' },
    { month: 'June 2026', target: 80000, achieved: 95000, variance: 15000, pct: 118, status: 'Achieved' },
    { month: 'May 2026', target: 70000, achieved: 89000, variance: 19000, pct: 127, status: 'Exceeded' },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* ── Enterprise Control Bar ───────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
              Sales & Commercial Operations Dashboard
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">
              Cool Technologies Enterprise CRM • Real-time Executive Overview & Pipeline Intelligence
            </p>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="month">Current Month (Sep 2026)</option>
              <option value="quarter">Q3 2026</option>
              <option value="year">Year to Date (2026)</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={repFilter}
              onChange={(e) => setRepFilter(e.target.value)}
              className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Executives</option>
              <option value="alex">Alex Rivera</option>
              <option value="elena">Elena Rostova</option>
              <option value="jordan">Jordan Hayes</option>
            </select>
          </div>

          <Link href="/leads?action=add">
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Lead
            </Button>
          </Link>

          <Link href="/sales?action=add">
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Deal
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Key Performance Metrics Grid (5 Structured Cards) ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Total Pipeline Value */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <span className="p-1 rounded bg-blue-50 text-blue-600">
              <DollarSign className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(totalPipeline)}
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              <span className="text-emerald-600 font-semibold flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.5% YoY
              </span>
              <span>{salesOpportunities.length} Active Deals</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Open Quotations */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Open Quotations
            </span>
            <span className="p-1 rounded bg-indigo-50 text-indigo-600">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {formatCurrency(quotationsValue)}
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              <span className="text-blue-600 font-semibold">In Proposal Phase</span>
              <span>2 Proposals</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Leads */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Active Inquiries
            </span>
            <span className="p-1 rounded bg-amber-50 text-amber-600">
              <Target className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {leads.length} Leads
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              <span className="text-rose-600 font-semibold">{hotLeadsCount} Hot Priority</span>
              <span>80% Qualified</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Customers & Accounts */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Corporate Accounts
            </span>
            <span className="p-1 rounded bg-purple-50 text-purple-600">
              <Building2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {customers.length} Accounts
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              <span className="text-emerald-600 font-semibold">100% Active</span>
              <span>Tier-1 Enterprise</span>
            </div>
          </div>
        </div>

        {/* Metric 5: Tasks & SLA Actions */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Daily Action Queue
            </span>
            <span className="p-1 rounded bg-rose-50 text-rose-600">
              <CheckSquare className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2">
            <p className="text-xl font-bold text-slate-900 tracking-tight">
              {tasks.length} Tasks
            </p>
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              {overdueTasksCount > 0 ? (
                <span className="text-rose-600 font-bold flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-0.5" /> {overdueTasksCount} Overdue
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold">All on track</span>
              )}
              <span>{urgentTasksCount} Urgent</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Commercial Sales Pipeline Stages (Corporate Funnel Grid) ─── */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" /> Commercial Sales Pipeline By Stage
            </h2>
            <p className="text-[11px] text-slate-500">
              Stage distribution, total value, and conversion probability for active deal lifecycle
            </p>
          </div>
          <Link
            href="/sales"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            View Full Pipeline <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {pipelineStages.map((stage) => {
            const weightedValue = Math.round((stage.value * stage.prob) / 100);
            return (
              <div
                key={stage.stage}
                className="p-3 rounded-md border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span className="truncate">{stage.stage}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border border-slate-200 font-bold text-slate-700">
                    {stage.count}
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">{formatCurrency(stage.value)}</p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Prob: {stage.prob}%</span>
                  <span className="text-blue-600 font-medium">Wtd: {formatCurrency(weightedValue)}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${stage.color} rounded-full`} style={{ width: `${stage.prob}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Main Operations Split: Active Inquiries vs Action Tasks ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Pane (7 Cols): Active Deal Opportunities & Inquiries Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Active Commercial Inquiries & Deals
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                {salesOpportunities.length} Deals
              </span>
            </div>
            <Link
              href="/sales"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              All Inquiries <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Opportunity / Client</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Executive</th>
                  <th className="py-2.5 px-3 text-right">Value ($)</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesOpportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900 line-clamp-1">{opp.title}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <span>{opp.customer}</span>
                      </p>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <StatusBadge status={opp.stage} />
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                      <span className="font-medium">{opp.owner}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="font-bold text-slate-900">{formatCurrency(opp.amount)}</span>
                      <p className="text-[10px] text-slate-400">{opp.probability}% Prob</p>
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <Link
                        href="/sales"
                        className="inline-block px-2 py-1 rounded border border-slate-200 bg-white text-[11px] font-semibold text-slate-700 hover:text-blue-600 hover:border-blue-200 transition-colors"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Pane (5 Cols): Task Execution & Follow-up Schedule */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daily Execution & Follow-up Queue
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-bold">
                {tasks.length}
              </span>
            </div>
            <Link
              href="/tasks"
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              Task List <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto max-h-[380px]">
            {tasks.map((task) => (
              <div key={task.id} className="p-3 hover:bg-slate-50/80 transition-colors flex items-start gap-2.5">
                <div className="mt-0.5 flex-shrink-0">
                  {task.priority === 'Urgent' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block ring-2 ring-rose-100" />
                  ) : task.priority === 'High' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block ring-2 ring-amber-100" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block ring-2 ring-blue-100" />
                  )}
                </div>

                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                    {task.taskDetails}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                    <span className="text-slate-600 font-medium">{task.assignee.name}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-medium">{task.taskType}</span>
                    <span>•</span>
                    <span className="text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-3 h-3" /> {task.dueDate}
                    </span>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Monthly Revenue Attainment & Target Variance Ledger ──────── */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Monthly Commercial Revenue Ledger & Quota Attainment
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Historical variance ledger comparing contractual quota with realized revenue
            </p>
          </div>
          <Link href="/reports" className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
            Financial Reports <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Financial Period</th>
                <th className="py-2.5 px-4 text-right">Quota Target ($)</th>
                <th className="py-2.5 px-4 text-right">Achieved Revenue ($)</th>
                <th className="py-2.5 px-4 text-right">Variance ($)</th>
                <th className="py-2.5 px-4 text-center">Attainment Rate</th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyRevenueRows.map((row) => (
                <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">{row.month}</td>
                  <td className="py-2.5 px-4 text-right font-medium text-slate-600">
                    {formatCurrency(row.target)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-slate-900">
                    {formatCurrency(row.achieved)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-bold text-emerald-600">
                    +{formatCurrency(row.variance)}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 font-bold text-slate-800">
                      <span>{row.pct}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden inline-block">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${Math.min(100, row.pct)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {row.status}
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
