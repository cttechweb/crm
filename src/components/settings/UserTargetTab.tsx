'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Target, Award, TrendingUp, DollarSign, Users, X, Check, CheckCircle2 } from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface UserTargetRow {
  id?: string;
  name: string;
  role: string;
  deals: number;
  targetRev: number;
  closedRev: number;
  pct: number;
}

export function UserTargetTab() {
  const { users, leads, salesOpportunities } = useEnterpriseCrm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Default target list
  const [customTargets, setCustomTargets] = useState<UserTargetRow[]>([]);

  // Form State
  const [targetForm, setTargetForm] = useState({
    name: 'Manager',
    role: 'Commercial Sales Manager',
    targetDeals: 10,
    targetRev: 100000,
    period: 'Q1 - 2026',
  });

  const targets = useMemo(() => {
    // Generate targets from active CRM users
    const userMap = new Map<string, { role: string; targetDeals: number; targetRev: number }>();

    users.forEach((u) => {
      userMap.set(u.name, {
        role: u.role === 'Manager' ? 'Sales Manager' : u.role === 'Super Admin' ? 'Executive Director' : 'Sales Representative',
        targetDeals: u.role === 'Manager' ? 10 : 15,
        targetRev: u.role === 'Manager' ? 100000 : 120000,
      });
    });

    // Ensure Manager is included
    if (!userMap.has('Manager')) {
      userMap.set('Manager', {
        role: 'Sales Manager',
        targetDeals: 10,
        targetRev: 100000,
      });
    }

    const calculated: UserTargetRow[] = [];

    Array.from(userMap.entries()).forEach(([name, meta]) => {
      // Find custom overrides if any
      const custom = customTargets.find((c) => c.name.toLowerCase() === name.toLowerCase());
      const targetDeals = custom ? custom.deals : meta.targetDeals;
      const targetRev = custom ? custom.targetRev : meta.targetRev;

      // Calculate closed revenue from live leads and sales opportunities
      const userLeadsWon = leads.filter((l) => {
        const owner = (l.owner || l.assignedEmployee || l.createdBy || '').toLowerCase();
        const target = name.toLowerCase();
        return (owner === target || owner.includes(target) || target.includes(owner)) && (l.status === 'Converted' || l.status === 'Won');
      });

      const leadClosedRev = userLeadsWon.reduce((sum, l) => sum + (l.value || 0), 0);

      const userOppsWon = salesOpportunities.filter((opp) => {
        const owner = (opp.owner || '').toLowerCase();
        const target = name.toLowerCase();
        return (owner === target || owner.includes(target) || target.includes(owner)) && (opp.stage.toLowerCase().includes('won') || opp.stage.toLowerCase().includes('closed'));
      });

      const oppClosedRev = userOppsWon.reduce((sum, opp) => sum + (opp.amount || 0), 0);
      const closedRev = Math.max(leadClosedRev, oppClosedRev);
      const dealsCount = userLeadsWon.length;
      const pct = targetRev > 0 ? Math.round((closedRev / targetRev) * 100) : 0;

      calculated.push({
        name,
        role: meta.role,
        deals: targetDeals,
        targetRev,
        closedRev,
        pct,
      });
    });

    return calculated;
  }, [users, leads, salesOpportunities, customTargets]);

  const formatCurrency = (n: number) => `AED ${n.toLocaleString()}`;

  const totalTargetRevenue = targets.reduce((sum, t) => sum + t.targetRev, 0);
  const totalClosedRevenue = targets.reduce((sum, t) => sum + t.closedRev, 0);
  const overallAchievement = totalTargetRevenue > 0 ? Math.round((totalClosedRevenue / totalTargetRevenue) * 100) : 0;

  // Top performer
  const topPerformer = targets.length > 0 
    ? [...targets].sort((a, b) => b.pct - a.pct)[0] 
    : { name: 'Manager', pct: 100 };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarget: UserTargetRow = {
      name: targetForm.name,
      role: targetForm.role,
      deals: targetForm.targetDeals,
      targetRev: targetForm.targetRev,
      closedRev: 0,
      pct: 0,
    };

    setCustomTargets((prev) => [newTarget, ...prev.filter((p) => p.name !== targetForm.name)]);
    setIsModalOpen(false);
    setToastMsg(`Target quota for ${targetForm.name} successfully updated!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-5">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Team Target</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">{formatCurrency(totalTargetRevenue)}</p>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mt-1">
            <span>Fiscal Year 2026 Quota</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Closed Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-600">{formatCurrency(totalClosedRevenue)}</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{overallAchievement}% of Global Target</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Deals Target</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900">
            {targets.reduce((sum, t) => sum + t.deals, 0)} Deals
          </p>
          <div className="text-[11px] font-semibold text-purple-600 mt-1">
            <span>{targets.length} Active Executives</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Top Performer</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-base sm:text-lg font-black text-slate-900 truncate">{topPerformer.name}</p>
          <div className="text-[11px] font-bold text-amber-600 mt-1">
            <span>{topPerformer.pct}% Target Achieved 🔥</span>
          </div>
        </div>
      </div>

      {/* PERFORMANCE QUOTA TABLE CARD */}
      <Card className="border-slate-200 bg-white p-4 sm:p-5 space-y-4 shadow-2xs rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base text-slate-900">Executive Performance &amp; Revenue Quotas</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Track individual commercial HVAC consultant quotas, deal pipelines, and target achievements.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
            className="rounded-xl font-bold cursor-pointer"
          >
            Set New User Target
          </Button>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Sales Executive</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Target Deals</th>
                <th className="py-3 px-3">Target Revenue</th>
                <th className="py-3 px-3">Closed Revenue</th>
                <th className="py-3 px-3">Achievement Rate</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {targets.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
                      {row.name.charAt(0)}
                    </div>
                    <span>{row.name}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-600 font-medium">{row.role}</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{row.deals} Deals</td>
                  <td className="py-3.5 px-3 font-semibold text-slate-800">{formatCurrency(row.targetRev)}</td>
                  <td className="py-3.5 px-3 font-bold text-emerald-600">{formatCurrency(row.closedRev)}</td>
                  <td className="py-3.5 px-3">
                    <div className="w-36">
                      <div className="flex justify-between text-[10px] font-bold mb-1">
                        <span>{row.pct}%</span>
                        <span className={row.pct >= 100 ? 'text-emerald-600' : 'text-blue-600'}>
                          {row.pct >= 100 ? 'Achieved' : 'On Track'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            row.pct >= 100 ? 'bg-emerald-500' : 'bg-[#1677FF]'
                          }`}
                          style={{ width: `${Math.min(row.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        row.pct >= 100
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
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

      {/* MODAL: Set User Target */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Set Executive Target Quota</h2>
                <p className="text-xs text-slate-500">Configure revenue and deal targets for sales consultants</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTarget} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Sales Executive *</label>
                <select
                  value={targetForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const foundUser = targets.find((t) => t.name === name);
                    const role = foundUser ? foundUser.role : 'Sales Representative';
                    setTargetForm({ ...targetForm, name, role });
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {targets.map((t) => (
                    <option key={t.name} value={t.name}>
                      {t.name} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Deals</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={targetForm.targetDeals}
                    onChange={(e) => setTargetForm({ ...targetForm, targetDeals: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Revenue (AED)</label>
                  <input
                    type="number"
                    min="1000"
                    required
                    value={targetForm.targetRev}
                    onChange={(e) => setTargetForm({ ...targetForm, targetRev: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Period</label>
                <select
                  value={targetForm.period}
                  onChange={(e) => setTargetForm({ ...targetForm, period: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Q1 - 2026">Q1 2026 (Jan - Mar)</option>
                  <option value="Q2 - 2026">Q2 2026 (Apr - Jun)</option>
                  <option value="Q3 - 2026">Q3 2026 (Jul - Sep)</option>
                  <option value="Q4 - 2026">Q4 2026 (Oct - Dec)</option>
                  <option value="Annual 2026">Annual 2026 Full Quota</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
