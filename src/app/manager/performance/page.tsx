'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { TrendingUp, CheckSquare, Target, Award, BarChart3, Clock, ArrowUpRight } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';

const PERFORMANCE_DATA = [
  { tech: 'Tariq Mansour', taskSla: '98.2%', tasksDone: 38, leadConversion: '82%', avgResponse: '2.4 hrs', rating: '4.9/5.0' },
  { tech: 'Zayed Al Qasimi', taskSla: '96.5%', tasksDone: 44, leadConversion: '78%', avgResponse: '2.8 hrs', rating: '4.8/5.0' },
  { tech: 'Bilal Ahmed', taskSla: '91.0%', tasksDone: 32, leadConversion: '85%', avgResponse: '3.6 hrs', rating: '4.6/5.0' },
  { tech: 'Imran Shah', taskSla: '99.1%', tasksDone: 50, leadConversion: '70%', avgResponse: '1.9 hrs', rating: '4.9/5.0' },
  { tech: 'Hamza Farooq', taskSla: '94.0%', tasksDone: 28, leadConversion: '80%', avgResponse: '3.1 hrs', rating: '4.7/5.0' },
];

export default function ManagerPerformancePage() {
  const searchParams = useSearchParams();
  const metricParam = searchParams.get('metric') || 'tasks';

  return (
    <ManagerShell
      title="Team Performance Analytics"
      subtitle="Analyze task SLA turnaround, lead conversion efficiency, and technician scorecard metrics"
    >
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Team SLA</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">95.8%</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">+2.4% vs Last Month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jobs Closed (Sep)</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">192 Tasks</p>
          <p className="text-[11px] text-slate-400 mt-1">Target: 180 Tasks</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Lead Response</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">2.7 hrs</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Under 4.0 hr SLA</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Satisfaction</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">4.8 / 5.0</p>
          <p className="text-[11px] text-slate-400 mt-1">Based on 114 reviews</p>
        </div>
      </div>

      {/* Scorecard Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Technician &amp; Field Scorecards</h2>
            <p className="text-[11px] text-slate-500">Individual performance metrics for Q3 2026</p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Active Period: Sep 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-3 text-center">SLA Compliance</th>
                <th className="py-3 px-3 text-center">Tasks Completed</th>
                <th className="py-3 px-3 text-center">Lead Conversion</th>
                <th className="py-3 px-3 text-center">Avg Response Time</th>
                <th className="py-3 px-4 text-right">Customer Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PERFORMANCE_DATA.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{p.tech}</td>
                  <td className="py-3.5 px-3 text-center font-extrabold text-emerald-600">{p.taskSla}</td>
                  <td className="py-3.5 px-3 text-center font-semibold text-slate-800">{p.tasksDone} Jobs</td>
                  <td className="py-3.5 px-3 text-center font-bold text-blue-700">{p.leadConversion}</td>
                  <td className="py-3.5 px-3 text-center font-medium text-slate-600">{p.avgResponse}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ★ {p.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ManagerShell>
  );
}
