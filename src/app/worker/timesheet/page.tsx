'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Plus,
  Play,
  Square,
  Coffee,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { WorkerTimesheetEntry, WorkerShiftAttendance } from '@/types/worker';

export default function WorkerTimesheetPage() {
  const [timesheet, setTimesheet] = useState<WorkerTimesheetEntry[]>([]);
  const [attendance, setAttendance] = useState<WorkerShiftAttendance | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskNumber, setTaskNumber] = useState('TSK-8921');
  const [taskTitle, setTaskTitle] = useState('Chiller Compressor Pressure Restoration');
  const [clientName, setClientName] = useState('Emaar Hospitality Group');
  const [regularHours, setRegularHours] = useState(4.0);
  const [overtimeHours, setOvertimeHours] = useState(0.0);
  const [workSummary, setWorkSummary] = useState('');

  useEffect(() => {
    setTimesheet(workerMockService.getTimesheet());
    setAttendance(workerMockService.getAttendance());
  }, []);

  const handleToggleClock = () => {
    const updated = workerMockService.toggleClockIn();
    setAttendance({ ...updated });
  };

  const handleAddTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNumber.trim() || !taskTitle.trim()) return;

    workerMockService.addTimesheetEntry({
      date,
      taskNumber: taskNumber.trim(),
      taskTitle: taskTitle.trim(),
      clientName: clientName.trim(),
      regularHours: Number(regularHours) || 0,
      overtimeHours: Number(overtimeHours) || 0,
      workSummary: workSummary.trim() || 'HVAC field servicing completed.',
    });

    setTimesheet(workerMockService.getTimesheet());
    setIsLogModalOpen(false);
    setWorkSummary('');
  };

  const totalRegular = timesheet.reduce((acc, t) => acc + t.regularHours, 0);
  const totalOvertime = timesheet.reduce((acc, t) => acc + t.overtimeHours, 0);

  return (
    <WorkerShell
      title="Timesheet &amp; Daily Work Logs"
      subtitle="Track active shift hours, daily job labor time, and overtime logs for operations approval"
    >
      <div className="space-y-6">
        {/* ── SECTION 1: ATTENDANCE & SHIFT CLOCK ── */}
        <div className="bg-gradient-to-r from-[#002B49] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  attendance?.isClockedIn ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
                }`}
              />
              <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                {attendance?.isClockedIn ? 'SHIFT IS ACTIVE' : 'SHIFT CLOCKED OUT'}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                {attendance?.todayDate || 'Today'}
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-2xl sm:text-3xl font-black tracking-tight">
                Clocked In at: {attendance?.clockInTime || '08:00 AM'}
              </div>
            </div>
            <p className="text-xs text-blue-200">
              Location: {attendance?.currentLocation || 'Downtown Dubai Field Depot'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleClock}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                attendance?.isClockedIn
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {attendance?.isClockedIn ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  <span>Clock Out Shift</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Clock In Shift</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Log Task Hours</span>
            </button>
          </div>
        </div>

        {/* ── SECTION 2: MONTHLY SUMMARY STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Regular Hours Logged</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalRegular.toFixed(1)} hrs</div>
            <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Verified</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Overtime (1.5x)</span>
            <div className="text-2xl font-black text-indigo-600 mt-1">+{totalOvertime.toFixed(1)} hrs</div>
            <p className="text-[11px] text-slate-400 mt-1">Approved by Operations</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Total Work Entries</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{timesheet.length} Jobs</div>
            <p className="text-[11px] text-blue-600 font-semibold mt-1">This Month</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block">Approval Status</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">Approved</div>
            <p className="text-[11px] text-slate-400 mt-1">Payroll Cycle Active</p>
          </div>
        </div>

        {/* ── SECTION 3: TIMESHEET TABLE ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Job Timesheet Entries</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Log Work Time</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Task # &amp; Work Title</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-3 text-center">Regular (Hrs)</th>
                  <th className="py-3 px-3 text-center">Overtime (Hrs)</th>
                  <th className="py-3 px-4">Work Summary</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timesheet.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{entry.date}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] mr-1.5 border border-blue-200">
                        {entry.taskNumber}
                      </span>
                      <span className="font-bold text-slate-900">{entry.taskTitle}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{entry.clientName}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-900">{entry.regularHours}h</td>
                    <td className="py-3 px-3 text-center font-bold text-indigo-700">
                      {entry.overtimeHours > 0 ? `+${entry.overtimeHours}h` : '0h'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 line-clamp-1">{entry.workSummary}</td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          entry.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Log Hours Modal ── */}
        {isLogModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Log Daily Job Labor Hours</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="w-6 h-6 rounded-md bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleAddTimesheet} className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Work Date:</label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Task / Order #:</label>
                    <input
                      type="text"
                      required
                      value={taskNumber}
                      onChange={(e) => setTaskNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Job Title Description:</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Client / Site Name:</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Regular Labor Hours:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      required
                      value={regularHours}
                      onChange={(e) => setRegularHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Overtime Hours:</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={overtimeHours}
                      onChange={(e) => setOvertimeHours(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 block">Work Summary &amp; Handover Notes:</label>
                  <textarea
                    rows={2}
                    placeholder="Briefly describe what was accomplished on-site..."
                    value={workSummary}
                    onChange={(e) => setWorkSummary(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLogModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    Submit Work Entry
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </WorkerShell>
  );
}
