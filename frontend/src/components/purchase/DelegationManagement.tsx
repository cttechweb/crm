'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Calendar,
  User,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import { CrmApproverDelegation } from '@/types/enterprise-crm';
import { delegationsApiService } from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface DelegationManagementProps {
  currentUser: MockAuthUser | null;
}

export function DelegationManagement({ currentUser }: DelegationManagementProps) {
  const [delegations, setDelegations] = useState<CrmApproverDelegation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formTier, setFormTier] = useState<'FINANCE_CONTROLLER' | 'CHIEF_OPERATING_OFFICER'>('FINANCE_CONTROLLER');
  const [formDelegateId, setFormDelegateId] = useState('');
  const [formDelegateName, setFormDelegateName] = useState('');
  const [formDelegateDesignation, setFormDelegateDesignation] = useState('Senior Finance Officer');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formReason, setFormReason] = useState('');

  const loadDelegations = async () => {
    try {
      setLoading(true);
      const res = await delegationsApiService.getDelegations({ active: false });
      if (res.success) {
        setDelegations(res.delegations);
      }
    } catch (err: any) {
      console.error('Failed to load delegations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDelegations();
  }, []);

  const handleOpenCreate = () => {
    setFormTier('FINANCE_CONTROLLER');
    setFormDelegateId('');
    setFormDelegateName('');
    setFormDelegateDesignation('Senior Finance Officer');
    const today = new Date().toISOString().split('T')[0];
    setFormStartDate(today);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setFormEndDate(nextWeek.toISOString().split('T')[0]);
    setFormReason('');
    setIsModalOpen(true);
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDelegateName.trim()) {
      alert('Delegate name is required.');
      return;
    }
    if (!formStartDate || !formEndDate) {
      alert('Start date and end date are required.');
      return;
    }
    if (new Date(formStartDate) > new Date(formEndDate)) {
      alert('Start date cannot be after end date.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: Partial<CrmApproverDelegation> = {
        approvalTier: formTier,
        delegateId: formDelegateId.trim() || `usr_del_${Date.now()}`,
        delegateName: formDelegateName.trim(),
        delegateDesignation: formDelegateDesignation.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        reason: formReason.trim() || undefined,
      };

      const res = await delegationsApiService.createDelegation(payload);
      if (res.success) {
        setIsModalOpen(false);
        await loadDelegations();
        alert('Approver authority delegated successfully.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to create delegation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this delegation immediately?')) return;
    try {
      await delegationsApiService.deactivateDelegation(id);
      await loadDelegations();
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke delegation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Executive Approver Delegations</h2>
            <p className="text-xs text-slate-500">
              Formal temporary delegation of executive sign-off authority for Finance Controller and Chief Operating Officer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDelegations}
            className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Approver Delegation
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            Loading delegations...
          </div>
        ) : delegations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShieldCheck className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700">No Approver Delegations Found</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Executives can delegate PO approval authority during leaves or travel by creating a delegation above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                  <th className="py-3 px-4">Delegator (Executive)</th>
                  <th className="py-3 px-4">Delegate (Designee)</th>
                  <th className="py-3 px-4">Approval Tier</th>
                  <th className="py-3 px-4">Effective Dates</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {delegations.map((d) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  const isCurrent = d.isActive && d.startDate <= todayStr && d.endDate >= todayStr;
                  return (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{d.delegatorName}</div>
                        <div className="text-[10px] text-slate-400">{d.delegatorDesignation}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-indigo-600">{d.delegateName}</div>
                        <div className="text-[10px] text-slate-400">{d.delegateDesignation || 'Designee'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.approvalTier === 'CHIEF_OPERATING_OFFICER'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {d.approvalTier === 'CHIEF_OPERATING_OFFICER' ? 'COO Tier (≥ 100k)' : 'FC Tier (< 100k)'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {d.startDate} to {d.endDate}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs">{d.reason || 'General executive coverage'}</td>
                      <td className="py-3 px-4">
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Active Now
                          </span>
                        ) : d.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" /> Scheduled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            <XCircle className="w-3 h-3" /> Inactive / Revoked
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {d.isActive && (
                          <button
                            onClick={() => handleDeactivate(d.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Delegation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Delegate Executive Authority</h3>
                <p className="text-xs text-slate-500">Authorize a designee to approve Purchase Orders</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDelegation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Approval Authority Tier <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTier}
                  onChange={(e) => setFormTier(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-medium"
                >
                  <option value="FINANCE_CONTROLLER">Finance Controller (&lt; AED 100,000)</option>
                  <option value="CHIEF_OPERATING_OFFICER">Chief Operating Officer (≥ AED 100,000)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Delegate Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Salim Al-Nuaimi"
                  value={formDelegateName}
                  onChange={(e) => setFormDelegateName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delegate Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Finance Analyst / Procurement Lead"
                  value={formDelegateDesignation}
                  onChange={(e) => setFormDelegateDesignation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Start Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    End Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Business Reason for Delegation</label>
                <textarea
                  placeholder="e.g. Executive annual leave coverage; delegator will resume sign-off upon return."
                  value={formReason}
                  onChange={(e) => setFormReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                >
                  {submitting ? 'Creating...' : 'Authorize Delegation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
