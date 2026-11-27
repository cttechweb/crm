'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Building2,
  X,
  FileText,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { WorkerMaterialRequest } from '@/types/worker';

function WorkerMaterialsContent() {
  const searchParams = useSearchParams();
  const shouldOpenNew = searchParams.get('action') === 'new';

  const [requests, setRequests] = useState<WorkerMaterialRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(shouldOpenNew);

  // Form State
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [category, setCategory] = useState('Valves & Controls');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Pcs');
  const [urgency, setUrgency] = useState<'Standard' | 'Urgent' | 'Critical (Site Stopped)'>('Standard');
  const [taskNumber, setTaskNumber] = useState('TSK-8921');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setRequests(workerMockService.getMaterialRequests());
  }, []);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newReq = workerMockService.createMaterialRequest({
      itemName: itemName.trim(),
      itemCode: itemCode.trim() || `PRT-${Math.floor(1000 + Math.random() * 9000)}`,
      category,
      quantity: Number(quantity) || 1,
      unit,
      urgency,
      taskNumber: taskNumber.trim(),
      notes: notes.trim(),
    });

    setRequests(workerMockService.getMaterialRequests());
    setIsNewModalOpen(false);

    // Reset Form
    setItemName('');
    setItemCode('');
    setQuantity(1);
    setNotes('');
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    const matchesSearch =
      r.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.taskNumber && r.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5">
      {/* ── Filter & Search Bar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {['All', 'Pending Approval', 'Approved', 'Dispatched', 'Collected'].map((tab) => {
            const count =
              tab === 'All'
                ? requests.length
                : requests.filter((r) => r.status === tab).length;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  statusFilter === tab
                    ? 'bg-[#002B49] text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    statusFilter === tab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & New Button */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by part name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New Requisition</span>
          </button>
        </div>
      </div>

      {/* ── Material Requests Table ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
              <tr>
                <th className="py-3 px-4">Req #</th>
                <th className="py-3 px-4">Item &amp; Category</th>
                <th className="py-3 px-3 text-center">Part Code</th>
                <th className="py-3 px-3 text-center">Qty / Unit</th>
                <th className="py-3 px-3">Linked Task</th>
                <th className="py-3 px-3 text-center">Urgency</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4">Requested At / Approver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No material requests found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click &quot;+ New Requisition&quot; to request spare parts.</p>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{req.requestNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{req.itemName}</div>
                      <div className="text-[10px] text-slate-500">{req.category}</div>
                      {req.notes && <div className="text-[10px] text-slate-400 italic mt-0.5">{req.notes}</div>}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-600">{req.itemCode}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {req.quantity} {req.unit}
                    </td>
                    <td className="py-3 px-3">
                      {req.taskNumber ? (
                        <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[10px]">
                          {req.taskNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">General Van Stock</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          req.urgency.includes('Critical')
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : req.urgency === 'Urgent'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : req.status === 'Collected'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      <div>{req.requestedAt}</div>
                      {req.approvedBy && (
                        <div className="text-[10px] text-emerald-700 font-medium">By: {req.approvedBy}</div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── New Requisition Modal ── */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">New Spare Part / Material Requisition</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-6 h-6 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateRequest} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">
                  Item Description / Name <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Danfoss Expansion Valve 5 Ton / R-410A Refrigerant"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Part Code / SKU:</label>
                  <input
                    type="text"
                    placeholder="e.g. VAL-TXV-05"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Category:</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Valves & Controls">Valves &amp; Controls</option>
                    <option value="Refrigerants & Gases">Refrigerants &amp; Gases</option>
                    <option value="Filters">Filters</option>
                    <option value="Belts & Motors">Belts &amp; Motors</option>
                    <option value="Consumables">Consumables &amp; Oils</option>
                    <option value="Electrical Components">Electrical Components</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">
                    Quantity <span className="text-red-500">*</span>:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Unit:</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Kg">Kg</option>
                    <option value="Ltr">Ltr</option>
                    <option value="Meters">Meters</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Urgency Level:</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer"
                  >
                    <option value="Standard">Standard (Regular Stock)</option>
                    <option value="Urgent">Urgent (Needed Today)</option>
                    <option value="Critical (Site Stopped)">Critical (Site Stopped)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Related Task #:</label>
                  <input
                    type="text"
                    placeholder="e.g. TSK-8921"
                    value={taskNumber}
                    onChange={(e) => setTaskNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 block">Justification / Remarks:</label>
                <textarea
                  rows={2}
                  placeholder="Explain why this part is required on-site..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold cursor-pointer shadow-xs"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkerMaterialsPage() {
  return (
    <WorkerShell
      title="Material &amp; Spare Parts Requisitions"
      subtitle="Request parts and consumables from warehouse dispatch for on-site HVAC maintenance"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading requisitions...</div>}>
        <WorkerMaterialsContent />
      </Suspense>
    </WorkerShell>
  );
}
