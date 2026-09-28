'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  FileText,
  Receipt,
  Layers,
  ChevronRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { DealStage } from '@/types/enterprise-crm';

function ManagerSalesContent() {
  const searchParams = useSearchParams();
  const { salesOpportunities, addOpportunity } = useEnterpriseCrm();
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    customer: '',
    amount: 150000,
    stage: 'Opportunity' as DealStage,
    probability: 60,
    owner: 'Alex Rivera (Operations Manager)',
    expectedClose: '2026-10-15',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.customer) return;

    addOpportunity({
      title: form.title,
      customer: form.customer,
      amount: Number(form.amount),
      stage: form.stage,
      probability: Number(form.probability),
      owner: form.owner,
      expectedClose: form.expectedClose,
      createdBy: 'Alex Rivera (Operations Manager)',
      opportunityDate: new Date().toISOString().split('T')[0],
      opportunityAssigned: form.owner,
      lastActivity: 'Opportunity Created',
    });

    setIsAddModalOpen(false);
    showToast(`Opportunity "${form.title}" created successfully!`);
    setForm({
      title: '',
      customer: '',
      amount: 150000,
      stage: 'Opportunity',
      probability: 60,
      owner: 'Alex Rivera (Operations Manager)',
      expectedClose: '2026-10-15',
    });
  };

  const totalPipeline = salesOpportunities.reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalWon = salesOpportunities.filter((d) => d.stage === 'Won' || d.stage === 'Order').reduce((acc, d) => acc + (d.amount || 0), 0);

  const filtered = salesOpportunities.filter((d) => {
    const title = d.title || '';
    const cust = d.customer || '';
    const owner = d.owner || '';
    return (
      title.toLowerCase().includes(search.toLowerCase()) ||
      cust.toLowerCase().includes(search.toLowerCase()) ||
      owner.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <ManagerShell
      title="Commercial & Sales Operations"
      subtitle="Track active opportunities, pipeline velocity, quotations, and contract orders"
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pipeline Value</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">AED {totalPipeline.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">{salesOpportunities.length} Opportunities</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Won Revenue</p>
          <p className="text-2xl font-extrabold text-blue-600 mt-1">AED {totalWon.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {salesOpportunities.filter((d) => d.stage === 'Won' || d.stage === 'Order').length} Closed Deals
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deals</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{salesOpportunities.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Real-time Pipeline</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search deals, clients, or reps..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Opportunity</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Deal / Opportunity</th>
                <th className="py-3 px-3">Client Facility</th>
                <th className="py-3 px-3 text-right">Deal Value</th>
                <th className="py-3 px-3">Stage</th>
                <th className="py-3 px-3 text-center">Probability</th>
                <th className="py-3 px-3">Lead Owner</th>
                <th className="py-3 px-3">Target Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No sales opportunities found. Click <strong>+ New Opportunity</strong> to add.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{d.title}</p>
                      <p className="text-[11px] text-slate-400">{d.opportunityCode || d.id}</p>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-800">{d.customer}</td>
                    <td className="py-3.5 px-3 text-right font-extrabold text-blue-700">
                      AED {(d.amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          d.stage === 'Won' || d.stage === 'Order'
                            ? 'bg-emerald-100 text-emerald-800'
                            : d.stage === 'Under Approval' || d.stage === 'On Review'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {d.stage}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-slate-700">{d.probability}%</td>
                    <td className="py-3.5 px-3 text-slate-700">{d.owner}</td>
                    <td className="py-3.5 px-3 font-semibold text-slate-600">{d.expectedClose || 'TBD'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Opportunity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Opportunity</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOpportunity} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Opportunity Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  placeholder="e.g. Al Ain Hospital Central Chiller Replacement"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Client *</label>
                  <input
                    type="text"
                    required
                    value={form.customer}
                    onChange={(e) => setForm({ ...form, customer: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="Client Facility Name"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deal Value (AED) *</label>
                  <input
                    type="number"
                    required
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stage</label>
                  <select
                    value={form.stage}
                    onChange={(e) => setForm({ ...form, stage: e.target.value as DealStage })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  >
                    <option value="Opportunity">Opportunity</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Offer Sent">Offer Sent</option>
                    <option value="On Review">On Review</option>
                    <option value="Order">Order</option>
                    <option value="Won">Won</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Close Date</label>
                  <input
                    type="date"
                    value={form.expectedClose}
                    onChange={(e) => setForm({ ...form, expectedClose: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Save Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}

export default function ManagerSalesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Sales module...</div>}>
      <ManagerSalesContent />
    </Suspense>
  );
}
