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
  Clock,
  Sparkles,
  ArrowDownRight,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface RepPerformanceItem {
  id: string;
  repName: string;
  role: string;
  assignedLeads: number;
  contactedRate: string;
  siteSurveys: number;
  proposalsSent: number;
  dealsWon: number;
  revenue: number;
  conversionRate: string;
}

function LeadReportsContent() {
  const { leads, tasks, quotations, salesOpportunities, users } = useEnterpriseCrm();
  const [dateRange, setDateRange] = useState('This Quarter');
  const [search, setSearch] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Dynamically compute live Sales Rep performance from actual CRM data
  const dynamicReps = useMemo(() => {
    // Collect distinct reps from leads, users, and opportunities
    const repMap = new Map<string, { role: string }>();

    // Add reps from active leads
    leads.forEach((l) => {
      const rep = l.owner || l.assignedEmployee || l.createdBy || 'Manager';
      if (!repMap.has(rep)) {
        repMap.set(rep, { role: rep.toLowerCase().includes('manager') ? 'Sales Manager' : 'Sales Representative' });
      }
    });

    // Add active sales/manager users
    users.forEach((u) => {
      if (u.role === 'Manager' || u.role === 'Employee' || u.role === 'Super Admin') {
        if (!repMap.has(u.name)) {
          repMap.set(u.name, { role: u.role === 'Manager' ? 'Sales Manager' : 'Sales Representative' });
        }
      }
    });

    // Ensure at least Manager is present
    if (!repMap.has('Manager')) {
      repMap.set('Manager', { role: 'Sales Manager' });
    }

    const reportList: RepPerformanceItem[] = [];

    Array.from(repMap.entries()).forEach(([repName, meta], idx) => {
      // Leads assigned to or owned by this rep
      const repLeads = leads.filter((l) => {
        const owner = (l.owner || l.assignedEmployee || l.createdBy || '').toLowerCase();
        const target = repName.toLowerCase();
        return owner === target || owner.includes(target) || target.includes(owner);
      });

      const assignedCount = repLeads.length;

      // Contacted leads
      const contactedCount = repLeads.filter(
        (l) => l.status && l.status !== 'New' && l.status !== 'Pending'
      ).length;
      const contactedRate =
        assignedCount > 0 ? `${((contactedCount / assignedCount) * 100).toFixed(1)}%` : '100.0%';

      // Site Surveys for this rep
      const surveyTasks = tasks.filter((t) => {
        const assignee = (t.assignee?.name || t.assignedEmployee || '').toLowerCase();
        const target = repName.toLowerCase();
        const isSurvey =
          (t.taskType && t.taskType.toLowerCase().includes('survey')) ||
          (t.taskDetails && t.taskDetails.toLowerCase().includes('survey'));
        return (assignee === target || assignee.includes(target)) && isSurvey;
      });

      // Proposals sent by this rep
      const repQuotes = quotations.filter((q) => {
        const owner = (q.owner || '').toLowerCase();
        const target = repName.toLowerCase();
        return owner === target || owner.includes(target);
      });

      const repOppsInProposal = salesOpportunities.filter((opp) => {
        const owner = (opp.owner || '').toLowerCase();
        const target = repName.toLowerCase();
        return (owner === target || owner.includes(target)) && opp.stage.toLowerCase().includes('quotation');
      });

      const proposalsCount = Math.max(repQuotes.length, repOppsInProposal.length, repLeads.filter(l => (l.status || '').toLowerCase().includes('proposal')).length);

      // Deals won / converted
      const convertedLeads = repLeads.filter(
        (l) => l.status === 'Converted' || l.status === 'Won'
      );
      const dealsWon = convertedLeads.length;

      // Revenue generated from converted leads & opportunities
      const leadRevenue = convertedLeads.reduce((sum, l) => sum + (l.value || 0), 0);
      const oppRevenue = salesOpportunities
        .filter((opp) => {
          const owner = (opp.owner || '').toLowerCase();
          const target = repName.toLowerCase();
          return (owner === target || owner.includes(target));
        })
        .reduce((sum, opp) => sum + (opp.amount || 0), 0);

      const revenue = Math.max(leadRevenue, oppRevenue);

      const conversionRate =
        assignedCount > 0 ? `${((dealsWon / assignedCount) * 100).toFixed(1)}%` : dealsWon > 0 ? '100.0%' : '0.0%';

      // Only show reps with active activity or include top performers
      if (assignedCount > 0 || dealsWon > 0 || revenue > 0 || repName === 'Manager') {
        reportList.push({
          id: `REP-0${idx + 1}`,
          repName,
          role: meta.role,
          assignedLeads: assignedCount,
          contactedRate,
          siteSurveys: surveyTasks.length,
          proposalsSent: proposalsCount,
          dealsWon,
          revenue,
          conversionRate,
        });
      }
    });

    return reportList;
  }, [leads, tasks, quotations, salesOpportunities, users]);

  // Filter by Search
  const filteredReps = dynamicReps.filter((r) =>
    r.repName.toLowerCase().includes(search.toLowerCase()) ||
    r.role.toLowerCase().includes(search.toLowerCase())
  );

  // 6 Live KPI Metrics
  const totalLeadsHandled = leads.length;
  const surveysCompleted = tasks.filter((t) => {
    const isSurvey =
      (t.taskType && t.taskType.toLowerCase().includes('survey')) ||
      (t.taskDetails && t.taskDetails.toLowerCase().includes('survey'));
    return isSurvey && t.status === 'Completed';
  }).length;

  const proposalsSent = Math.max(
    quotations.length,
    salesOpportunities.filter((opp) => opp.stage.toLowerCase().includes('quotation')).length,
    leads.filter((l) => (l.status || '').toLowerCase().includes('proposal')).length
  );

  const wonContracts = leads.filter((l) => l.status === 'Converted' || l.status === 'Won').length;
  const avgWinRate = totalLeadsHandled > 0 ? ((wonContracts / totalLeadsHandled) * 100).toFixed(1) : '100.0';
  const totalContractRevenue = leads
    .filter((l) => l.status === 'Converted' || l.status === 'Won')
    .reduce((sum, l) => sum + (l.value || 0), 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
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
              Live sales team conversion efficiency, acquisition velocity, and closed contract revenue breakdown.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search representative..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50"
            />
          </div>

          <button
            type="button"
            onClick={() => showToast('Exporting Live Lead Analytics Report to CSV...')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Analytics Report</span>
          </button>
        </div>
      </div>

      {/* 6 Summary Live KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Total Leads Handled</span>
          <p className="text-xl font-black text-slate-900 mt-1">{totalLeadsHandled}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Live CRM Pipeline</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600">Surveys Completed</span>
          <p className="text-xl font-black text-blue-600 mt-1">{surveysCompleted}</p>
          <span className="text-[10px] text-blue-600 font-semibold">On-site technical</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600">Proposals Sent</span>
          <p className="text-xl font-black text-indigo-600 mt-1">{proposalsSent}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Formal quotes</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600">Won Contracts</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{wonContracts}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Converted Deals</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600">Win Rate %</span>
          <p className="text-xl font-black text-purple-600 mt-1">{avgWinRate}%</p>
          <span className="text-[10px] text-purple-600 font-semibold">Conversion ratio</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700">Contract Revenue</span>
          <p className="text-xl font-black text-emerald-700 mt-1">
            AED {totalContractRevenue >= 1000 ? `${(totalContractRevenue / 1000).toFixed(0)}k` : totalContractRevenue.toLocaleString()}
          </p>
          <span className="text-[10px] text-emerald-700 font-semibold">Deal value won</span>
        </div>
      </div>

      {/* Sales Rep Conversion Performance Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Sales Representative Conversion Log</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 font-mono">{filteredReps.length} Reps</span>
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
              {filteredReps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No sales representative records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredReps.map((rep) => (
                  <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{rep.repName}</span>
                        <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {rep.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-700 font-mono">{rep.assignedLeads}</td>
                    <td className="py-3.5 px-3 text-center font-medium text-slate-700 font-mono">{rep.contactedRate}</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700 font-mono">{rep.siteSurveys}</td>
                    <td className="py-3.5 px-3 text-center font-semibold text-slate-700 font-mono">{rep.proposalsSent}</td>
                    <td className="py-3.5 px-3 text-center font-black text-emerald-700 font-mono">{rep.dealsWon}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-slate-900 font-mono">
                      AED {rep.revenue.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-mono">
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        {rep.conversionRate}
                      </span>
                    </td>
                  </tr>
                ))
              )}
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
