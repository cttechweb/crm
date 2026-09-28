'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  Plus,
  Search,
  Download,
  Trash2,
  Building2,
  Phone,
  Mail,
  User,
  ExternalLink,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FolderTree,
  Activity,
  Clock,
  BarChart3,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, cn } from '@/lib/utils';

function CustomersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect legacy query parameters to dedicated sub-pages
  useEffect(() => {
    const view = searchParams.get('view');
    const tab = searchParams.get('tab');

    if (view === 'contacts' || tab === 'contacts') {
      router.replace('/customers/contacts');
    } else if (view === 'groups' || tab === 'groups') {
      router.replace('/customers/groups');
    } else if (view === 'activities' || tab === 'activities') {
      router.replace('/customers/activities');
    } else if (view === 'followups' || tab === 'followups') {
      router.replace('/customers/followups');
    } else if (view === 'reports' || tab === 'reports' || tab === 'customers') {
      router.replace('/customers/reports');
    }
  }, [searchParams, router]);

  const { customers, addCustomer, deleteCustomer, globalSearch } = useEnterpriseCrm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    contactPerson: '',
    phone: '',
    email: '',
    owner: 'Alex Rivera',
    status: 'Active' as 'Active' | 'Inactive' | 'Prospect',
    lastActivity: 'Just added',
    companyGroup: 'Enterprise Key Accounts',
    totalDeals: 1,
    totalSpend: 50000,
  });

  const query = search || globalSearch;

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.customerName.toLowerCase().includes(query.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase()) ||
      c.companyGroup.toLowerCase().includes(query.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName) return;

    addCustomer(formData);
    setIsAddModalOpen(false);
    setFormData({
      customerName: '',
      contactPerson: '',
      phone: '',
      email: '',
      owner: 'Alex Rivera',
      status: 'Active',
      lastActivity: 'Just added',
      companyGroup: 'Enterprise Key Accounts',
      totalDeals: 1,
      totalSpend: 50000,
    });
  };

  const totalSpendSum = customers.reduce((sum, c) => sum + (c.totalSpend || 0), 0);
  const activeCount = customers.filter((c) => c.status === 'Active').length;
  const prospectCount = customers.filter((c) => c.status === 'Prospect').length;

  return (
    <div className="space-y-4 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Shield className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer &amp; Account Directory</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage corporate customer accounts, primary stakeholders, and total lifetime contract value.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Customer Accounts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{customers.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Verified Corporate CRM</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Active Retainer Accounts</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</p>
          <span className="text-[11px] font-semibold text-emerald-600">Under Active Service / AMC</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Total Portfolio Value</span>
          <p className="text-2xl font-black text-blue-600 mt-1">AED {(totalSpendSum / 1000000).toFixed(2)}M</p>
          <span className="text-[11px] font-semibold text-blue-600">Cumulative Spend</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Prospect Accounts</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{prospectCount}</p>
          <span className="text-[11px] font-semibold text-purple-600">Contract Negotiation</span>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 bg-white border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search customers, contacts, groups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Prospect">Prospect</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-slate-500">
            Showing <b className="text-blue-600">{filteredCustomers.length}</b> verified accounts
          </span>
        </div>
      </Card>

      {/* Mobile Card List View (Phones & Small screens < md) */}
      <div className="block md:hidden space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
            No customers found matching your criteria.
          </div>
        ) : (
          filteredCustomers.map((cust, idx) => (
            <div
              key={cust.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3"
            >
              {/* Card Top: Number, Name, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {cust.customerName}
                    </h3>
                    <p className="text-[11px] text-slate-500">{cust.companyGroup}</p>
                  </div>
                </div>
                <StatusBadge status={cust.status} />
              </div>

              {/* Contact details */}
              <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{cust.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${cust.phone}`} className="text-blue-600 hover:underline">
                    {cust.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${cust.email}`} className="text-blue-600 hover:underline truncate">
                    {cust.email}
                  </a>
                </div>
              </div>

              {/* Spend & Owner info */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Spend</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(cust.totalSpend)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Owner</span>
                  <span className="font-medium text-slate-700">{cust.owner}</span>
                </div>
              </div>

              {/* Footer: Activity & Delete */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>Last active: {cust.lastActivity}</span>
                <button
                  onClick={() => deleteCustomer(cust.id)}
                  className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium py-1 px-2 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Customers Table (md and up) */}
      <Card className="hidden md:block overflow-hidden border-slate-200 bg-white rounded-2xl shadow-2xs">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[900px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 w-12 text-center">SL No</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3">Last Activity</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-xs text-slate-500">
                    No customers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 text-center font-semibold text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{cust.customerName}</p>
                      <p className="text-[10px] text-slate-400">{cust.companyGroup}</p>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {cust.contactPerson}
                    </td>

                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {cust.phone}
                    </td>

                    <td className="py-3 px-4 text-blue-600 font-medium">
                      {cust.email}
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-700">
                      {cust.owner}
                    </td>

                    <td className="py-3 px-3">
                      <StatusBadge status={cust.status} />
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(cust.totalSpend)}
                    </td>

                    <td className="py-3 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                      {cust.lastActivity}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Customer"
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
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Enterprise Customer"
        description="Add a verified account to the corporate customer registry."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-3.5 text-xs">
          <Input
            label="Customer / Corporate Name"
            required
            placeholder="e.g. Acme Corporation"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Primary Contact Person"
              required
              placeholder="e.g. Sarah Jenkins (VP Eng)"
              value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
            />
            <Input
              label="Company Industry / Group"
              placeholder="e.g. Healthcare Technology"
              value={formData.companyGroup}
              onChange={(e) => setFormData({ ...formData, companyGroup: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Email Address"
              type="email"
              placeholder="contact@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Account Owner"
              value={formData.owner}
              onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
              options={[
                { label: 'Alex Rivera', value: 'Alex Rivera' },
                { label: 'Elena Rostova', value: 'Elena Rostova' },
                { label: 'Jordan Hayes', value: 'Jordan Hayes' },
                { label: 'Super Admin', value: 'Super Admin' },
              ]}
            />
            <Select
              label="Account Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Prospect', value: 'Prospect' },
                { label: 'Inactive', value: 'Inactive' },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Customers...</div>}>
      <CustomersContent />
    </Suspense>
  );
}
