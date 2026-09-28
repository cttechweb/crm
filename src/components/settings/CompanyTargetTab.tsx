'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export function CompanyTargetTab() {
  const companyTargets = [
    { period: 'Q1 2026', targetRevenue: 'AED 3,500,000', closedRevenue: 'AED 3,820,000', pct: 109, status: 'Achieved' },
    { period: 'Q2 2026', targetRevenue: 'AED 4,200,000', closedRevenue: 'AED 4,050,000', pct: 96, status: 'On Track' },
    { period: 'Q3 2026', targetRevenue: 'AED 4,800,000', closedRevenue: 'AED 4,620,000', pct: 96, status: 'In Progress' },
    { period: 'Q4 2026', targetRevenue: 'AED 5,500,000', closedRevenue: 'AED 1,200,000', pct: 22, status: 'Active' },
  ];

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Enterprise Revenue & Growth Targets</h3>
          <p className="text-xs text-slate-500">Define corporate quarterly targets, team quotas, and revenue thresholds.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Set Fiscal Target
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4">Target Revenue</th>
              <th className="py-3 px-4">Realized Revenue</th>
              <th className="py-3 px-4">Achievement Progress</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companyTargets.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{row.period}</td>
                <td className="py-3 px-4 font-semibold text-slate-800">{row.targetRevenue}</td>
                <td className="py-3 px-4 font-bold text-blue-600">{row.closedRevenue}</td>
                <td className="py-3 px-4">
                  <div className="w-36">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>{row.pct}%</span>
                      <span className={row.pct >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                        {row.pct >= 100 ? 'Exceeded' : 'Active'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.pct >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.min(row.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.pct >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                      }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
