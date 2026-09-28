'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wrench,
  Clock,
  Play,
  Square,
  CheckCircle2,
  AlertCircle,
  Phone,
  Truck,
  MapPin,
  Flame,
  ArrowRight,
  User,
} from 'lucide-react';
import { workerMockService } from '@/services/workerMockService';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { WorkerShiftAttendance, WorkerTask } from '@/types/worker';

interface WorkerShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export function WorkerShell({ children, title, subtitle }: WorkerShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [attendance, setAttendance] = useState<WorkerShiftAttendance | null>(null);
  const [activeTask, setActiveTask] = useState<WorkerTask | null>(null);
  const [timeElapsedStr, setTimeElapsedStr] = useState('08:00 AM');

  useEffect(() => {
    setMounted(true);
    const user = authMockService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const att = workerMockService.getAttendance();
    setAttendance(att);

    const tasks = workerMockService.getTasks();
    const current = tasks.find((t) => t.status === 'In Progress') || tasks.find((t) => t.status === 'Accepted');
    if (current) setActiveTask(current);

    const interval = setInterval(() => {
      const now = new Date();
      const hrs = String(now.getHours() % 12 || 12).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
      setTimeElapsedStr(`${hrs}:${mins}:${secs} ${ampm}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleClock = () => {
    const updated = workerMockService.toggleClockIn();
    setAttendance({ ...updated });
  };

  const displayName = currentUser?.name || 'Jordan Hayes';
  const displayRole = currentUser?.designation || 'Field Operations Specialist';

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-150">
      {/* ── Level 1: Employee Operational Status Bar ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Shift & Attendance Status */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] font-bold text-sm">
              {displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">{displayName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Employee
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500">
                  <Truck className="w-3 h-3 text-slate-400" />
                  Van #07 (DXB 48291)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      attendance?.isClockedIn ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {attendance?.isClockedIn ? 'Shift Active (Clocked In)' : 'Shift Paused / Clocked Out'}
                </span>
                <span>•</span>
                <span>Clocked at {attendance?.clockInTime || '08:00 AM'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clock In / Out Button */}
          <button
            type="button"
            onClick={handleToggleClock}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer ${
              attendance?.isClockedIn
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {attendance?.isClockedIn ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Clock Out</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Clock In Now</span>
              </>
            )}
          </button>

          {/* Active Job Shortcut */}
          {activeTask && (
            <Link
              href="/worker/tasks/active"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold shadow-xs transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Active Job ({activeTask.taskNumber})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {/* Emergency / Helpline */}
          <a
            href="tel:+971548129901"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
            title="Emergency Ops Dispatch"
          >
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Dispatch Helpline</span>
          </a>
        </div>
      </div>

      {/* ── Level 2: Sub-module Title Bar ── */}
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/worker/materials?action=new"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <span>+ Request Material</span>
            </Link>
            <Link
              href="/worker/tasks"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>My Tasks</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full">{children}</div>
    </div>
  );
}
