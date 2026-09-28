'use client';

import React, { useState } from 'react';
import { Layers, Plus, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CezconOpportunityStage } from '@/types/settings';
import { CEZCON_OPPORTUNITY_STAGES_DATA } from '@/data/settingsMockData';

export function OpportunityStagesTab() {
  const [stagesList, setStagesList] = useState<CezconOpportunityStage[]>(CEZCON_OPPORTUNITY_STAGES_DATA);
  const [isAddStageModalOpen, setIsAddStageModalOpen] = useState(false);
  const [stageRowsPerPage, setStageRowsPerPage] = useState(10);
  const [stageCurrentPage, setStageCurrentPage] = useState(1);
  const [stageSearch, setStageSearch] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [newStageForm, setNewStageForm] = useState({
    name: '',
    abbreviation: '',
    color: '#2563EB',
  });

  const filteredStages = stagesList.filter((s) =>
    s.name.toLowerCase().includes(stageSearch.toLowerCase()) ||
    s.abbreviation.toLowerCase().includes(stageSearch.toLowerCase())
  );

  const paginatedStages = filteredStages.slice(
    (stageCurrentPage - 1) * stageRowsPerPage,
    stageCurrentPage * stageRowsPerPage
  );

  const handleAddStage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStageForm.name.trim()) return;

    const newStage: CezconOpportunityStage = {
      id: Date.now(),
      name: newStageForm.name.trim(),
      abbreviation: newStageForm.abbreviation.trim(),
      color: newStageForm.color,
      textColor: newStageForm.color,
    };

    setStagesList([...stagesList, newStage]);
    setNewStageForm({ name: '', abbreviation: '', color: '#2563EB' });
    setIsAddStageModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Stage saved successfully.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <Layers className="w-4 h-4 text-slate-600" />
            <span>Opportunity Pipeline Stages</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddStageModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + OPPORTUNITY STAGE
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 text-xs bg-white">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Show</span>
            <select
              value={stageRowsPerPage}
              onChange={(e) => {
                setStageRowsPerPage(Number(e.target.value));
                setStageCurrentPage(1);
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
              placeholder="Search stage..."
              value={stageSearch}
              onChange={(e) => {
                setStageSearch(e.target.value);
                setStageCurrentPage(1);
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
                <th className="py-2.5 px-4 min-w-[150px]">Stages</th>
                <th className="py-2.5 px-4 min-w-[120px]">Abbreviation</th>
                <th className="py-2.5 px-4 min-w-[150px]">Color Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStages.map((stage, idx) => (
                <tr key={stage.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {(stageCurrentPage - 1) * stageRowsPerPage + idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{stage.name}</td>
                  <td className="py-3 px-4 text-slate-500 font-medium">{stage.abbreviation || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                      style={{ backgroundColor: stage.color }}
                    >
                      {stage.name}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddStageModalOpen && (
        <Modal
          isOpen={isAddStageModalOpen}
          onClose={() => setIsAddStageModalOpen(false)}
          title="Add Opportunity Pipeline Stage"
        >
          <form onSubmit={handleAddStage} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Stage Name *</label>
              <input
                type="text"
                required
                value={newStageForm.name}
                onChange={(e) => setNewStageForm({ ...newStageForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. Contract Drafting"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Abbreviation</label>
              <input
                type="text"
                value={newStageForm.abbreviation}
                onChange={(e) => setNewStageForm({ ...newStageForm, abbreviation: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. CD"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Color Code</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newStageForm.color}
                  onChange={(e) => setNewStageForm({ ...newStageForm, color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={newStageForm.color}
                  onChange={(e) => setNewStageForm({ ...newStageForm, color: e.target.value })}
                  className="w-28 px-2 py-1 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddStageModalOpen(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
              >
                Save Stage
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
