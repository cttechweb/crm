'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  Play,
  Square,
  X,
  FileSpreadsheet,
  Trash2,
  Search,
  Building2,
  Briefcase,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { WorkerTimesheetEntry, WorkerShiftAttendance } from '@/types/worker';
import { CrmTask } from '@/types/enterprise-crm';

export default function WorkerTimesheetPage() {
  const { tasks: crmTasks } = useEnterpriseCrm();
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [timesheet, setTimesheet] = useState<WorkerTimesheetEntry[]>([]);
  const [attendance, setAttendance] = useState<WorkerShiftAttendance | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskNumber, setTaskNumber] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [regularHours, setRegularHours] = useState(4.0);
  const [overtimeHours, setOvertimeHours] = useState(0.0);
  const [workSummary, setWorkSummary] = useState('');

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user) setCurrentUser(user);

    setTimesheet(workerMockService.getTimesheet());
    setAttendance(workerMockService.getAttendance());
  }, []);

  const handleToggleClock = () => {
    const updated = workerMockService.toggleClockIn();
    setAttendance({ ...updated });
  };

  const handleSelectTask = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setTaskNumber('');
      setTaskTitle('');
      setClientName('');
      return;
    }
    const match = crmTasks.find((t) => t.id === selectedId);
    if (match) {
      setTaskNumber(match.id);
      setTaskTitle(match.taskDetails || match.taskType || 'Field Task');
      setClientName(match.customer || match.location || 'Cool Tech Operations');
    }
  };

  const handleAddTimesheet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    workerMockService.addTimesheetEntry({
      date,
      taskNumber: taskNumber.trim() || `TSK-${Math.floor(1000 + Math.random() * 9000)}`,
      taskTitle: taskTitle.trim(),
      clientName: clientName.trim() || 'Cool Tech Operations',
      regularHours: Number(regularHours) || 0,
      overtimeHours: Number(overtimeHours) || 0,
      workSummary: workSummary.trim() || 'Work activity completed.',
    });

    setTimesheet(workerMockService.getTimesheet());
    setIsLogModalOpen(false);
    setTaskNumber('');
    setTaskTitle('');
    setClientName('');
    setWorkSummary('');
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to remove this work entry?')) {
      workerMockService.deleteTimesheetEntry(id);
      setTimesheet(workerMockService.getTimesheet());
    }
  };

  const totalRegular = timesheet.reduce((acc, t) => acc + (Number(t.regularHours) || 0), 0);
  const totalOvertime = timesheet.reduce((acc, t) => acc + (Number(t.overtimeHours) || 0), 0);

  const filtered = timesheet.filter(
    (t) =>
      t.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.date.includes(searchQuery)
  );

  const userTasks = (crmTasks || []).filter(
    (t: CrmTask) =>
      !currentUser?.name ||
      t.assignee?.name?.toLowerCase() === currentUser.name.toLowerCase()
  );

  return (
    <WorkerShell
      title="Timesheet & Work Logs"
      subtitle="Track active work hours, daily task execution, and overtime logs"
    >
      <div className="space-y-4 w-full">
        {/* ── TOP ACTION & SHIFT BAR ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {attendance?.todayDate || new Date().toLocaleDateString('en-GB')}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${attendance?.isClockedIn
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${attendance?.isClockedIn ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                  />
                  {attendance?.isClockedIn ? 'Shift Active' : 'Shift Paused'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clocked at {attendance?.clockInTime || '08:00 AM'} • {attendance?.currentLocation || 'Operations Depot'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={handleToggleClock}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${attendance?.isClockedIn
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
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
                  <span>Clock In</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsLogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001E33] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Work Hours</span>
            </button>
          </div>
        </div>

        {/* ── 3 CLEAN METRIC SUMMARY CARDS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 block">Regular Hours Logged</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{totalRegular.toFixed(1)} hrs</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 block">Overtime Logged</span>
            <div className="text-xl font-bold text-indigo-700 mt-0.5">+{totalOvertime.toFixed(1)} hrs</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 block">Total Work Entries</span>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{timesheet.length} Logged</div>
          </div>
        </div>

        {/* ── TIMESHEET ENTRIES TABLE ── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Work Log History
              </h3>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <Clock className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-medium text-slate-600">No timesheet entries recorded.</p>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(true)}
                className="text-blue-600 hover:underline font-semibold"
              >
                + Log your first work entry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Date</th>
                    <th className="py-2.5 px-3.5">Task / Work Title</th>
                    <th className="py-2.5 px-3.5">Client / Site</th>
                    <th className="py-2.5 px-2.5 text-center">Regular</th>
                    <th className="py-2.5 px-2.5 text-center">Overtime</th>
                    <th className="py-2.5 px-3.5">Summary</th>
                    <th className="py-2.5 px-2.5 text-center">Status</th>
                    <th className="py-2.5 px-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-700 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                            {entry.taskNumber}
                          </span>
                          <span className="font-semibold text-slate-800">{entry.taskTitle}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 whitespace-nowrap">
                        {entry.clientName}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-semibold text-slate-800">
                        {entry.regularHours}h
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-semibold text-indigo-700">
                        {entry.overtimeHours > 0 ? `+${entry.overtimeHours}h` : '0h'}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-500 max-w-[200px] truncate">
                        {entry.workSummary}
                      </td>
                      <td className="py-2.5 px-2.5 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${entry.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(entry.id)}
                          title="Remove Entry"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL: Log Work Hours ── */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsLogModalOpen(false)} />
          <div className="relative z-10 bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden text-xs">
            <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-sm">Log Work Hours</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTimesheet} className="p-4 space-y-3.5">
              {/* Select assigned task shortcut */}
              {userTasks.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Select From Assigned Tasks (Optional)
                  </label>
                  <select
                    onChange={handleSelectTask}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">-- Choose Assigned Task or Enter Custom Below --</option>
                    {userTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.id} — {t.taskDetails || t.taskType}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Work Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Task / Ref #</label>
                  <input
                    type="text"
                    placeholder="e.g. TSK-1042"
                    value={taskNumber}
                    onChange={(e) => setTaskNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Work Title / Task Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HVAC Maintenance & Inspection"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Client / Site Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cool Tech Operations / Downtown Site"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Regular Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={regularHours}
                    onChange={(e) => setRegularHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Overtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700">Work Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of activities completed..."
                  value={workSummary}
                  onChange={(e) => setWorkSummary(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3.5 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Submit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkerShell>
  );
}
