'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Contact,
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
  Phone,
  Mail,
  Building,
  UserCheck,
  Check,
  Shield,
  MessageCircle,
  ExternalLink,
  Briefcase,
  Star,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface ContactItem {
  id: string;
  name: string;
  designation: string;
  company: string;
  companyGroup: string;
  phone: string;
  email: string;
  whatsapp: string;
  isPrimary: boolean;
  assignedRep: string;
  department: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_CONTACTS: ContactItem[] = [];

function ContactsContent() {
  const [contacts, setContacts] = useState<ContactItem[]>(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState<ContactItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    company: 'Al Futtaim Engineering',
    companyGroup: 'Enterprise Key Accounts',
    phone: '+971 50 ',
    email: '',
    whatsapp: '',
    department: 'Engineering & Maintenance',
    isPrimary: false,
    assignedRep: 'Mohammed Rashid',
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company) return;

    const newContact: ContactItem = {
      id: `CNT-0${contacts.length + 1}`,
      name: formData.name,
      designation: formData.designation || 'Account Contact',
      company: formData.company,
      companyGroup: formData.companyGroup,
      phone: formData.phone,
      email: formData.email,
      whatsapp: formData.whatsapp || formData.phone.replace(/[^0-9+]/g, ''),
      isPrimary: formData.isPrimary,
      assignedRep: formData.assignedRep,
      department: formData.department,
      status: 'Active',
    };

    setContacts([newContact, ...contacts]);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      designation: '',
      company: 'Al Futtaim Engineering',
      companyGroup: 'Enterprise Key Accounts',
      phone: '+971 50 ',
      email: '',
      whatsapp: '',
      department: 'Engineering & Maintenance',
      isPrimary: false,
      assignedRep: 'Mohammed Rashid',
    });
    showToast(`Contact "${newContact.name}" added successfully!`);
  };

  const togglePrimary = (id: string) => {
    setContacts((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const next = !c.isPrimary;
          showToast(`${c.name} is ${next ? 'now Primary Contact' : 'no longer Primary'}`);
          return { ...c, isPrimary: next };
        }
        return c;
      })
    );
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
    showToast('Contact removed');
  };

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.company.toLowerCase().includes(search.toLowerCase()) ||
        c.designation.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search);

      const matchDept = departmentFilter === 'All' || c.department === departmentFilter;

      return matchSearch && matchDept;
    });
  }, [contacts, search, departmentFilter]);

  const totalPrimary = contacts.filter((c) => c.isPrimary).length;
  const totalVerifiedPhone = contacts.filter((c) => c.phone.length > 5).length;

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
                <Contact className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Customer Contacts Directory</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Manage executive stakeholders, MEP engineers, facility directors, and procurement managers across customer accounts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Contact</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Account Contacts</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{contacts.length}</p>
          <span className="text-[11px] font-semibold text-slate-400">Stakeholder Directory</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Primary Decision Makers</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{totalPrimary}</p>
          <span className="text-[11px] font-semibold text-blue-600">Authorized Signatories</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Verified Direct Mobile</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalVerifiedPhone}</p>
          <span className="text-[11px] font-semibold text-emerald-600">WhatsApp Enabled</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Corporate Accounts</span>
          <p className="text-2xl font-black text-purple-600 mt-1">
            {new Set(contacts.map((c) => c.company)).size}
          </p>
          <span className="text-[11px] font-semibold text-purple-600">Represented Organizations</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none shadow-2xs min-w-[170px] cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Engineering & Maintenance">Engineering &amp; MEP</option>
              <option value="Procurement">Procurement &amp; Contracts</option>
              <option value="Facility Management">Facility Management</option>
              <option value="Operations">Operations &amp; Hospitality</option>
              <option value="Plant Operations">Plant Operations</option>
            </select>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search contact name, company, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Contact className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Registered Customer Contacts</h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">{filtered.length} Contacts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-3">Company &amp; Group</th>
                <th className="py-3 px-3">Department</th>
                <th className="py-3 px-3">Phone &amp; WhatsApp</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3 text-center">Primary</th>
                <th className="py-3 px-3">Account Rep</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-slate-900 font-bold">{item.name}</p>
                        <p className="text-[11px] text-slate-400 font-normal">{item.designation}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-slate-800">
                    <p>{item.company}</p>
                    <span className="text-[10px] text-slate-400 font-normal">{item.companyGroup}</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                      {item.department}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <a
                      href={`tel:${item.phone}`}
                      className="text-emerald-700 font-mono font-semibold hover:underline block"
                    >
                      {item.phone}
                    </a>
                  </td>

                  <td className="py-3.5 px-3">
                    <a
                      href={`mailto:${item.email}`}
                      className="text-blue-600 hover:underline truncate max-w-[180px] block"
                    >
                      {item.email}
                    </a>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => togglePrimary(item.id)}
                      className={cn(
                        'p-1 rounded-full transition-colors cursor-pointer',
                        item.isPrimary ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-slate-500'
                      )}
                      title={item.isPrimary ? 'Primary Contact' : 'Set as Primary'}
                    >
                      <Star className={cn('w-4 h-4', item.isPrimary && 'fill-amber-500')} />
                    </button>
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-700">{item.assignedRep}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setViewingContact(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteContact(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Contact"
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

      {/* MODAL 1: Add Contact */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Add Customer Contact</h2>
                <p className="text-xs text-slate-500">Register new key stakeholder for customer account</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eng. Tariq Al-Hashimi"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Head of Facilities"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corporate Account *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Al Futtaim Engineering"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  >
                    <option value="Engineering & Maintenance">Engineering &amp; MEP</option>
                    <option value="Procurement">Procurement &amp; Contracts</option>
                    <option value="Facility Management">Facility Management</option>
                    <option value="Operations">Operations &amp; Hospitality</option>
                    <option value="Plant Operations">Plant Operations</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Direct Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="primaryContactCheck"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="primaryContactCheck" className="font-bold text-slate-800 cursor-pointer">
                  Mark as Primary Account Contact / Authorized Signatory
                </label>
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
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Contact */}
      {viewingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">{viewingContact.name}</h2>
                <p className="text-xs text-slate-500">{viewingContact.designation} • {viewingContact.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingContact(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-200">
                <p><strong>Department:</strong> {viewingContact.department}</p>
                <p><strong>Phone:</strong> {viewingContact.phone}</p>
                <p><strong>Email:</strong> {viewingContact.email}</p>
                <p><strong>Assigned Account Manager:</strong> {viewingContact.assignedRep}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingContact(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContactsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Contacts Directory...</div>}>
      <ContactsContent />
    </Suspense>
  );
}
