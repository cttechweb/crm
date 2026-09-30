'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Settings, ChevronDown, Edit, Trash2, CheckCircle2, X } from 'lucide-react';

export interface MonthlyCompanyTarget {
  id: string | number;
  month: string; // e.g. "SEP 2026"
  saleTarget: number;
  profitTarget?: number;
  invoiceTarget?: number;
  collectionTarget?: number;
}

export function CompanyTargetTab() {
  const [targetList, setTargetList] = useState<MonthlyCompanyTarget[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_company_targets_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  // Form inputs
  const [targetMonth, setTargetMonth] = useState('SEP 2026 TO SEP 2026');
  const [saleTargetInput, setSaleTargetInput] = useState('');
  const [profitTargetInput, setProfitTargetInput] = useState('');
  const [invoiceTargetInput, setInvoiceTargetInput] = useState('');
  const [collectionTargetInput, setCollectionTargetInput] = useState('');
  const [editingTargetId, setEditingTargetId] = useState<string | number | null>(null);

  // Table controls
  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveTargets = (updated: MonthlyCompanyTarget[]) => {
    setTargetList(updated);
    try {
      localStorage.setItem('cezcon_company_targets_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleTargetInput) return;

    const sale = Number(saleTargetInput) || 0;
    const profit = profitTargetInput ? Number(profitTargetInput) : undefined;
    const invoice = invoiceTargetInput ? Number(invoiceTargetInput) : undefined;
    const collection = collectionTargetInput ? Number(collectionTargetInput) : undefined;

    // Derive display month name from targetMonth
    const displayMonth = targetMonth.includes('TO') 
      ? targetMonth.split('TO')[0].trim() 
      : targetMonth.trim();

    if (editingTargetId) {
      const updated = targetList.map((t) =>
        t.id === editingTargetId
          ? {
              ...t,
              month: displayMonth,
              saleTarget: sale,
              profitTarget: profit,
              invoiceTarget: invoice,
              collectionTarget: collection,
            }
          : t
      );
      saveTargets(updated);
      showToast(`Company target for ${displayMonth} updated successfully!`);
      setEditingTargetId(null);
    } else {
      const newTarget: MonthlyCompanyTarget = {
        id: Date.now(),
        month: displayMonth || 'SEP 2026',
        saleTarget: sale,
        profitTarget: profit,
        invoiceTarget: invoice,
        collectionTarget: collection,
      };
      saveTargets([...targetList, newTarget]);
      showToast(`Company target for ${displayMonth || 'SEP 2026'} added successfully!`);
    }

    // Reset Form
    setSaleTargetInput('');
    setProfitTargetInput('');
    setInvoiceTargetInput('');
    setCollectionTargetInput('');
  };

  const handleEdit = (target: MonthlyCompanyTarget) => {
    setEditingTargetId(target.id);
    setTargetMonth(`${target.month} TO ${target.month}`);
    setSaleTargetInput(target.saleTarget ? String(target.saleTarget) : '');
    setProfitTargetInput(target.profitTarget ? String(target.profitTarget) : '');
    setInvoiceTargetInput(target.invoiceTarget ? String(target.invoiceTarget) : '');
    setCollectionTargetInput(target.collectionTarget ? String(target.collectionTarget) : '');
    setOpenActionMenuId(null);
  };

  const handleDelete = (id: string | number) => {
    const updated = targetList.filter((t) => t.id !== id);
    saveTargets(updated);
    setOpenActionMenuId(null);
    showToast('Company target deleted.');
  };

  const handleCancelEdit = () => {
    setEditingTargetId(null);
    setSaleTargetInput('');
    setProfitTargetInput('');
    setInvoiceTargetInput('');
    setCollectionTargetInput('');
  };

  // Close actions menu when clicked outside
  useEffect(() => {
    const handleClickOutside = () => setOpenActionMenuId(null);
    if (openActionMenuId !== null) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openActionMenuId]);

  const filteredTargets = targetList.filter((t) =>
    t.month.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / rowsPerPage));
  const paginatedTargets = filteredTargets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startEntry = filteredTargets.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, filteredTargets.length);

  return (
    <div className="w-full space-y-4">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F3652] text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Add / Edit Form (~35% width) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#ECEFF1] border-b border-slate-300">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>{editingTargetId ? 'Edit Company Target (Monthly)' : 'Add / Edit Company Target (Monthly)'}</span>
            </div>
            {editingTargetId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Month <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={targetMonth}
                  onChange={(e) => setTargetMonth(e.target.value)}
                  placeholder="SEP 2026 TO SEP 2026"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 pl-8 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monthly Sale Target <span className="text-rose-600">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="any"
                value={saleTargetInput}
                onChange={(e) => setSaleTargetInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monthly Profit(GP) Target
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={profitTargetInput}
                onChange={(e) => setProfitTargetInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monthly Invoice Target
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={invoiceTargetInput}
                onChange={(e) => setInvoiceTargetInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Monthly Collection Target
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={collectionTargetInput}
                onChange={(e) => setCollectionTargetInput(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-1.5 bg-[#0F3652] hover:bg-[#0A2538] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
              >
                {editingTargetId ? 'Update' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Company Target Master Table (~65% width) */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-none shadow-xs overflow-hidden">
          {/* Header Banner */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#ECEFF1] border-b border-slate-300">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-700">
              <BarChart3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Company Target</span>
            </div>
          </div>

          {/* Toolbar */}
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
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
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
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-44 sm:w-56"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F3F4F6] border-y border-slate-200 text-slate-700 font-bold text-xs">
                  <th className="py-2.5 px-3 text-center w-16 border-r border-slate-200">
                    <div className="flex items-center justify-center gap-1">
                      <span>Sl.No</span>
                      <span className="text-[10px] text-blue-600">▲</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-200">
                    <div className="flex items-center gap-1">
                      <span>Month</span>
                      <span className="text-[10px] text-slate-400">▲▼</span>
                    </div>
                  </th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Sale</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Profit(GP)</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Invoice</th>
                  <th className="py-2.5 px-3 border-r border-slate-200 text-right">Collection</th>
                  <th className="py-2.5 px-3 text-center w-20">
                    <div className="flex items-center justify-center gap-1">
                      <span>Action</span>
                      <span className="text-[10px] text-slate-400">▲▼</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {paginatedTargets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedTargets.map((target, idx) => {
                    const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                    const isMenuOpen = openActionMenuId === target.id;

                    return (
                      <tr key={target.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-medium text-slate-800 border-r border-slate-100">
                          {slNo}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 border-r border-slate-100 whitespace-nowrap">
                          {target.month}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                          {target.saleTarget ? `AED ${target.saleTarget.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                          {target.profitTarget ? `AED ${target.profitTarget.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                          {target.invoiceTarget ? `AED ${target.invoiceTarget.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-800 border-r border-slate-100">
                          {target.collectionTarget ? `AED ${target.collectionTarget.toLocaleString()}` : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center relative">
                          <div className="inline-block text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(isMenuOpen ? null : target.id);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0F3652] hover:bg-[#0A2538] text-white text-xs font-semibold rounded shadow-2xs transition-colors cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Actions Dropdown */}
                            {isMenuOpen && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-3 mt-1 w-32 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50 text-left"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleEdit(target)}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 font-medium cursor-pointer"
                                >
                                  <Edit className="w-3.5 h-3.5 text-blue-600" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(target.id)}
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
              Showing {startEntry} to {endEntry} of {filteredTargets.length} entries
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

              {totalPages > 0 && Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
