'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Plus, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CezconLostReason } from '@/types/settings';
import { CEZCON_LOST_REASONS_DATA } from '@/data/settingsMockData';

export function OpportunityLostReasonTab() {
  const [lostReasonsList, setLostReasonsList] = useState<CezconLostReason[]>(CEZCON_LOST_REASONS_DATA);
  const [isAddLostReasonModalOpen, setIsAddLostReasonModalOpen] = useState(false);
  const [lostReasonRowsPerPage, setLostReasonRowsPerPage] = useState(10);
  const [lostReasonCurrentPage, setLostReasonCurrentPage] = useState(1);
  const [lostReasonSearch, setLostReasonSearch] = useState('');
  const [newLostReasonText, setNewLostReasonText] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredLostReasons = lostReasonsList.filter((lr) =>
    lr.reason.toLowerCase().includes(lostReasonSearch.toLowerCase())
  );

  const paginatedLostReasons = filteredLostReasons.slice(
    (lostReasonCurrentPage - 1) * lostReasonRowsPerPage,
    lostReasonCurrentPage * lostReasonRowsPerPage
  );

  const handleAddLostReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLostReasonText.trim()) return;

    const newReason: CezconLostReason = {
      id: Date.now(),
      reason: newLostReasonText.trim(),
    };

    setLostReasonsList([...lostReasonsList, newReason]);
    setNewLostReasonText('');
    setIsAddLostReasonModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Lost reason saved successfully.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <span>Opportunity Lost Reasons</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddLostReasonModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + LOST REASON
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 text-xs bg-white">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Show</span>
            <select
              value={lostReasonRowsPerPage}
              onChange={(e) => {
                setLostReasonRowsPerPage(Number(e.target.value));
                setLostReasonCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-600">Rows</span>
          </div>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search lost reason..."
              value={lostReasonSearch}
              onChange={(e) => {
                setLostReasonSearch(e.target.value);
                setLostReasonCurrentPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1 text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                <th className="py-2.5 px-4 min-w-[280px]">Reason Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLostReasons.map((lr, idx) => (
                <tr key={lr.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {(lostReasonCurrentPage - 1) * lostReasonRowsPerPage + idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{lr.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddLostReasonModalOpen && (
        <Modal
          isOpen={isAddLostReasonModalOpen}
          onClose={() => setIsAddLostReasonModalOpen(false)}
          title="Add Opportunity Lost Reason"
        >
          <form onSubmit={handleAddLostReason} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Reason Description *</label>
              <input
                type="text"
                required
                value={newLostReasonText}
                onChange={(e) => setNewLostReasonText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. Budget constraints"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddLostReasonModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Save Reason
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
