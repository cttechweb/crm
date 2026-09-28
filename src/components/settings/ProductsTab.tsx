'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { PRODUCTS_SETTINGS } from '@/data/settingsMockData';

export function ProductsTab() {
  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Products & Inventory Master</h3>
          <p className="text-xs text-slate-500">Configure standard hardware, replacement parts, and base catalog pricing.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Add Product SKU
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">SKU Code</th>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Standard Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {PRODUCTS_SETTINGS.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.sku}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                <td className="py-3 px-4 text-slate-600">{item.category}</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">AED {item.basePrice.toLocaleString()}.00</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
