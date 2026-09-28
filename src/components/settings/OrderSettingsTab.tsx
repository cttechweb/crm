'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { ORDER_STATUSES } from '@/data/settingsMockData';

export function OrderSettingsTab() {
  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Order Management & Fulfillment Statuses</h3>
          <p className="text-xs text-slate-500">Configure order lifecycle stages, AMC year options, and cancellation reasons.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Add Order Status
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Status Name</th>
              <th className="py-3 px-4">Visual Indicator</th>
              <th className="py-3 px-4">Active Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ORDER_STATUSES.map((status) => (
              <tr key={status.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{status.name}</td>
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-emerald-600 font-semibold">Active</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
