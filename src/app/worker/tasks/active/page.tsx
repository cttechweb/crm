'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wrench,
  Clock,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Building2,
  MapPin,
  Phone,
  Plus,
  Trash2,
  Star,
  FileCheck,
  Send,
  Navigation,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { WorkerTask } from '@/types/worker';

export default function WorkerActiveJobPage() {
  const router = useRouter();
  const [task, setTask] = useState<WorkerTask | null>(null);

  // Live Timer State
  const [timerRunning, setTimerRunning] = useState(true);
  const [secondsElapsed, setSecondsElapsed] = useState(6480); // 1 hr 48 mins

  // Spare parts logger
  const [newPartCode, setNewPartCode] = useState('');
  const [newPartName, setNewPartName] = useState('');
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartCost, setNewPartCost] = useState(0);

  // Sign off & Notes
  const [notes, setNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [signatureText, setSignatureText] = useState('');
  const [customerRating, setCustomerRating] = useState(5);
  const [isCompletedSuccess, setIsCompletedSuccess] = useState(false);

  useEffect(() => {
    const tasks = workerMockService.getTasks();
    const active = tasks.find((t) => t.status === 'In Progress') || tasks[0];
    if (active) {
      setTask(active);
      setNotes(active.technicianNotes || '');
      setCustomerName(active.clientName || '');
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleToggleChecklist = (checkId: string, currentVal: boolean) => {
    if (!task) return;
    const updated = workerMockService.updateTaskChecklist(task.id, checkId, !currentVal);
    if (updated) setTask({ ...updated });
  };

  const handleAddPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newPartName.trim()) return;

    const updated = workerMockService.addPartUsed(task.id, {
      partCode: newPartCode || `PRT-${Math.floor(100 + Math.random() * 900)}`,
      partName: newPartName.trim(),
      quantity: Number(newPartQty) || 1,
      unitCost: Number(newPartCost) || 0,
    });

    if (updated) {
      setTask({ ...updated });
      setNewPartName('');
      setNewPartCode('');
      setNewPartQty(1);
      setNewPartCost(0);
    }
  };

  const handleCompleteWorkOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;

    const actualHours = Number((secondsElapsed / 3600).toFixed(2));
    const updated = workerMockService.completeTaskWithSignOff(task.id, {
      customerSignedBy: customerName || task.clientName,
      customerSignature: signatureText || `${customerName || task.clientName} (Verified On-Site)`,
      notes,
      rating: customerRating,
      actualHoursSpent: actualHours,
    });

    if (updated) {
      setTask({ ...updated });
      setIsCompletedSuccess(true);
    }
  };

  if (!task) {
    return (
      <WorkerShell title="Active Job Execution">
        <div className="p-8 text-center text-slate-400">Loading active task...</div>
      </WorkerShell>
    );
  }

  return (
    <WorkerShell
      title={`Live Execution Pad — ${task.taskNumber}`}
      subtitle="Interactive field technician workspace: live job timer, step checklist, parts logger & customer sign-off"
    >
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/worker/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Tasks List</span>
          </Link>

          <span className="text-xs font-bold text-slate-500">
            Assigned Manager: <span className="text-slate-800">{task.assignedManager}</span>
          </span>
        </div>

        {/* ── SECTION 1: LIVE TIMER & STATUS HEADER ── */}
        <div className="bg-gradient-to-r from-slate-900 via-[#002B49] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                ON-SITE LABOR TIME TRACKER
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white text-[10px] font-bold">
                {task.taskNumber}
              </span>
            </div>

            <div className="flex items-baseline gap-4">
              <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {formatTimer(secondsElapsed)}
              </div>
              <span className="text-xs text-slate-400">
                (Est: {task.estimatedHours} hrs • Target: 12:30 PM)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setTimerRunning(!timerRunning)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                timerRunning
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-white'
              }`}
            >
              {timerRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause Timer</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Resume Timer</span>
                </>
              )}
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(task.address)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-300" />
              <span>Open Maps GPS</span>
            </a>
          </div>
        </div>

        {/* ── SECTION 2: 2-COLUMN EXECUTION GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Task Info + Checklist + Spare Parts */}
          <div className="lg:col-span-7 space-y-6">
            {/* Client & Work Order Context */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {task.serviceType}
                  </span>
                  <h2 className="text-base font-black text-slate-900 mt-1.5 leading-snug">{task.title}</h2>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 flex-shrink-0">
                  {task.priority} Priority
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-3 rounded-lg">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Client Name</span>
                  <span className="font-bold text-slate-900">{task.clientCompany}</span>
                  <div className="text-slate-500 mt-0.5">{task.clientName}</div>
                  <a
                    href={`tel:${task.clientPhone}`}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline mt-1"
                  >
                    <Phone className="w-3 h-3" />
                    {task.clientPhone}
                  </a>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Site Location</span>
                  <span className="font-medium text-slate-800">{task.address}</span>
                  <div className="text-slate-400 text-[11px] mt-0.5">{task.cityArea}</div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                  Diagnosis / Manager Instructions
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                  {task.description}
                </p>
              </div>
            </div>

            {/* Checklist Execution Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-slate-900">Standard Operating Checklist</h3>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {task.checklist.filter((c) => c.completed).length} of {task.checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {task.checklist.map((chk) => (
                  <label
                    key={chk.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                      chk.completed
                        ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={chk.completed}
                      onChange={() => handleToggleChecklist(chk.id, chk.completed)}
                      className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <div className="flex-1 text-xs">
                      <span className={chk.completed ? 'line-through text-slate-500' : 'font-semibold'}>
                        {chk.label}
                      </span>
                    </div>
                    {chk.required && (
                      <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200 flex-shrink-0">
                        Mandatory
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Spare Parts & Consumables Logger */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-sm text-slate-900">Parts &amp; Consumables Used</h3>
                </div>
                <span className="text-xs font-bold text-slate-500">
                  Total: AED{' '}
                  {task.partsUsed.reduce((acc, p) => acc + p.quantity * p.unitCost, 0).toLocaleString()}
                </span>
              </div>

              {/* Parts Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Part Code</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Unit (AED)</th>
                      <th className="py-2 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {task.partsUsed.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400 text-xs">
                          No spare parts logged yet. Use form below to add parts.
                        </td>
                      </tr>
                    ) : (
                      task.partsUsed.map((part) => (
                        <tr key={part.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{part.partCode}</td>
                          <td className="py-2 px-3 font-medium text-slate-700">{part.partName}</td>
                          <td className="py-2 px-2 text-center font-bold text-slate-900">{part.quantity}</td>
                          <td className="py-2 px-3 text-right text-slate-600">{part.unitCost}</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900">
                            AED {(part.quantity * part.unitCost).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Add Part Form */}
              <form
                onSubmit={handleAddPart}
                className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs"
              >
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                  + Add Part Used On-Site
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="Part Name (e.g. Capacitor 45uF)"
                    required
                    value={newPartName}
                    onChange={(e) => setNewPartName(e.target.value)}
                    className="sm:col-span-2 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    required
                    value={newPartQty}
                    onChange={(e) => setNewPartQty(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                  <input
                    type="number"
                    min="0"
                    placeholder="Cost (AED)"
                    value={newPartCost}
                    onChange={(e) => setNewPartCost(Number(e.target.value))}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add To Job Sheet</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right 5 Cols: Technician Notes & Customer Sign-Off Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Sign-Off &amp; Work Completion</h3>
              </div>

              {isCompletedSuccess ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-emerald-950 text-base">Job Successfully Completed!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Digital inspection certificate has been generated and customer signature stored.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href={`/worker/reports?id=${task.id}`}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      View Service Certificate
                    </Link>
                    <Link
                      href="/worker/tasks"
                      className="w-full py-2 px-4 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                    >
                      Return to Tasks List
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCompleteWorkOrder} className="space-y-4 text-xs">
                  {/* Technician Notes */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Technician Work Notes &amp; Observations:
                    </label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detail findings, leak repair location, delta temperature readings, post-service CFM..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Customer Representative Name */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Customer Signee Name <span className="text-red-500">*</span>:
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Eng. Tareq Mansoor / Rashid Al Nuaimi"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Customer Rating */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">Customer Feedback Rating:</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setCustomerRating(star)}
                          className="p-1 cursor-pointer transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= customerRating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-slate-700">
                        {customerRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Pad */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-800 block">
                      Digital Customer Sign-off / Signature <span className="text-red-500">*</span>:
                    </label>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center space-y-2">
                      <input
                        type="text"
                        required
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        placeholder="Type customer signature or sign-off identifier"
                        className="w-full text-center px-3 py-2 bg-white border border-slate-300 rounded-lg font-serif italic text-sm text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <span className="text-[10px] text-slate-400 block">
                        Customer acknowledges satisfactory equipment testing &amp; handover.
                      </span>
                    </div>
                  </div>

                  {/* Complete Action Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit &amp; Complete Work Order</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </WorkerShell>
  );
}
