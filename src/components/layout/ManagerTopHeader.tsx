'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Search,
  Plus,
  LogOut,
  Sliders,
  CheckCircle2,
  Calendar as CalendarIcon,
  ShieldCheck,
  User,
} from 'lucide-react';
import { authMockService } from '@/services/authMockService';

interface ManagerTopHeaderProps {
  title?: string;
  subtitle?: string;
}

export function ManagerTopHeader({
  title = 'Operations Command Center',
  subtitle = 'Overview of active technicians, daily workload, and SLA escalations',
}: ManagerTopHeaderProps) {
  const router = useRouter();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const currentUser = authMockService.getCurrentUser() || {
    name: 'Alex Rivera',
    email: 'manager@cooltechuae.com',
    designation: 'Operations Manager',
  };

  const handleSignOut = async () => {
    await authMockService.logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      {/* Title & Role Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-base font-bold text-slate-900 tracking-tight">{title}</h1>
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200">
            <ShieldCheck className="w-3 h-3 text-blue-600" />
            Operations Manager
          </span>
        </div>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Search leads, tasks, technicians..."
            className="h-9 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>

        {/* Quick Assign Task Button */}
        <Link
          href="/manager/tasks?view=assign"
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Assign Task</span>
        </Link>

        {/* Notifications */}
        <Link
          href="/manager/notifications"
          className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </div>
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {currentUser.designation || 'Operations Manager'}
                </span>
              </div>

              <Link
                href="/manager/settings?tab=profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/manager/settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                <span>Preferences</span>
              </Link>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100 mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
