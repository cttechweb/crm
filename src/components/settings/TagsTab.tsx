'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CezconTag } from '@/types/settings';
import { CEZCON_TAGS_DATA } from '@/data/settingsMockData';

export function TagsTab() {
  const [tagsList, setTagsList] = useState<CezconTag[]>(CEZCON_TAGS_DATA);
  const [tagSearch, setTagSearch] = useState('');
  const [tagRowsPerPage, setTagRowsPerPage] = useState(10);
  const [tagCurrentPage, setTagCurrentPage] = useState(1);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const filteredTags = tagsList.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const totalTagPages = Math.max(1, Math.ceil(filteredTags.length / tagRowsPerPage));
  const paginatedTags = filteredTags.slice(
    (tagCurrentPage - 1) * tagRowsPerPage,
    tagCurrentPage * tagRowsPerPage
  );

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;

    const newTag: CezconTag = {
      id: Date.now(),
      name: newTagInput.trim(),
    };

    setTagsList([...tagsList, newTag]);
    setNewTagInput('');
    setIsAddTagModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> Tag saved successfully.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <Tag className="w-4 h-4 text-slate-600" />
            <span>Business & Service Tags</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddTagModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + BUSINESS TAG
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 text-xs bg-white">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Show</span>
            <select
              value={tagRowsPerPage}
              onChange={(e) => {
                setTagRowsPerPage(Number(e.target.value));
                setTagCurrentPage(1);
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
              placeholder="Search tags..."
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value);
                setTagCurrentPage(1);
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
                <th className="py-2.5 px-4 min-w-[280px]">Tag Name</th>
                <th className="py-2.5 px-4 text-center w-32">Badge Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedTags.map((tag, idx) => (
                <tr key={tag.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3 text-center font-bold text-slate-800">
                    {(tagCurrentPage - 1) * tagRowsPerPage + idx + 1}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{tag.name}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-bold">
                      #{tag.name}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddTagModalOpen && (
        <Modal
          isOpen={isAddTagModalOpen}
          onClose={() => setIsAddTagModalOpen(false)}
          title="Add Business Tag"
        >
          <form onSubmit={handleAddTag} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tag Name *</label>
              <input
                type="text"
                required
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g. Energy Audit"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddTagModalOpen(false)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Save Tag</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
