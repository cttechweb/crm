'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Plus, Settings, ChevronDown, Edit, Trash2, CheckCircle2, X } from 'lucide-react';
import { TaskTypeItem } from '@/types/settings';
import { TASK_TYPES } from '@/data/settingsMockData';

export function TaskSettingsTab() {
  const [tasks, setTasks] = useState<TaskTypeItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_task_types_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) { }
    }
    return TASK_TYPES;
  });

  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskTypeItem | null>(null);

  // Form inputs
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('0.00');
  const [colorInput, setColorInput] = useState('#22C55E');

  const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveTasks = (updated: TaskTypeItem[]) => {
    setTasks(updated);
    try {
      localStorage.setItem('cezcon_task_types_v2', JSON.stringify(updated));
    } catch (e) { }
  };

  const filteredTasks = tasks.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / rowsPerPage));
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startEntry = filteredTasks.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, filteredTasks.length);

  const handleSaveTaskType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    const amount = Number(amountInput) || 0;

    if (editingItem) {
      const updated = tasks.map((t) =>
        t.id === editingItem.id
          ? {
            ...t,
            name: nameInput.trim(),
            amount,
            color: colorInput || '#22C55E',
          }
          : t
      );
      saveTasks(updated);
      showToast(`Task type "${nameInput.trim()}" updated successfully!`);
    } else {
      const newItem: TaskTypeItem = {
        id: Date.now(),
        name: nameInput.trim(),
        amount,
        color: colorInput || '#22C55E',
      };
      saveTasks([...tasks, newItem]);
      showToast(`Task type "${nameInput.trim()}" created successfully!`);
    }

    setNameInput('');
    setAmountInput('0.00');
    setColorInput('#22C55E');
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteTaskType = (id: string | number) => {
    const target = tasks.find((t) => t.id === id);
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
    setOpenActionMenuId(null);
    showToast(`Task type "${target?.name || ''}" deleted.`);
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
            <Menu className="w-3.5 h-3.5 text-slate-500" />
            <span>Task Type</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setNameInput('');
              setAmountInput('0.00');
              setColorInput('#22C55E');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#48BB78] hover:bg-[#38A169] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer uppercase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>TASK TYPE</span>
          </button>
        </div>

        {/* Filter Toolbar: Show Rows & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span>Show</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
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
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-48 sm:w-60"
            />
          </div>
        </div>

        {/* Task Types Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F4F6] border-y border-slate-200 text-slate-700 font-bold text-xs">
                <th className="py-2.5 px-6 text-center w-24 border-r border-slate-200">Sl.No</th>
                <th className="py-2.5 px-6 border-r border-slate-200">Type</th>
                <th className="py-2.5 px-6 text-right w-36 border-r border-slate-200">Amount/Task</th>
                <th className="py-2.5 px-6 text-center min-w-[200px] border-r border-slate-200">Color Code</th>
                <th className="py-2.5 px-6 text-center w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No matching task types found.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task, idx) => {
                  const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                  const isMenuOpen = openActionMenuId === task.id;

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-6 text-center font-medium text-slate-800 border-r border-slate-100">
                        {slNo}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-100">
                        {task.name}
                      </td>
                      <td className="py-3 px-6 text-right font-medium text-slate-800 border-r border-slate-100 font-mono">
                        {(task.amount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-6 border-r border-slate-100">
                        <div
                          className="w-full h-4 rounded-xs border border-slate-400/30 shadow-2xs"
                          style={{ backgroundColor: task.color || '#22C55E' }}
                        />
                      </td>
                      <td className="py-2.5 px-6 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(isMenuOpen ? null : task.id);
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
                                  setEditingItem(task);
                                  setNameInput(task.name);
                                  setAmountInput((task.amount || 0).toFixed(2));
                                  setColorInput(task.color || '#22C55E');
                                  setIsAddModalOpen(true);
                                  setOpenActionMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <Edit className="w-3.5 h-3.5 text-blue-600" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTaskType(task.id)}
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
            Showing {startEntry} to {endEntry} of {filteredTasks.length} entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              «
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded border text-xs font-bold transition-colors cursor-pointer ${currentPage === pageNum
                    ? 'bg-[#009688] border-[#009688] text-white'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Add / Edit Task Type */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingItem ? 'Edit Task Type' : 'Add New Task Type'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                  setNameInput('');
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTaskType} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fleet Maintenance RM, Service, Followup..."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount / Task (AED)</label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Color Code</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-10 h-8 rounded border border-slate-200 cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-2 text-xs text-slate-900 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Color Bar Preview */}
              <div>
                <label className="block font-bold text-slate-500 mb-1">Preview Bar</label>
                <div
                  className="w-full h-4 rounded-xs border border-slate-400/30"
                  style={{ backgroundColor: colorInput }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    setNameInput('');
                  }}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#48BB78] hover:bg-[#38A169] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Update Task Type' : 'Save Task Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
