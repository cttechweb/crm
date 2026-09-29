'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Target, Award } from 'lucide-react';

export function UserTargetTab() {
  const [usersList, setUsersList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('cezcon_crm_users_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsersList(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const formatCurrency = (n: number) => `$${n.toLocaleString()}`;

  const rows = usersList.length > 0
    ? usersList.map((u, idx) => ({
        name: u.name,
        role: u.designation || u.role || 'Sales Executive',
        deals: 15 + (idx % 5) * 3,
        targetRev: 120000 + (idx % 4) * 25000,
        closedRev: 110000 + (idx % 3) * 20000,
        pct: Math.round(((110000 + (idx % 3) * 20000) / (120000 + (idx % 4) * 25000)) * 100),
      }))
    : [
        { name: 'Senior Sales Representative', role: 'Sales Executive', deals: 15, targetRev: 120000, closedRev: 110000, pct: 92 },
      ];

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">User Performance & Revenue Targets</h3>
          <p className="text-xs text-slate-500">Track individual executive quotas and monthly target achievement.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Set New User Target
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Sales Executive</th>
              <th className="py-3 px-3">Role</th>
              <th className="py-3 px-3">Target Deals</th>
              <th className="py-3 px-3">Target Revenue</th>
              <th className="py-3 px-3">Closed Revenue</th>
              <th className="py-3 px-3">Achievement</th>
              <th className="py-3 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{row.name}</td>
                <td className="py-3 px-3 text-slate-600">{row.role}</td>
                <td className="py-3 px-3 font-semibold">{row.deals} Deals</td>
                <td className="py-3 px-3 font-semibold text-slate-800">{formatCurrency(row.targetRev)}</td>
                <td className="py-3 px-3 font-bold text-blue-600">{formatCurrency(row.closedRev)}</td>
                <td className="py-3 px-3">
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span>{row.pct}%</span>
                      <span className={row.pct >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                        {row.pct >= 100 ? 'Achieved' : 'On Track'}
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
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.pct >= 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                    }`}
                  >
                    {row.pct >= 100 ? 'Exceeded' : 'In Progress'}
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
