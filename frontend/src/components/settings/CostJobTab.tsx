'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Settings, ChevronDown, Edit, Trash2, Check, CheckCircle2, X } from 'lucide-react';
import { CostJobTypeItem } from '@/types/settings';
import { COST_JOB_TYPES } from '@/data/settingsMockData';

export function CostJobTab() {
  const [jobList, setJobList] = useState<CostJobTypeItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_cost_job_types_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return COST_JOB_TYPES;
  });

  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<CostJobTypeItem | null>(null);
  const [jobNameInput, setJobNameInput] = useState('');
  const [isManpowerInput, setIsManpowerInput] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveJobs = (updated: CostJobTypeItem[]) => {
    setJobList(updated);
    try {
      localStorage.setItem('cezcon_cost_job_types_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredJobs = jobList.filter((j) =>
    j.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / rowsPerPage));
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startEntry = filteredJobs.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, filteredJobs.length);

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobNameInput.trim()) return;

    if (editingJob) {
      const updated = jobList.map((j) =>
        j.id === editingJob.id
          ? { ...j, name: jobNameInput.trim(), manpower: isManpowerInput }
          : j
      );
      saveJobs(updated);
      showToast(`Cost/Job Type "${jobNameInput.trim()}" updated successfully!`);
    } else {
      const newJob: CostJobTypeItem = {
        id: Date.now(),
        name: jobNameInput.trim(),
        manpower: isManpowerInput,
      };
      saveJobs([...jobList, newJob]);
      showToast(`Cost/Job Type "${jobNameInput.trim()}" created successfully!`);
    }

    setJobNameInput('');
    setIsManpowerInput(false);
    setEditingJob(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteJob = (id: string | number) => {
    const target = jobList.find((j) => j.id === id);
    const updated = jobList.filter((j) => j.id !== id);
    saveJobs(updated);
    setOpenActionMenuId(null);
    showToast(`Cost/Job Type "${target?.name || ''}" deleted.`);
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
            <CreditCard className="w-3.5 h-3.5 text-slate-500" />
            <span>Cost/Job Type</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingJob(null);
              setJobNameInput('');
              setIsManpowerInput(false);
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#48BB78] hover:bg-[#38A169] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer uppercase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>COST/JOB TYPE</span>
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

        {/* Cost/Job Types Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F4F6] border-y border-slate-200 text-slate-700 font-bold text-xs">
                <th className="py-2.5 px-6 text-center w-24 border-r border-slate-200">SL_No</th>
                <th className="py-2.5 px-6 border-r border-slate-200">Cost/Job Type</th>
                <th className="py-2.5 px-6 text-center w-40 border-r border-slate-200">Manpower</th>
                <th className="py-2.5 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-400">
                    No matching cost/job types found.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job, idx) => {
                  const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                  const isMenuOpen = openActionMenuId === job.id;

                  return (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-6 text-center font-medium text-slate-800 border-r border-slate-100">
                        {slNo}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-100">
                        {job.name}
                      </td>
                      <td className="py-3 px-6 text-center border-r border-slate-100">
                        {job.manpower ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto stroke-[3]" />
                        ) : null}
                      </td>
                      <td className="py-2.5 px-6 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(isMenuOpen ? null : job.id);
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
                              className="absolute right-6 mt-1 w-36 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-left"
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingJob(job);
                                  setJobNameInput(job.name);
                                  setIsManpowerInput(Boolean(job.manpower));
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
                                onClick={() => handleDeleteJob(job.id)}
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
            Showing {startEntry} to {endEntry} of {filteredJobs.length} entries
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
                className={`px-3 py-1 rounded border text-xs font-bold transition-colors cursor-pointer ${
                  currentPage === pageNum
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

      {/* Modal: Add / Edit Cost/Job Type */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingJob ? 'Edit Cost/Job Type' : 'Add New Cost/Job Type'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingJob(null);
                  setJobNameInput('');
                  setIsManpowerInput(false);
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cost/Job Type Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Incentive, Salary, Material Cost..."
                  value={jobNameInput}
                  onChange={(e) => setJobNameInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="manpowerCheck"
                  checked={isManpowerInput}
                  onChange={(e) => setIsManpowerInput(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="manpowerCheck" className="font-semibold text-slate-800 cursor-pointer select-none">
                  Designate as Manpower / Direct Labor Cost
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingJob(null);
                    setJobNameInput('');
                    setIsManpowerInput(false);
                  }}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#48BB78] hover:bg-[#38A169] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingJob ? 'Update Cost/Job Type' : 'Save Cost/Job Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
