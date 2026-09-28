'use client';

import React, { useState } from 'react';
import { Building2, Search, Plus, Filter, Phone, Mail, MapPin, CheckCircle2, ChevronRight, X, Trash2 } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

export default function ManagerCustomersPage() {
  const { customers, addCustomer, deleteCustomer } = useEnterpriseCrm();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    companyName: '',
    contactPerson: '',
    phone: '+971 50 ',
    email: '',
    city: 'Abu Dhabi',
    category: 'Commercial Facility',
    contractStatus: 'Active AMC',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName) return;

    addCustomer({
      customerName: form.customerName,
      companyName: form.companyName || form.customerName,
      contactPerson: form.contactPerson || 'Facility Manager',
      phone: form.phone,
      email: form.email,
      owner: 'Alex Rivera (Operations Manager)',
      status: 'Active',
      lastActivity: 'Customer onboarded',
      companyGroup: form.category,
      totalDeals: 1,
      totalSpend: 0,
      category: form.category,
      city: form.city,
      contractStatus: form.contractStatus,
      activeJobsCount: 1,
      assignedEquipmentCount: 4,
    });

    setIsAddModalOpen(false);
    showToast(`Customer "${form.customerName}" added successfully!`);
    setForm({
      customerName: '',
      companyName: '',
      contactPerson: '',
      phone: '+971 50 ',
      email: '',
      city: 'Abu Dhabi',
      category: 'Commercial Facility',
      contractStatus: 'Active AMC',
    });
  };

  const filtered = customers.filter((c) => {
    const name = c.customerName || c.companyName || '';
    const contact = c.contactPerson || '';
    const zone = c.city || c.address || '';
    const matchSearch =
      name.toLowerCase().includes(search.toLowerCase()) ||
      contact.toLowerCase().includes(search.toLowerCase()) ||
      zone.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <ManagerShell
      title="Customer Operations"
      subtitle="Manage corporate client facilities, service agreements, and equipment maintenance history"
    >
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search by client, contact, or zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Prospect">Prospect</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Customer</span>
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Client / Facility</th>
                <th className="py-3 px-3">Primary Contact</th>
                <th className="py-3 px-3">Location / Zone</th>
                <th className="py-3 px-3">Contract Agreement</th>
                <th className="py-3 px-3 text-center">Active Units</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No customer records found. Click <strong>+ Add Customer</strong> to add.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{c.customerName || c.companyName}</p>
                      <p className="text-[11px] text-slate-400">{c.id}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-slate-800 font-medium">{c.contactPerson}</p>
                      <p className="text-[11px] text-slate-400">{c.phone}</p>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {c.city || 'Abu Dhabi'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-semibold text-slate-800">{c.contractStatus || 'Comprehensive AMC'}</span>
                      <p className="text-[11px] text-slate-400">Owner: {c.owner}</p>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-blue-600">
                      {c.assignedEquipmentCount || 4} Units
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          c.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => deleteCustomer(c.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer / Facility Name *</label>
                <input
                  type="text"
                  required
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  placeholder="e.g. Lumina Health Systems LLC"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="Dr. Tariq Al Nuaimi"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="contact@company.ae"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                    placeholder="Abu Dhabi"
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ManagerShell>
  );
}
