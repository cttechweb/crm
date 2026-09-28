'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Search,
  Layers,
  Percent,
  Clock,
  Trash2,
  Edit2,
  Check,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface OpportunityTypeItem {
  id: number | string;
  name: string;
  leadTime: string;
  defaultMargin: string;
  status: string;
}

const INITIAL_OPP_TYPES: OpportunityTypeItem[] = [
  { id: 1, name: 'HVAC Maintenance & Retrofit', leadTime: '14 Days', defaultMargin: '25%', status: 'Active' },
  { id: 2, name: 'MEP Infrastructure Projects', leadTime: '30 Days', defaultMargin: '20%', status: 'Active' },
  { id: 3, name: 'Chiller Plant Overhauling', leadTime: '21 Days', defaultMargin: '28%', status: 'Active' },
  { id: 4, name: 'Annual Maintenance Contract (AMC)', leadTime: '7 Days', defaultMargin: '35%', status: 'Active' },
  { id: 5, name: 'Emergency Breakdown Repair', leadTime: '24 Hours', defaultMargin: '40%', status: 'Active' },
  { id: 6, name: 'Building Management System (BMS)', leadTime: '45 Days', defaultMargin: '22%', status: 'Active' },
];

export function OpportunitySettingsTab() {
  const [typesList, setTypesList] = useState<OpportunityTypeItem[]>(INITIAL_OPP_TYPES);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OpportunityTypeItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    leadTime: '14 Days',
    defaultMargin: '25%',
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crm_opp_business_types');
      if (saved) {
        setTypesList(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newItem: OpportunityTypeItem = {
      id: Date.now(),
      name: formData.name.trim(),
      leadTime: formData.leadTime,
      defaultMargin: formData.defaultMargin,
      status: 'Active',
    };

    const updated = [newItem, ...typesList];
    setTypesList(updated);
    try {
      localStorage.setItem('crm_opp_business_types', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setFormData({ name: '', leadTime: '14 Days', defaultMargin: '25%' });
    setIsAddModalOpen(false);
    showToast(`Business line "${newItem.name}" added successfully!`);
  };

  const handleUpdateType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = typesList.map((t) => (t.id === editingItem.id ? editingItem : t));
    setTypesList(updated);
    try {
      localStorage.setItem('crm_opp_business_types', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }

    setEditingItem(null);
    showToast('Business line updated successfully!');
  };

  const handleDeleteType = (id: number | string) => {
    const updated = typesList.filter((t) => t.id !== id);
    setTypesList(updated);
    try {
      localStorage.setItem('crm_opp_business_types', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
    showToast('Business line removed');
  };

  const filtered = useMemo(() => {
    return typesList.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));
  }, [typesList, search]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/70 to-indigo-50/50 border border-blue-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-900">Commercial Business Lines</span>
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{typesList.length}</div>
          <span className="text-[11px] font-medium text-slate-500">Configured sectors</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900">Avg Target Margin</span>
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">28.3%</div>
          <span className="text-[11px] font-medium text-slate-500">Gross profitability target</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50/70 to-violet-50/50 border border-purple-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900">Standard Delivery SLA</span>
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">14 - 30 Days</div>
          <span className="text-[11px] font-medium text-slate-500">Standard turnkey lead time</span>
        </div>
      </div>

      <Card className="border-slate-200 bg-white p-5 space-y-4 shadow-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Business Opportunity Categories & Scope
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure lines of business, turnkey project models, and baseline profit margins.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search business line..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-56"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Business Line
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Opportunity Type / Scope</th>
                <th className="py-3 px-4">Standard Delivery SLA</th>
                <th className="py-3 px-4">Target Gross Margin</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                    No business lines found. Click &quot;Add Business Line&quot; to configure one.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-bold text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {item.leadTime}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-600">{item.defaultMargin}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Edit Line"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteType(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Line"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL: Add */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Business Opportunity Category"
          description="Define new line of commercial business and target profitability."
          icon={<Layers className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleAddType} className="space-y-4 text-xs">
            <Input
              label="Opportunity Scope / Title *"
              required
              placeholder="e.g. Commercial Cold Room Turnkey Construction"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Delivery SLA *"
                required
                placeholder="e.g. 21 Days"
                value={formData.leadTime}
                onChange={(e) => setFormData({ ...formData, leadTime: e.target.value })}
              />
              <Input
                label="Target Margin *"
                required
                placeholder="e.g. 25%"
                value={formData.defaultMargin}
                onChange={(e) => setFormData({ ...formData, defaultMargin: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
                Save Category
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL: Edit */}
      {editingItem && (
        <Modal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          title="Edit Business Opportunity Category"
          description={`Update parameters for ${editingItem.name}`}
          icon={<Edit2 className="w-5 h-5 text-blue-600" />}
        >
          <form onSubmit={handleUpdateType} className="space-y-4 text-xs">
            <Input
              label="Opportunity Scope / Title *"
              required
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Delivery SLA *"
                required
                value={editingItem.leadTime}
                onChange={(e) => setEditingItem({ ...editingItem, leadTime: e.target.value })}
              />
              <Input
                label="Target Margin *"
                required
                value={editingItem.defaultMargin}
                onChange={(e) => setEditingItem({ ...editingItem, defaultMargin: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<Check className="w-4 h-4" />}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
