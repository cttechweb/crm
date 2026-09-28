'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  X,
  Users,
  Building2,
  CreditCard,
  Percent,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface CustomerGroupItem {
  id: string;
  name: string;
  industry: string;
  companiesCount: number;
  totalAnnualSpend: number;
  creditTerms: string;
  discountRate: number;
  priorityTier: 'Platinum' | 'Gold' | 'Silver' | 'Standard' | 'Tier 1 Enterprise' | 'Strategic Account';
  colorBadge: string;
}

const INITIAL_GROUPS: CustomerGroupItem[] = [];

function CustomerGroupsContent() {
  const [groups, setGroups] = useState<CustomerGroupItem[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_customer_groups_data');
      if (saved) {
        setGroups(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    creditTerms: 'Net 30 Days',
    discountRate: 10,
    priorityTier: 'Gold' as 'Tier 1 Enterprise' | 'Platinum' | 'Gold' | 'Strategic Account' | 'Standard',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newGroup: CustomerGroupItem = {
      id: `GRP-0${groups.length + 1}`,
      name: formData.name,
      industry: formData.industry || 'General Corporate Sector',
      companiesCount: 0,
      totalAnnualSpend: 0,
      creditTerms: formData.creditTerms,
      discountRate: Number(formData.discountRate),
      priorityTier: formData.priorityTier,
      colorBadge:
        formData.priorityTier === 'Platinum'
          ? 'bg-purple-100 text-purple-800 border-purple-200'
          : formData.priorityTier === 'Gold'
          ? 'bg-amber-100 text-amber-800 border-amber-200'
          : 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const updated = [...groups, newGroup];
    setGroups(updated);
    try {
      localStorage.setItem('crm_customer_groups_data', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      industry: '',
      creditTerms: 'Net 30 Days',
      discountRate: 10,
      priorityTier: 'Gold',
    });
    showToast(`Customer Group "${newGroup.name}" added successfully!`);
  };

  const deleteGroup = (id: string) => {
    const updated = groups.filter((g) => g.id !== id);
    setGroups(updated);
    try {
      localStorage.setItem('crm_customer_groups_data', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast('Customer group deleted');
  };

  const filtered = useMemo(() => {
    return groups.filter((g) => {
      return (
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.industry.toLowerCase().includes(search.toLowerCase()) ||
        g.priorityTier.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [groups, search]);

  const totalPortfolio = groups.reduce((sum, g) => sum + g.totalAnnualSpend, 0);
  const totalCompanies = groups.reduce((sum, g) => sum + g.companiesCount, 0);

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
                <FolderTree className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Groups &amp; Segments</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Categorize corporate accounts by industry, payment credit terms, customized discount schedules, and SLA priority tiers.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer Group</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Active Account Groups</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{groups.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Industry Segments</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Total Grouped Companies</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalCompanies}</p>
          <span className="text-[11px] font-semibold text-blue-600">Corporate Clients</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Total Portfolio Value</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">AED {(totalPortfolio / 1000000).toFixed(1)}M</p>
          <span className="text-[11px] font-semibold text-emerald-600">Annual Contract Sum</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Platinum Tier Clients</span>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {groups.filter((g) => g.priorityTier === 'Platinum').reduce((s, g) => s + g.companiesCount, 0)}
          </p>
          <span className="text-[11px] font-semibold text-purple-600">Top Priority SLAs</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search group name, industry, priority tier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Customer Groups Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Account Classification &amp; Group Matrix</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{filtered.length} Groups</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Group Name &amp; Industry</th>
                <th className="py-3 px-3 text-center">Tier</th>
                <th className="py-3 px-3 text-center">Companies</th>
                <th className="py-3 px-3 text-right">Annual Portfolio</th>
                <th className="py-3 px-3">Credit Terms</th>
                <th className="py-3 px-3 text-center">Standard Discount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{group.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{group.industry}</p>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', group.colorBadge)}>
                      {group.priorityTier}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-blue-700">
                    {group.companiesCount}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                    AED {group.totalAnnualSpend.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-700">
                    {group.creditTerms}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-purple-700">
                    {group.discountRate}%
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => showToast(`Editing Group ${group.name}`)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteGroup(group.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Add Customer Group */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add Customer Group</h2>
                <p className="text-xs text-slate-500">Configure new corporate category and terms</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Data Centers & Telecom Infrastructure"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Industry Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Cooling & Mission Critical Telecom"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Credit Terms</label>
                  <select
                    value={formData.creditTerms}
                    onChange={(e) => setFormData({ ...formData, creditTerms: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Net 30 Days">Net 30 Days</option>
                    <option value="Net 45 Days">Net 45 Days</option>
                    <option value="Net 60 Days">Net 60 Days</option>
                    <option value="Net 90 Days">Net 90 Days</option>
                    <option value="Pre-paid">Pre-paid (0 Days)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Standard Discount %</label>
                  <input
                    type="number"
                    value={formData.discountRate}
                    onChange={(e) => setFormData({ ...formData, discountRate: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority Tier</label>
                  <select
                    value={formData.priorityTier}
                    onChange={(e) => setFormData({ ...formData, priorityTier: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Platinum">Platinum (24/7 SLA)</option>
                    <option value="Gold">Gold (High Priority)</option>
                    <option value="Silver">Silver (Standard)</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerGroupsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customer Groups...</div>}>
      <CustomerGroupsContent />
    </Suspense>
  );
}
