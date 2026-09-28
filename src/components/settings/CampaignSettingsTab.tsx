'use client';

import React, { useState } from 'react';
import { Megaphone, Receipt, CheckCircle2, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import {
  CEZCON_CAMPAIGN_TYPES_DATA,
  CEZCON_EXPENSE_TYPES_DATA,
  CEZCON_CAMPAIGN_STATUSES_DATA,
  CAMPAIGN_SETTINGS,
} from '@/data/settingsMockData';

export function CampaignSettingsTab() {
  const [activeSubTab, setActiveSubTab] = useState<'type' | 'expense' | 'status'>('type');
  const [campaignTypes, setCampaignTypes] = useState(CEZCON_CAMPAIGN_TYPES_DATA);
  const [expenseTypes, setExpenseTypes] = useState(CEZCON_EXPENSE_TYPES_DATA);
  const [statuses, setStatuses] = useState(CEZCON_CAMPAIGN_STATUSES_DATA);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const subTabs = [
    { id: 'type' as const, label: 'Campaign Type', icon: Megaphone },
    { id: 'expense' as const, label: 'Expense Type', icon: Receipt },
    { id: 'status' as const, label: 'Campaign Status', icon: CheckCircle2 },
  ];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (activeSubTab === 'type') {
      setCampaignTypes([...campaignTypes, { id: Date.now(), name: newItemName.trim() }]);
    } else if (activeSubTab === 'expense') {
      setExpenseTypes([...expenseTypes, { id: Date.now(), name: newItemName.trim() }]);
    } else {
      setStatuses([...statuses, { id: Date.now(), name: newItemName.trim(), color: '#2563EB' }]);
    }

    setNewItemName('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/80 border border-slate-200 rounded-md overflow-x-auto text-xs">
        {subTabs.map((sub) => {
          const Icon = sub.icon;
          const isActive = activeSubTab === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubTab(sub.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-bold text-xs whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {sub.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#F1F5F9] border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-xs text-slate-800">
            <Megaphone className="w-4 h-4 text-slate-600" />
            <span>
              {activeSubTab === 'type' ? 'Campaign Types' : activeSubTab === 'expense' ? 'Campaign Expense Types' : 'Campaign Statuses'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + ADD
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
              <tr>
                <th className="py-2.5 px-3 text-center w-16">SL.No</th>
                <th className="py-2.5 px-4">Name / Title</th>
                {activeSubTab === 'status' && <th className="py-2.5 px-4">Color Badge</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSubTab === 'type' &&
                campaignTypes.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{item.name}</td>
                  </tr>
                ))}
              {activeSubTab === 'expense' &&
                expenseTypes.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{item.name}</td>
                  </tr>
                ))}
              {activeSubTab === 'status' &&
                statuses.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">{idx + 1}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-4">
                      <span className="px-2 py-0.5 rounded text-white text-[10px] font-bold" style={{ backgroundColor: item.color }}>
                        {item.name}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-xs p-4 space-y-3">
        <h3 className="font-bold text-xs text-slate-800">Campaign Automation & Policy Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {CAMPAIGN_SETTINGS.map((setting) => (
            <div key={setting.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
              <label className="text-slate-500 font-medium block">{setting.key}</label>
              <input
                type={setting.type}
                defaultValue={setting.value}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-semibold text-xs"
              />
            </div>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={`Add ${activeSubTab === 'type' ? 'Campaign Type' : activeSubTab === 'expense' ? 'Expense Type' : 'Campaign Status'}`}
        >
          <form onSubmit={handleAddItem} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="Enter title"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-3 py-1.5 border rounded">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
