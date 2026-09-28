'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { TASK_TYPES } from '@/data/settingsMockData';

export function TaskSettingsTab() {
  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Task Types & SLA Templates</h3>
          <p className="text-xs text-slate-500">Configure task types, standard checklists, and automated notification triggers.</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />}>
          Add Task Type
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Icon</th>
              <th className="py-3 px-4">Task Type</th>
              <th className="py-3 px-4">Color Identifier</th>
              <th className="py-3 px-4">Default Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {TASK_TYPES.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 text-base">{task.icon}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{task.name}</td>
                <td className="py-3 px-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: task.color }}
                  >
                    {task.name}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600 font-medium">Normal (24h)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
