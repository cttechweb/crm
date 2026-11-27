'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Settings, ChevronDown, Edit, Trash2, CheckCircle2, X } from 'lucide-react';
import { CezconTag } from '@/types/settings';
import { CEZCON_TAGS_DATA } from '@/data/settingsMockData';

export function TagsTab() {
  const [tagsList, setTagsList] = useState<CezconTag[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_settings_tags_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return CEZCON_TAGS_DATA;
  });

  const [tagSearch, setTagSearch] = useState('');
  const [tagRowsPerPage, setTagRowsPerPage] = useState(10);
  const [tagCurrentPage, setTagCurrentPage] = useState(1);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<CezconTag | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveTags = (updated: CezconTag[]) => {
    setTagsList(updated);
    try {
      localStorage.setItem('cezcon_settings_tags_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredTags = tagsList.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const totalTagPages = Math.max(1, Math.ceil(filteredTags.length / tagRowsPerPage));
  const paginatedTags = filteredTags.slice(
    (tagCurrentPage - 1) * tagRowsPerPage,
    tagCurrentPage * tagRowsPerPage
  );

  const startEntry = filteredTags.length === 0 ? 0 : (tagCurrentPage - 1) * tagRowsPerPage + 1;
  const endEntry = Math.min(tagCurrentPage * tagRowsPerPage, filteredTags.length);

  const handleSaveTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;

    if (editingTag) {
      const updated = tagsList.map((t) =>
        t.id === editingTag.id ? { ...t, name: tagInput.trim() } : t
      );
      saveTags(updated);
      showToast(`Tag "${tagInput.trim()}" updated successfully!`);
    } else {
      const newTag: CezconTag = {
        id: Date.now(),
        name: tagInput.trim(),
      };
      saveTags([...tagsList, newTag]);
      showToast(`Tag "${tagInput.trim()}" created successfully!`);
    }

    setTagInput('');
    setEditingTag(null);
    setIsAddTagModalOpen(false);
  };

  const handleDeleteTag = (id: string | number) => {
    const target = tagsList.find((t) => t.id === id);
    const updated = tagsList.filter((t) => t.id !== id);
    saveTags(updated);
    setOpenActionMenuId(null);
    showToast(`Tag "${target?.name || ''}" deleted.`);
  };

  // Close actions menu when clicked outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    if (openActionMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionMenuId]);

  return (
    <div className="w-full space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F3652] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Cezcon Table Container */}
      <div className="bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
        {/* Top Header Banner */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#ECEFF1] border-b border-slate-300">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Tags</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingTag(null);
              setTagInput('');
              setIsAddTagModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#48BB78] hover:bg-[#38A169] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TAG</span>
          </button>
        </div>

        {/* Filter Toolbar: Show Rows & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span>Show</span>
            <select
              value={tagRowsPerPage}
              onChange={(e) => {
                setTagRowsPerPage(Number(e.target.value));
                setTagCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>Rows</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">Search</span>
            <input
              type="text"
              value={tagSearch}
              onChange={(e) => {
                setTagSearch(e.target.value);
                setTagCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-48 sm:w-60"
            />
          </div>
        </div>

        {/* Tags Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F4F6] border-y border-slate-200 text-slate-700 font-bold text-xs">
                <th className="py-2.5 px-6 text-center w-24 border-r border-slate-200">SL_No</th>
                <th className="py-2.5 px-6 border-r border-slate-200">Tag</th>
                <th className="py-2.5 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedTags.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400">
                    No matching tags found.
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag, idx) => {
                  const slNo = (tagCurrentPage - 1) * tagRowsPerPage + idx + 1;
                  const isMenuOpen = openActionMenuId === tag.id;

                  return (
                    <tr key={tag.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-6 text-center font-medium text-slate-800 border-r border-slate-100">
                        {slNo}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-100">
                        {tag.name}
                      </td>
                      <td className="py-2.5 px-6 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(isMenuOpen ? null : tag.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F3652] hover:bg-[#0A2538] text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {/* Actions Dropdown */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-6 mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTag(tag);
                                  setTagInput(tag.name);
                                  setIsAddTagModalOpen(true);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTag(tag.id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer: Showing entries + Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing {startEntry} to {endEntry} of {filteredTags.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={tagCurrentPage === 1}
              onClick={() => setTagCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              «
            </button>

            {Array.from({ length: totalTagPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setTagCurrentPage(pageNum)}
                className={`px-3 py-1 rounded border text-xs font-bold transition-colors cursor-pointer ${
                  tagCurrentPage === pageNum
                    ? 'bg-[#009688] border-[#009688] text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={tagCurrentPage === totalTagPages}
              onClick={() => setTagCurrentPage((p) => Math.min(totalTagPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add / Edit Tag */}
      {isAddTagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingTag ? 'Edit Tag' : 'Add New Tag'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddTagModalOpen(false);
                  setEditingTag(null);
                  setTagInput('');
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTag} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tag Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maintenance, Chiller, Fan Motor..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddTagModalOpen(false);
                    setEditingTag(null);
                    setTagInput('');
                  }}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#48BB78] hover:bg-[#38A169] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingTag ? 'Update Tag' : 'Save Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
