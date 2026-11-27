'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Save, CheckCircle } from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

export function RbacTab() {
  const { rbacRules } = useEnterpriseCrm();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Card className="border-slate-200 bg-white p-5 space-y-4">
      {saveSuccess && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> RBAC Matrix saved successfully.
        </div>
      )}

      <div>
        <h3 className="font-bold text-sm text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure module privileges for Super Admin, Admin, Manager, and Employee / Worker roles.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">CRM Module</th>
              <th className="py-3 px-3 text-center">View</th>
              <th className="py-3 px-3 text-center">Create</th>
              <th className="py-3 px-3 text-center">Edit</th>
              <th className="py-3 px-3 text-center">Delete</th>
              <th className="py-3 px-3 text-center">Assign</th>
              <th className="py-3 px-3 text-center">Approve</th>
              <th className="py-3 px-3 text-center">Export</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rbacRules.map((rule) => (
              <tr key={rule.module} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-bold text-slate-900">{rule.module}</td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.view} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.create} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.edit} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.delete} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.assign} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.approve} className="rounded text-blue-600" /></td>
                <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked={rule.export} className="rounded text-blue-600" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button onClick={handleSave} variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />}>
        Save RBAC Matrix
      </Button>
    </Card>
  );
}
