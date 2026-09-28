'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Sun,
  ClipboardList,
  CheckCircle2,
  Clock,
  BarChart2,
  ChevronRight,
  Play,
  Check,
  FileText,
  Image as ImageIcon,
  Package,
  Building2,
  MapPin,
  Truck,
  Plus,
  ArrowRight,
  TrendingUp,
  Wrench,
  Users,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { authMockService } from '@/services/authMockService';

export default function EmployeeDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('Shaheer');
  const [currentTimeStr, setCurrentTimeStr] = useState('08:32 AM');
  const [currentDateStr, setCurrentDateStr] = useState('Wednesday, 24 Sep 2026');
  const [greeting, setGreeting] = useState('Good Morning');
  const [currentTaskCompleted, setCurrentTaskCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = authMockService.getCurrentUser();
    if (user?.name) {
      setUserName(user.name);
    }

    const updateClock = () => {
      const now = new Date();
      const hrs = now.getHours();
      if (hrs < 12) setGreeting('Good Morning');
      else if (hrs < 17) setGreeting('Good Afternoon');
      else setGreeting('Good Evening');

      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      };
      setCurrentDateStr(now.toLocaleDateString('en-US', options));

      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTimeStr(now.toLocaleTimeString('en-US', timeOptions));
    };

    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-[600px] flex items-center justify-center text-slate-400 text-xs">
        Loading Employee Dashboard...
      </div>
    );
  }

  const initialLetter = userName.charAt(0).toUpperCase() || 'S';

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-in fade-in duration-200 pb-12 overflow-x-hidden">
      {/* ── 1. TOP GREETING BANNER ── */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: User Avatar & Greeting */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#E8F1FD] text-[#1677FF] font-black text-xl sm:text-2xl flex items-center justify-center flex-shrink-0 shadow-2xs">
            {initialLetter}
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>{greeting}, {userName}!</span>
              <span className="text-amber-500">☀️</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
              You have <span className="font-bold text-slate-700">4 tasks</span> scheduled today. Keep going — you&apos;re doing great!
            </p>
          </div>
        </div>

        {/* Right: Date/Time & Weather Badges */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Date & Time Box */}
          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2">
            <div className="text-[#1677FF]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap">{currentDateStr}</div>
              <div className="text-[11px] text-slate-400 font-medium">{currentTimeStr}</div>
            </div>
          </div>

          {/* Weather Box */}
          <div className="flex-1 sm:flex-initial flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3.5 py-2">
            <div className="text-amber-500">
              <Sun className="w-4 h-4 fill-amber-400" />
            </div>
            <div className="leading-tight text-left">
              <div className="text-xs font-bold text-slate-900 whitespace-nowrap">Dubai, UAE</div>
              <div className="text-[11px] text-slate-400 font-medium">31°C • Sunny</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. TOP 4 KPI METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1: Today's Tasks */}
        <Link
          href="/worker/tasks"
          className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all flex items-start gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Today&apos;s Tasks</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">4</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
              2 pending • 1 in progress • 1 completed
            </p>
          </div>
        </Link>

        {/* Metric 2: Completed */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Completed</span>
              <span className="text-[11px] font-bold text-[#059669] flex items-center gap-0.5 bg-[#ECFDF5] px-1.5 py-0.5 rounded">
                ↑ +100%
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {currentTaskCompleted ? '2' : '1'}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">of 4 today</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#059669] h-1.5 rounded-full transition-all duration-500"
                style={{ width: currentTaskCompleted ? '50%' : '25%' }}
              />
            </div>
          </div>
        </div>

        {/* Metric 3: Pending */}
        <Link
          href="/worker/tasks?status=Pending"
          className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-xs hover:border-amber-200 transition-all flex items-start gap-3.5 group"
        >
          <div className="w-11 h-11 rounded-xl bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Pending</span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">2</div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">tasks remaining</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-[#D97706] h-1.5 rounded-full w-1/2" />
            </div>
          </div>
        </Link>

        {/* Metric 4: My Performance */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5 group">
          <div className="w-11 h-11 rounded-xl bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">My Performance</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {currentTaskCompleted ? '88%' : '75%'}
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {currentTaskCompleted ? '4 of 4 tasks completed' : '3 of 4 tasks completed'}
            </p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#1677FF] to-[#7C3AED] h-1.5 rounded-full transition-all duration-500"
                style={{ width: currentTaskCompleted ? '88%' : '75%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. MIDDLE SECTION: TODAY'S TASKS TABLE + CURRENT TASK CARD ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left Column (8 cols): Today's Tasks Table */}
        <div className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">Today&apos;s Tasks</h2>
                  <p className="text-xs text-slate-400">Your assigned tasks for today</p>
                </div>
              </div>
              <Link
                href="/worker/tasks"
                className="text-xs font-bold text-[#1677FF] hover:text-blue-700 transition-colors"
              >
                View All
              </Link>
            </div>

            {/* Responsive Table Container */}
            <div className="overflow-x-auto mt-2 -mx-4 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[620px] sm:min-w-full">
                <thead>
                  <tr className="border-b border-[#F1F5F9] text-[11px] font-semibold text-slate-400">
                    <th className="py-3 px-3 sm:px-4">Time</th>
                    <th className="py-3 px-3 sm:px-4">Task</th>
                    <th className="py-3 px-3 sm:px-4">Customer</th>
                    <th className="py-3 px-3 sm:px-4">Status</th>
                    <th className="py-3 px-3 sm:px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC] text-xs">
                  {/* Task 1 */}
                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                      09:00 AM – 11:00 AM
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                      Emergency Chiller Compressor Fix
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600">
                      Emaar Hospitality Group
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#EBF3FE] text-[#1677FF]">
                        {currentTaskCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <Link
                        href="/worker/tasks/active"
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-2xs transition-colors"
                      >
                        Continue
                      </Link>
                    </td>
                  </tr>

                  {/* Task 2 */}
                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                      01:00 PM – 03:00 PM
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                      AC Unit Preventive Maintenance
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600">
                      Al Naboodah MEP
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
                        Pending
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <Link
                        href="/worker/tasks"
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-[#93C5FD] hover:bg-[#EFF6FF] text-[#1677FF] font-bold text-xs transition-colors"
                      >
                        Start
                      </Link>
                    </td>
                  </tr>

                  {/* Task 3 */}
                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                      03:30 PM – 05:00 PM
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                      Split AC Gas Refill
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600">
                      Luxury Castle Contracting
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
                        Pending
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <Link
                        href="/worker/tasks"
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-[#93C5FD] hover:bg-[#EFF6FF] text-[#1677FF] font-bold text-xs transition-colors"
                      >
                        Start
                      </Link>
                    </td>
                  </tr>

                  {/* Task 4 */}
                  <tr className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-3 sm:px-4 text-slate-500 whitespace-nowrap font-medium text-[11px]">
                      05:30 PM – 06:30 PM
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 font-bold text-slate-900">
                      Site Inspection
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-slate-600">
                      Golden Saif Construction
                    </td>
                    <td className="py-3.5 px-3 sm:px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#D1FAE5] text-[#059669]">
                        Completed
                      </span>
                    </td>
                    <td className="py-3.5 px-3 sm:px-4 text-right">
                      <Link
                        href="/worker/reports"
                        className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Current Task Card */}
        <div className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <CalendarIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Current Task</h3>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#ECFDF5] text-[#059669] border border-emerald-200">
                {currentTaskCompleted ? 'COMPLETED' : 'IN PROGRESS'}
              </span>
            </div>

            {/* Task Title & Details */}
            <div className="space-y-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                Emergency Chiller Compressor Fix
              </h4>

              <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="font-medium text-slate-700">Emaar Hospitality Group</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Downtown, Dubai</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>09:00 AM – 12:00 PM (3h)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span>Van #07 (DXB 48291)</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Progress</span>
                <span className="font-black text-[#1677FF]">
                  {currentTaskCompleted ? '100%' : '40%'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#1677FF] h-2 rounded-full transition-all duration-500"
                  style={{ width: currentTaskCompleted ? '100%' : '40%' }}
                />
              </div>
            </div>

            {/* Compressor Alert Note Box */}
            <div className="bg-[#F0F7FF] border border-[#BFDBFE] rounded-xl p-3 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-[#1677FF] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                Compressor 3 showing delta pressure error code E-409. Check refrigerant leak and test suction valve.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            <Link
              href="/worker/tasks/active"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continue Task</span>
            </Link>
            <button
              type="button"
              onClick={() => setCurrentTaskCompleted(!currentTaskCompleted)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{currentTaskCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. BOTTOM 3 WIDGET CARDS ROW ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* Widget 1: Recent Activities */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
              </div>
              <Link href="/worker/activities" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3.5 pt-3.5">
              {/* Activity 1 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium truncate">
                    Checked in at site <span className="text-slate-400 font-normal">(TSK-8921)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">08:05 AM</span>
              </div>

              {/* Activity 2 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#1677FF] flex items-center justify-center flex-shrink-0">
                    <FileText className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium truncate">
                    Added service note <span className="text-slate-400 font-normal">(TSK-8920)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">10:20 AM</span>
              </div>

              {/* Activity 3 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#F5F3FF] text-[#7C3AED] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium truncate">
                    Uploaded images <span className="text-slate-400 font-normal">(TSK-8920)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">02:15 PM</span>
              </div>

              {/* Activity 4 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0">
                    <Package className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium truncate">
                    Requested material <span className="text-slate-400 font-normal">(TSK-8918)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">03:40 PM</span>
              </div>

              {/* Activity 5 */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium truncate">
                    Completed job <span className="text-slate-400 font-normal">(TSK-8891)</span>
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 whitespace-nowrap">Yesterday</span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 2: My Customers */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">My Customers</h3>
              </div>
              <Link href="/worker/customers" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3.5 pt-3.5">
              {/* Customer 1 */}
              <Link
                href="/worker/customers"
                className="flex items-center justify-between group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF3C7] text-amber-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                    EH
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF] transition-colors">
                      Emaar Hospitality Group
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">4 Jobs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Customer 2 */}
              <Link
                href="/worker/customers"
                className="flex items-center justify-between group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#FEE2E2] text-rose-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                    AN
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF] transition-colors">
                      Al Naboodah MEP
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">3 Jobs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Customer 3 */}
              <Link
                href="/worker/customers"
                className="flex items-center justify-between group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-emerald-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                    LC
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF] transition-colors">
                      Luxury Castle Contracting
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">5 Jobs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              {/* Customer 4 */}
              <Link
                href="/worker/customers"
                className="flex items-center justify-between group hover:bg-[#F8FAFC] p-1.5 -mx-1.5 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#E0E7FF] text-indigo-700 flex items-center justify-center font-black text-xs flex-shrink-0">
                    GS
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1677FF] transition-colors">
                      Golden Saif Construction
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">2 Jobs</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Widget 3: Material Requests */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F1F5F9]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E8F1FD] text-[#1677FF] flex items-center justify-center">
                  <Package className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Material Requests</h3>
              </div>
              <Link href="/worker/materials" className="text-xs font-bold text-[#1677FF] hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-3">
              {/* Material 1 */}
              <div className="flex items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Package className="w-4 h-4 text-[#1677FF]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">R410A Refrigerant</div>
                    <div className="text-[11px] text-slate-400 font-medium">2 Cylinders</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  Pending
                </span>
              </div>

              {/* Material 2 */}
              <div className="flex items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <Wrench className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Compressor Oil</div>
                    <div className="text-[11px] text-slate-400 font-medium">1 Bottle</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#D1FAE5] text-[#059669]">
                  Approved
                </span>
              </div>

              {/* Material 3 */}
              <div className="flex items-center justify-between gap-2 p-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-slate-200 flex items-center justify-center text-slate-600 flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 truncate">Filter Drier</div>
                    <div className="text-[11px] text-slate-400 font-medium">3 Units</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF3C7] text-[#D97706]">
                  Pending
                </span>
              </div>
            </div>
          </div>

          {/* Request Material Action Button */}
          <div className="pt-3">
            <Link
              href="/worker/materials?action=new"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#F0F7FF] hover:bg-[#E0EFFE] text-[#1677FF] font-bold text-xs border border-[#BFDBFE] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Request Material</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
