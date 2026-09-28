'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Plus, Bell } from 'lucide-react';

interface ManagerShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function ManagerShell({ children, title, subtitle }: ManagerShellProps) {
  return (
    <div className="w-full space-y-5 animate-in fade-in duration-150">
      {/* Dynamic Header for Manager Submodules */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3 text-blue-600" />
                Operations Manager
              </span>
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/manager/tasks?view=assign"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Assign Task</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
