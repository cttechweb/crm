'use client';

import React, { useState, useEffect } from 'react';
import { Menu, Plus, Settings, ChevronDown, Edit, Trash2, CheckCircle2, X } from 'lucide-react';

export interface BusinessOpportunityItem {
  id: number | string;
  title: string;
}

const DEFAULT_BUSINESS_OPPORTUNITIES: BusinessOpportunityItem[] = [
  { id: 1, title: 'Other Opportunity' },
  { id: 2, title: 'Under Warranty Services - UWSR' },
  { id: 3, title: 'Repair and Maintenance of Air Cooler' },
  { id: 4, title: 'Repair & Maintenance of DX Air Conditioners' },
  { id: 5, title: 'Repair & Maintenance of Ice Cube & Ice Flake Machines' },
  { id: 6, title: 'Supply and Maintenance of Air Cooler' },
  { id: 7, title: 'Facility Management' },
  { id: 8, title: 'Supply of Home Appliances' },
  { id: 9, title: 'Weather Protective Coating Services' },
  { id: 10, title: 'Thermal Insulation Services for Pipes Tanks and Chillers' },
  { id: 11, title: 'Central Chiller Overhaul & 3-Year Commercial AMC Contract' },
  { id: 12, title: 'Duct Fabrication & Air Distribution Installation' },
  { id: 13, title: 'Building Management System (BMS) Automation' },
  { id: 14, title: 'Energy Audit & Retrofitting Services' },
  { id: 15, title: 'Cooling Tower Maintenance & Water Treatment' },
];

export function OpportunitySettingsTab() {
  const [opportunityList, setOpportunityList] = useState<BusinessOpportunityItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_business_opportunities_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_BUSINESS_OPPORTUNITIES;
  });

  const [search, setSearch] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessOpportunityItem | null>(null);
  const [titleInput, setTitleInput] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<string | number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const saveOpportunities = (updated: BusinessOpportunityItem[]) => {
    setOpportunityList(updated);
    try {
      localStorage.setItem('cezcon_business_opportunities_v2', JSON.stringify(updated));
    } catch (e) {}
  };

  const filteredItems = opportunityList.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const startEntry = filteredItems.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const endEntry = Math.min(currentPage * rowsPerPage, filteredItems.length);

  const handleSaveOpportunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;

    if (editingItem) {
      const updated = opportunityList.map((item) =>
        item.id === editingItem.id ? { ...item, title: titleInput.trim() } : item
      );
      saveOpportunities(updated);
      showToast(`Business opportunity "${titleInput.trim()}" updated successfully!`);
    } else {
      const newItem: BusinessOpportunityItem = {
        id: Date.now(),
        title: titleInput.trim(),
      };
      saveOpportunities([...opportunityList, newItem]);
      showToast(`Business opportunity "${titleInput.trim()}" created successfully!`);
    }

    setTitleInput('');
    setEditingItem(null);
    setIsAddModalOpen(false);
  };

  const handleDeleteOpportunity = (id: string | number) => {
    const target = opportunityList.find((item) => item.id === id);
    const updated = opportunityList.filter((item) => item.id !== id);
    saveOpportunities(updated);
    setOpenActionMenuId(null);
    showToast(`Business opportunity "${target?.title || ''}" deleted.`);
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
            <span>Business Opportunities</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setTitleInput('');
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 bg-[#48BB78] hover:bg-[#38A169] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer uppercase"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>BUSINESS OPPORTUNITY</span>
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

        {/* Business Opportunities Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F3F4F6] border-y border-slate-200 text-slate-700 font-bold text-xs">
                <th className="py-2.5 px-6 text-center w-24 border-r border-slate-200">SL.No</th>
                <th className="py-2.5 px-6 border-r border-slate-200">Title</th>
                <th className="py-2.5 px-6 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-10 text-center text-slate-400">
                    No matching business opportunities found.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const slNo = (currentPage - 1) * rowsPerPage + idx + 1;
                  const isMenuOpen = openActionMenuId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-6 text-center font-medium text-slate-800 border-r border-slate-100">
                        {slNo}
                      </td>
                      <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-100">
                        {item.title}
                      </td>
                      <td className="py-2.5 px-6 text-center relative">
                        <div className="inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenuId(isMenuOpen ? null : item.id);
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
                                  setEditingItem(item);
                                  setTitleInput(item.title);
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
                                onClick={() => handleDeleteOpportunity(item.id)}
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
            Showing {startEntry} to {endEntry} of {filteredItems.length} entries
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

      {/* Modal: Add / Edit Business Opportunity */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-lg shadow-2xl border border-slate-200 p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Menu className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingItem ? 'Edit Business Opportunity' : 'Add New Business Opportunity'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingItem(null);
                  setTitleInput('');
                }}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOpportunity} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Business Opportunity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Under Warranty Services - UWSR"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingItem(null);
                    setTitleInput('');
                  }}
                  className="px-4 py-1.5 rounded border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#48BB78] hover:bg-[#38A169] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingItem ? 'Update Opportunity' : 'Save Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
