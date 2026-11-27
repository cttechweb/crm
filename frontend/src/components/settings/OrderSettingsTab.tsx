'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Search,
  RotateCcw,
  ShoppingBag,
  Briefcase,
  Calendar,
  AlertOctagon,
  Settings,
  ChevronDown,
  ArrowUpDown,
  GripVertical,
  MoveUp,
  MoveDown,
  CheckCircle2,
  XCircle,
  Check,
} from 'lucide-react';
import { ORDER_STATUSES, CEZCON_ORDER_TYPES_DATA } from '@/data/settingsMockData';
import { OrderStatusItem, OrderTypeItem } from '@/types/settings';

const PRESET_STATUS_COLORS = [
  { label: 'Green', hex: '#22c55e' },
  { label: 'Coral / Red', hex: '#ef4444' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Slate', hex: '#64748b' },
];

const DEFAULT_CEZCON_ORDER_STATUSES: OrderStatusItem[] = [
  { id: 1, name: 'Completed', color: '#22c55e', active: true, stageOrder: 1 },
  { id: 2, name: 'On Progress', color: '#ef4444', active: true, stageOrder: 2 },
  { id: 3, name: 'Order Placed / Pending', color: '#3b82f6', active: true, stageOrder: 3 },
  { id: 4, name: 'In Transit / Dispatched', color: '#f59e0b', active: true, stageOrder: 4 },
  { id: 5, name: 'Delivered / Installed', color: '#06b6d4', active: true, stageOrder: 5 },
  { id: 6, name: 'Cancelled', color: '#64748b', active: true, stageOrder: 6 },
];

const INITIAL_AMC_YEARS = [
  { id: 1, name: '1 Year AMC Contract', durationMonths: 12, visitsPerYear: 4, type: 'Comprehensive', active: true },
  { id: 2, name: '2 Years Extended AMC', durationMonths: 24, visitsPerYear: 8, type: 'Comprehensive', active: true },
  { id: 3, name: '3 Years Enterprise SLA', durationMonths: 36, visitsPerYear: 12, type: 'Comprehensive + Parts', active: true },
  { id: 4, name: '5 Years Long-term AMC', durationMonths: 60, visitsPerYear: 20, type: 'Labor & Emergency Only', active: true },
];

const INITIAL_CANCELLATION_REASONS = [
  { id: 1, reason: 'Customer changed procurement budget / scope', active: true },
  { id: 2, reason: 'Technical site survey did not meet requirements', active: true },
  { id: 3, reason: 'Duplicate order entry created by sales rep', active: true },
  { id: 4, reason: 'Vendor inventory stockout / timeline unacceptable', active: true },
  { id: 5, reason: 'Customer cancellation without penalty period', active: true },
];

export function OrderSettingsTab({ initialSubTab = 'type' }: { initialSubTab?: string }) {
  const [activeSubTab, setActiveSubTab] = useState<'type' | 'status' | 'amc' | 'cancellation'>(
    initialSubTab === 'status' ? 'status' : 'type'
  );

  // ----------------------------------------------------
  // 1. ORDER STATUS STATE (Cezcon Two-Column Layout)
  // ----------------------------------------------------
  const [statuses, setStatuses] = useState<OrderStatusItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_order_statuses_v2');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load order statuses', e);
      }
    }
    return DEFAULT_CEZCON_ORDER_STATUSES;
  });

  const [sortableStatuses, setSortableStatuses] = useState<OrderStatusItem[]>([]);
  const [statusSearch, setStatusSearch] = useState('');
  const [statusRowsPerPage, setStatusRowsPerPage] = useState(10);
  const [statusCurrentPage, setStatusCurrentPage] = useState(1);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isStatusDeleteModalOpen, setIsStatusDeleteModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<OrderStatusItem | null>(null);
  const [editingStatusId, setEditingStatusId] = useState<number | string | null>(null);
  const [statusFormData, setStatusFormData] = useState({ name: '', color: '#22c55e', active: true });
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<number | string | null>(null);

  // Sync sortable list whenever statuses change
  useEffect(() => {
    setSortableStatuses([...statuses]);
  }, [statuses]);

  // ----------------------------------------------------
  // 2. ORDER TYPE STATE (Cezcon Single-Table Layout)
  // ----------------------------------------------------
  const [orderTypes, setOrderTypes] = useState<OrderTypeItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cezcon_order_types_list');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load order types', e);
      }
    }
    return CEZCON_ORDER_TYPES_DATA;
  });

  const [typeSearch, setTypeSearch] = useState('');
  const [typeRowsPerPage, setTypeRowsPerPage] = useState(10);
  const [typeCurrentPage, setTypeCurrentPage] = useState(1);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isTypeDeleteModalOpen, setIsTypeDeleteModalOpen] = useState(false);
  const [typeToDelete, setTypeToDelete] = useState<OrderTypeItem | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<number | string | null>(null);
  const [typeFormData, setTypeFormData] = useState({ name: '', description: '', active: true });
  const [openTypeDropdownId, setOpenTypeDropdownId] = useState<number | string | null>(null);

  // Toast / Error
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dropdown-action-container')) {
        setOpenTypeDropdownId(null);
        setOpenStatusDropdownId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // ----------------------------------------------------
  // ORDER STATUS HANDLERS
  // ----------------------------------------------------
  const saveStatuses = (updated: OrderStatusItem[]) => {
    setStatuses(updated);
    try {
      localStorage.setItem('cezcon_order_statuses_v2', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save order statuses', e);
    }
  };

  const handleOpenAddStatus = () => {
    setEditingStatusId(null);
    setStatusFormData({ name: '', color: '#22c55e', active: true });
    setErrorMessage(null);
    setIsStatusModalOpen(true);
  };

  const handleOpenEditStatus = (item: OrderStatusItem) => {
    setEditingStatusId(item.id);
    setStatusFormData({
      name: item.name,
      color: item.color || '#22c55e',
      active: item.active !== false,
    });
    setErrorMessage(null);
    setOpenStatusDropdownId(null);
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusFormData.name.trim()) {
      setErrorMessage('Status name is required.');
      return;
    }

    if (editingStatusId !== null) {
      const updated = statuses.map((s) =>
        s.id === editingStatusId
          ? { ...s, name: statusFormData.name.trim(), color: statusFormData.color, active: statusFormData.active }
          : s
      );
      saveStatuses(updated);
      showToast(`Order status "${statusFormData.name.trim()}" updated.`);
    } else {
      const newItem: OrderStatusItem = {
        id: Date.now(),
        name: statusFormData.name.trim(),
        color: statusFormData.color,
        active: statusFormData.active,
        stageOrder: statuses.length + 1,
      };
      saveStatuses([...statuses, newItem]);
      showToast(`Order status "${newItem.name}" added.`);
    }
    setIsStatusModalOpen(false);
  };

  const handleToggleStatusActive = (id: number | string) => {
    const updated = statuses.map((s) =>
      s.id === id ? { ...s, active: s.active === false ? true : false } : s
    );
    saveStatuses(updated);
    setOpenStatusDropdownId(null);
    const target = updated.find((s) => s.id === id);
    showToast(`Status "${target?.name}" set to ${target?.active ? 'Active' : 'Inactive'}.`);
  };

  const handleConfirmDeleteStatus = () => {
    if (!statusToDelete) return;
    const updated = statuses.filter((s) => s.id !== statusToDelete.id);
    saveStatuses(updated);
    showToast(`Order status "${statusToDelete.name}" deleted.`);
    setIsStatusDeleteModalOpen(false);
    setStatusToDelete(null);
  };

  // Reorder in right Sort Status card
  const handleMoveSortItem = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sortableStatuses.length - 1)
    ) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...sortableStatuses];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setSortableStatuses(reordered);
  };

  const handleSaveSortedOrder = () => {
    const updated = sortableStatuses.map((s, idx) => ({ ...s, stageOrder: idx + 1 }));
    saveStatuses(updated);
    showToast('Order statuses sorted and updated successfully.');
  };

  const handleResetStatuses = () => {
    saveStatuses(DEFAULT_CEZCON_ORDER_STATUSES);
    showToast('Reset order statuses to defaults.');
  };

  const filteredStatuses = statuses.filter((s) =>
    s.name.toLowerCase().includes(statusSearch.toLowerCase())
  );
  const totalStatusPages = Math.ceil(filteredStatuses.length / statusRowsPerPage) || 1;
  const paginatedStatuses = filteredStatuses.slice(
    (statusCurrentPage - 1) * statusRowsPerPage,
    statusCurrentPage * statusRowsPerPage
  );

  // ----------------------------------------------------
  // ORDER TYPE HANDLERS
  // ----------------------------------------------------
  const saveOrderTypes = (updated: OrderTypeItem[]) => {
    setOrderTypes(updated);
    try {
      localStorage.setItem('cezcon_order_types_list', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save order types', e);
    }
  };

  const handleOpenAddType = () => {
    setEditingTypeId(null);
    setTypeFormData({ name: '', description: '', active: true });
    setErrorMessage(null);
    setIsTypeModalOpen(true);
  };

  const handleOpenEditType = (item: OrderTypeItem) => {
    setEditingTypeId(item.id);
    setTypeFormData({
      name: item.name,
      description: item.description || '',
      active: item.active !== false,
    });
    setErrorMessage(null);
    setOpenTypeDropdownId(null);
    setIsTypeModalOpen(true);
  };

  const handleSaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typeFormData.name.trim()) {
      setErrorMessage('Order type name is required.');
      return;
    }

    if (editingTypeId !== null) {
      const updated = orderTypes.map((t) =>
        t.id === editingTypeId
          ? { ...t, name: typeFormData.name.trim(), description: typeFormData.description.trim(), active: typeFormData.active }
          : t
      );
      saveOrderTypes(updated);
      showToast(`Order type "${typeFormData.name.trim()}" updated.`);
    } else {
      const newItem: OrderTypeItem = {
        id: Date.now(),
        name: typeFormData.name.trim(),
        description: typeFormData.description.trim(),
        active: typeFormData.active,
      };
      saveOrderTypes([...orderTypes, newItem]);
      showToast(`Order type "${newItem.name}" added.`);
    }
    setIsTypeModalOpen(false);
  };

  const handleToggleTypeActive = (id: number | string) => {
    const updated = orderTypes.map((t) =>
      t.id === id ? { ...t, active: t.active === false ? true : false } : t
    );
    saveOrderTypes(updated);
    setOpenTypeDropdownId(null);
    const target = updated.find((t) => t.id === id);
    showToast(`Order type "${target?.name}" set to ${target?.active ? 'Active' : 'Inactive'}.`);
  };

  const handleConfirmDeleteType = () => {
    if (!typeToDelete) return;
    const updated = orderTypes.filter((t) => t.id !== typeToDelete.id);
    saveOrderTypes(updated);
    showToast(`Order type "${typeToDelete.name}" deleted.`);
    setIsTypeDeleteModalOpen(false);
    setTypeToDelete(null);
  };

  const filteredTypes = orderTypes.filter((t) =>
    t.name.toLowerCase().includes(typeSearch.toLowerCase())
  );
  const totalTypePages = Math.ceil(filteredTypes.length / typeRowsPerPage) || 1;
  const paginatedTypes = filteredTypes.slice(
    (typeCurrentPage - 1) * typeRowsPerPage,
    typeCurrentPage * typeRowsPerPage
  );

  return (
    <div className="space-y-4">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-Tabs Navigation (Cezcon Standard Bar) */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 border border-slate-200 rounded-lg overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('type')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'type'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Order Type</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'type' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {orderTypes.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('status')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'status'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Order Status</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            activeSubTab === 'status' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {statuses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('amc')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'amc'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>AMC Year Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('cancellation')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'cancellation'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-blue-600 hover:bg-white'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Cancellation Reasons</span>
        </button>
      </div>

      {/* =========================================================================
          SUB-TAB: ORDER STATUS (Exact Cezcon Two-Column Layout from Screenshot)
          ========================================================================= */}
      {activeSubTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT PANEL: Order Status Table (Cols 8) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <ShoppingBag className="w-4 h-4 text-slate-600" />
                <span>Order Status</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetStatuses}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
                  title="Reset to defaults"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleOpenAddStatus}
                  id="btn-add-order-status"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  + Order Status
                </button>
              </div>
            </div>

            {/* Table Controls (Show Rows + Search) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 text-xs bg-white">
              <div className="flex items-center gap-2">
                <span className="text-slate-600">Show</span>
                <select
                  value={statusRowsPerPage}
                  onChange={(e) => {
                    setStatusRowsPerPage(Number(e.target.value));
                    setStatusCurrentPage(1);
                  }}
                  className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-slate-600">Rows</span>
              </div>

              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search"
                  value={statusSearch}
                  onChange={(e) => {
                    setStatusSearch(e.target.value);
                    setStatusCurrentPage(1);
                  }}
                  className="w-full pl-3 pr-8 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto min-h-[260px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                  <tr>
                    <th className="py-2.5 px-6 w-20 text-center border-r border-slate-200">Sl.No</th>
                    <th className="py-2.5 px-6 border-r border-slate-200">Order Status</th>
                    <th className="py-2.5 px-6 w-36 border-r border-slate-200 text-center">Color Code</th>
                    <th className="py-2.5 px-6 w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {paginatedStatuses.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No order statuses found matching "{statusSearch}"
                      </td>
                    </tr>
                  ) : (
                    paginatedStatuses.map((item, index) => {
                      const slNo = (statusCurrentPage - 1) * statusRowsPerPage + index + 1;
                      const isDropdownOpen = openStatusDropdownId === item.id;
                      const isActive = item.active !== false;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                          <td className="py-3 px-6 text-center font-medium text-slate-700 border-r border-slate-200">
                            {slNo}
                          </td>
                          <td className="py-3 px-6 font-bold text-slate-900 border-r border-slate-200">
                            <div className="flex items-center gap-2">
                              <span>{item.name}</span>
                              {!isActive && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Color Code Bar (Exact Cezcon rectangular bar) */}
                          <td className="py-3 px-6 text-center border-r border-slate-200">
                            <div
                              className="w-24 h-5 rounded-xs border border-slate-300 mx-auto shadow-2xs"
                              style={{ backgroundColor: item.color || '#22c55e' }}
                              title={item.color}
                            />
                          </td>
                          {/* Action Dropdown */}
                          <td className="py-3 px-6 text-center relative">
                            <div className="inline-block relative dropdown-action-container text-left">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenStatusDropdownId(isDropdownOpen ? null : item.id);
                                }}
                                className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              >
                                <Settings className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>

                              {isDropdownOpen && (
                                <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditStatus(item)}
                                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleStatusActive(item.id)}
                                    className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    {isActive ? (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-amber-500" />
                                        <span>Deactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        <span>Activate</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenStatusDropdownId(null);
                                      setStatusToDelete(item);
                                      setIsStatusDeleteModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
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

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-600 bg-white">
              <div>
                Showing {filteredStatuses.length > 0 ? (statusCurrentPage - 1) * statusRowsPerPage + 1 : 0} to{' '}
                {Math.min(statusCurrentPage * statusRowsPerPage, filteredStatuses.length)} of {filteredStatuses.length} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setStatusCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={statusCurrentPage === 1}
                  className={`px-2 py-1 rounded border text-xs ${
                    statusCurrentPage === 1
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  «
                </button>

                {Array.from({ length: totalStatusPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setStatusCurrentPage(pageNum)}
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      statusCurrentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setStatusCurrentPage((p) => Math.min(totalStatusPages, p + 1))}
                  disabled={statusCurrentPage === totalStatusPages}
                  className={`px-2 py-1 rounded border text-xs ${
                    statusCurrentPage === totalStatusPages
                      ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  »
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Sort Status Card (Cols 4) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
                <ArrowUpDown className="w-4 h-4 text-slate-600" />
                <span>Sort Status</span>
              </div>
            </div>

            {/* Reorderable Status List */}
            <div className="p-4 space-y-2 max-h-[460px] overflow-y-auto">
              {sortableStatuses.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold text-slate-800 hover:border-slate-400 transition-colors group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color || '#22c55e' }}
                    />
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMoveSortItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white disabled:opacity-20 cursor-pointer"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSortItem(index, 'down')}
                      disabled={index === sortableStatuses.length - 1}
                      className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-white disabled:opacity-20 cursor-pointer"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Update Button */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
              <button
                type="button"
                onClick={handleSaveSortedOrder}
                className="px-5 py-1.5 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB: ORDER TYPE (Cezcon Layout)
          ========================================================================= */}
      {activeSubTab === 'type' && (
        <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
            <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
              <Briefcase className="w-4 h-4 text-slate-600" />
              <span>Order Type</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  saveOrderTypes(CEZCON_ORDER_TYPES_DATA);
                  showToast('Reset order types to default.');
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-slate-200/60 transition-colors"
              >
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={handleOpenAddType}
                id="btn-add-order-type"
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                + Order Type
              </button>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 text-xs bg-white">
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Show</span>
              <select
                value={typeRowsPerPage}
                onChange={(e) => {
                  setTypeRowsPerPage(Number(e.target.value));
                  setTypeCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-slate-600">Rows</span>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search"
                value={typeSearch}
                onChange={(e) => {
                  setTypeSearch(e.target.value);
                  setTypeCurrentPage(1);
                }}
                className="w-full pl-3 pr-8 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-xs">
                <tr>
                  <th className="py-2.5 px-6 w-24 text-center border-r border-slate-200">SL..No</th>
                  <th className="py-2.5 px-6 border-r border-slate-200">Type</th>
                  <th className="py-2.5 px-6 w-28 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">
                      No order types found matching "{typeSearch}"
                    </td>
                  </tr>
                ) : (
                  paginatedTypes.map((item, index) => {
                    const slNo = (typeCurrentPage - 1) * typeRowsPerPage + index + 1;
                    const isDropdownOpen = openTypeDropdownId === item.id;
                    const isActive = item.active !== false;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-2.5 px-6 text-center font-medium text-slate-700 border-r border-slate-200">
                          {slNo}
                        </td>
                        <td className="py-2.5 px-6 font-bold text-slate-900 border-r border-slate-200">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {!isActive && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
                                Inactive
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-6 text-center relative">
                          <div className="inline-block relative dropdown-action-container text-left">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenTypeDropdownId(isDropdownOpen ? null : item.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded bg-[#0F3652] hover:bg-[#1E4E79] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {isDropdownOpen && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-md shadow-lg z-50 py-1 text-xs divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditType(item)}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleTypeActive(item.id)}
                                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                                >
                                  {isActive ? (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-amber-500" />
                                      <span>Deactivate</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                      <span>Activate</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenTypeDropdownId(null);
                                    setTypeToDelete(item);
                                    setIsTypeDeleteModalOpen(true);
                                  }}
                                  className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
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

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 border-t border-slate-200 text-xs text-slate-600 bg-white">
            <div>
              Showing {filteredTypes.length > 0 ? (typeCurrentPage - 1) * typeRowsPerPage + 1 : 0} to{' '}
              {Math.min(typeCurrentPage * typeRowsPerPage, filteredTypes.length)} of {filteredTypes.length} entries
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTypeCurrentPage((p) => Math.max(1, p - 1))}
                disabled={typeCurrentPage === 1}
                className={`px-2 py-1 rounded border text-xs ${
                  typeCurrentPage === 1
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                «
              </button>

              {Array.from({ length: totalTypePages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setTypeCurrentPage(pageNum)}
                  className={`px-2.5 py-1 rounded text-xs font-bold ${
                    typeCurrentPage === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setTypeCurrentPage((p) => Math.min(totalTypePages, p + 1))}
                disabled={typeCurrentPage === totalTypePages}
                className={`px-2 py-1 rounded border text-xs ${
                  typeCurrentPage === totalTypePages
                    ? 'border-slate-200 text-slate-300 cursor-not-allowed'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-TAB: AMC YEAR SETTINGS
          ========================================================================= */}
      {activeSubTab === 'amc' && (
        <Card className="border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">AMC Year & Maintenance Contract Terms</h3>
              <p className="text-xs text-slate-500">Configure annual contract lengths, scheduled preventive visits, and coverage tiers.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Contract Plan</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Scheduled Visits</th>
                  <th className="py-2.5 px-4">Coverage Type</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_AMC_YEARS.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono font-medium">{item.durationMonths} Months</td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{item.visitsPerYear} Preventive Visits/Year</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600 font-bold text-xs">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          SUB-TAB: CANCELLATION REASONS
          ========================================================================= */}
      {activeSubTab === 'cancellation' && (
        <Card className="border-slate-200 bg-white p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Order Cancellation & Return Reasons</h3>
              <p className="text-xs text-slate-500">Configure standardized drop reasons for cancelled quotations, delivery notes, and return RMAs.</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4 w-16 text-center">#</th>
                  <th className="py-2.5 px-4">Cancellation Reason</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_CANCELLATION_REASONS.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.reason}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-emerald-600 font-bold text-xs">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT ORDER STATUS
          ========================================================================= */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={editingStatusId !== null ? 'Edit Order Status' : 'Add Order Status'}
        description="Configure order lifecycle status and tracking color bar."
        icon={
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <ShoppingBag className="w-5 h-5" />
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Order Status Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Completed, On Progress"
              value={statusFormData.name}
              onChange={(e) => {
                setStatusFormData({ ...statusFormData, name: e.target.value });
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          {/* Color Code Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Color Code Bar
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {PRESET_STATUS_COLORS.map((preset) => {
                const isSelected = statusFormData.color.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setStatusFormData({ ...statusFormData, color: preset.hex })}
                    className={`flex items-center gap-2 p-2 rounded border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-xs shrink-0"
                      style={{ backgroundColor: preset.hex }}
                    />
                    <span className="truncate">{preset.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="color"
                value={statusFormData.color}
                onChange={(e) => setStatusFormData({ ...statusFormData, color: e.target.value })}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={statusFormData.color}
                onChange={(e) => setStatusFormData({ ...statusFormData, color: e.target.value })}
                className="w-24 px-2 py-1 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="#22c55e"
              />
              <span className="text-[11px] text-slate-400">Custom hex color</span>
            </div>
          </div>

          {/* Color Preview Bar */}
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-600">Table Preview Bar:</div>
            <div
              className="w-32 h-5 rounded-xs border border-slate-300 shadow-2xs"
              style={{ backgroundColor: statusFormData.color || '#22c55e' }}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {editingStatusId !== null ? 'Save Changes' : 'Create Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL: DELETE ORDER STATUS
          ========================================================================= */}
      <Modal
        isOpen={isStatusDeleteModalOpen}
        onClose={() => setIsStatusDeleteModalOpen(false)}
        title="Delete Order Status"
        description="Are you sure you want to remove this status?"
        icon={<Trash2 className="w-5 h-5 text-rose-600" />}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            Deleting <span className="font-bold text-slate-900">{statusToDelete?.name}</span> will remove it from the order status list.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsStatusDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirmDeleteStatus}
            >
              Delete Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================================
          MODAL: ADD / EDIT ORDER TYPE
          ========================================================================= */}
      <Modal
        isOpen={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title={editingTypeId !== null ? 'Edit Order Type' : 'Add Order Type'}
        description="Configure commercial order classification and scope."
        icon={
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Briefcase className="w-5 h-5" />
          </div>
        }
        maxWidth="md"
      >
        <form onSubmit={handleSaveType} className="space-y-4 pt-1">
          {errorMessage && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Order Type Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Service – On Call"
              value={typeFormData.name}
              onChange={(e) => {
                setTypeFormData({ ...typeFormData, name: e.target.value });
                if (errorMessage) setErrorMessage(null);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Describe scope..."
              value={typeFormData.description}
              onChange={(e) => setTypeFormData({ ...typeFormData, description: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTypeModalOpen(false)}
            >
              Cancel
            </Button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {editingTypeId !== null ? 'Save Changes' : 'Create Order Type'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL: DELETE ORDER TYPE
          ========================================================================= */}
      <Modal
        isOpen={isTypeDeleteModalOpen}
        onClose={() => setIsTypeDeleteModalOpen(false)}
        title="Delete Order Type"
        description="Are you sure you want to remove this order type?"
        icon={<Trash2 className="w-5 h-5 text-rose-600" />}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-600">
            Deleting <span className="font-bold text-slate-900">{typeToDelete?.name}</span> will remove it from the order type list.
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsTypeDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={handleConfirmDeleteType}
            >
              Delete Type
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
