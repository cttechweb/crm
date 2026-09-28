'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  FilePlus,
  FileCheck,
  Truck,
  Tag,
  Boxes,
  ArrowDownToLine,
  DollarSign,
  Package,
  FileText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

function ManagerPurchaseContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(currentTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { purchaseStocks, addStockItem } = useEnterpriseCrm();

  const [poList, setPoList] = useState<Array<{ id: string; supplier: string; date: string; amount: string; items: number; status: string }>>([
    { id: 'PO-2026-089', supplier: 'Al Futtaim HVAC Supplies', date: '2026-09-24', amount: 'AED 45,200', items: 12, status: 'Approved' },
    { id: 'PO-2026-088', supplier: 'Danfoss Middle East FZCO', date: '2026-09-22', amount: 'AED 18,750', items: 4, status: 'In Transit' },
    { id: 'PO-2026-087', supplier: 'Carrier UAE Distribution', date: '2026-09-20', amount: 'AED 84,000', items: 8, status: 'Delivered' },
  ]);

  const [materialRequests, setMaterialRequests] = useState<Array<{ id: string; tech: string; part: string; qty: string; urgent: boolean; project: string; status: string }>>([
    { id: 'REQ-401', tech: 'Tariq Mansour', part: 'R410A Refrigerant Cylinders (13.6kg)', qty: '4 units', urgent: true, project: 'Emaar Hospitality Tower Chiller', status: 'Pending Review' },
    { id: 'REQ-402', tech: 'Zayed Al Qasimi', part: 'Copeland Scroll Compressor 5HP', qty: '1 unit', urgent: true, project: 'Dubai Marina Mall FCU Overhaul', status: 'Approved' },
  ]);

  const [poForm, setPoForm] = useState({
    supplier: '',
    amount: 'AED 25,000',
    items: 5,
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poForm.supplier) return;

    const newPo = {
      id: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      supplier: poForm.supplier,
      date: new Date().toISOString().split('T')[0],
      amount: poForm.amount,
      items: Number(poForm.items),
      status: 'Approved',
    };

    setPoList([newPo, ...poList]);
    setIsAddModalOpen(false);
    showToast(`Purchase Order ${newPo.id} created successfully!`);
    setPoForm({
      supplier: '',
      amount: 'AED 25,000',
      items: 5,
    });
  };

  const handleApproveMaterial = (reqId: string) => {
    setMaterialRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Approved' } : r))
    );
    showToast(`Material Requisition ${reqId} approved and allocated to technician!`);
  };

  const handleRejectMaterial = (reqId: string) => {
    setMaterialRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Rejected' } : r))
    );
    showToast(`Material Requisition ${reqId} rejected`);
  };

  const tabs = [
    { id: 'orders', label: 'Purchase Orders', icon: FilePlus, count: String(poList.length) },
    { id: 'stock', label: 'Stock / Inventory', icon: Boxes, count: String(purchaseStocks.length) },
    { id: 'request-material', label: 'Request Material', icon: Package, count: String(materialRequests.length) },
  ];

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-12">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-[#1677FF]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Purchase &amp; Inventory Operations
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage procurement, supplier orders, parts inventory, stock movement, and field technician requisitions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count && (
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold',
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search POs, parts, or suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>
      </div>

      {/* Content Area */}
      {activeTab === 'request-material' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Field Material Requisitions &amp; Approvals</h2>
            <span className="text-xs text-slate-500">{materialRequests.length} Active Requests</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Req ID</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Part / Item Required</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Linked Job / Site</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {materialRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{req.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{req.tech}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{req.part}</td>
                    <td className="py-3 px-4 font-bold">{req.qty}</td>
                    <td className="py-3 px-4 text-slate-600">{req.project}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'Pending Review' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApproveMaterial(req.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRejectMaterial(req.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold text-[11px] hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Dispatched</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'stock' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Inventory Stocks</h2>
            <span className="text-xs text-slate-500">{purchaseStocks.length} Stock Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Store</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Unit Price</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {purchaseStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No stock records found.
                    </td>
                  </tr>
                ) : (
                  purchaseStocks.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.productName}</td>
                      <td className="py-3 px-4 text-slate-500">{s.sku}</td>
                      <td className="py-3 px-4 font-medium">{s.store}</td>
                      <td className="py-3 px-4 font-bold">{s.quantity}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">AED {s.unitPrice}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Purchase Orders Register</h2>
            <span className="text-xs text-slate-500">{poList.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total Value</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {poList.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600">{po.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{po.supplier}</td>
                    <td className="py-3 px-4 text-slate-600">{po.date}</td>
                    <td className="py-3 px-4 font-medium">{po.items} items</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{po.amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                          po.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : po.status === 'Approved'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        )}
                      >
                        {po.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create Purchase Order</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePo} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
                <input
                  type="text"
                  required
                  value={poForm.supplier}
                  onChange={(e) => setPoForm({ ...poForm, supplier: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  placeholder="e.g. Danfoss Middle East FZCO"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount</label>
                  <input
                    type="text"
                    required
                    value={poForm.amount}
                    onChange={(e) => setPoForm({ ...poForm, amount: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Number of Items</label>
                  <input
                    type="number"
                    required
                    value={poForm.items}
                    onChange={(e) => setPoForm({ ...poForm, items: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold">
                  Generate PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagerPurchasePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Purchase module...</div>}>
      <ManagerPurchaseContent />
    </Suspense>
  );
}
