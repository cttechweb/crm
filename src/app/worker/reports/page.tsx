'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileCheck,
  Printer,
  Download,
  Star,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  Wrench,
  Search,
  ExternalLink,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { WorkerTask } from '@/types/worker';

function WorkerReportsContent() {
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get('id');

  const [tasks, setTasks] = useState<WorkerTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<WorkerTask | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const list = workerMockService.getTasks();
    const completed = list.filter((t) => t.status === 'Completed');
    setTasks(completed);

    if (highlightedId) {
      const match = list.find((t) => t.id === highlightedId || t.taskNumber === highlightedId);
      if (match) setSelectedTask(match);
      else if (completed.length > 0) setSelectedTask(completed[0]);
    } else if (completed.length > 0) {
      setSelectedTask(completed[0]);
    }
  }, [highlightedId]);

  const filtered = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.clientCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ── 2-Column Certificate Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: List of Completed Work Orders */}
        <div className="lg:col-span-4 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search signed reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-2xs"
            />
          </div>

          <div className="space-y-2 max-h-[650px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                No completed certificates yet.
              </div>
            ) : (
              filtered.map((t) => {
                const isSelected = selectedTask?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'bg-blue-50/60 border-blue-400 ring-2 ring-blue-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-blue-700">{t.taskNumber}</span>
                      <span className="flex items-center gap-0.5 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {t.rating || 5}.0
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug line-clamp-2">
                      {t.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <span className="truncate">{t.clientCompany}</span>
                      <span className="font-semibold text-emerald-700">Signed ✓</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 8 Cols: Digital Certificate Document Preview */}
        <div className="lg:col-span-8">
          {selectedTask ? (
            <div className="bg-white border border-slate-300 rounded-2xl shadow-lg p-6 sm:p-8 space-y-6 text-slate-800">
              {/* Top Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-[#00AEEF] uppercase">
                      COOL TECHNOLOGIES CRM
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      OFFICIAL FIELD SERVICE CERTIFICATE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    HVAC Equipment Maintenance &amp; Handover Certificate
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Certificate No: CERT-{selectedTask.taskNumber.replace('TSK-', '')}-2026
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => alert('Certificate downloaded to PDF successfully.')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* 2-Column Job & Client Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Information</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedTask.clientCompany}</div>
                  <div className="text-slate-600">Contact: {selectedTask.clientName}</div>
                  <div className="text-slate-600">Site: {selectedTask.address}</div>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Execution Record</span>
                  <div className="font-bold text-slate-900">Lead Tech: Jordan Hayes (WRK-2049)</div>
                  <div className="text-slate-600">Date Completed: {selectedTask.signedAt || '2026-09-24'}</div>
                  <div className="text-slate-600">Labor Hours: {selectedTask.actualHoursSpent || selectedTask.estimatedHours} hrs</div>
                </div>
              </div>

              {/* Description & Work Executed */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Scope of Work Executed
                </h4>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 leading-relaxed text-slate-700">
                  {selectedTask.description}
                  {selectedTask.technicianNotes && (
                    <div className="mt-2 pt-2 border-t border-slate-200 font-medium text-slate-900">
                      <strong>Technician Observations:</strong> {selectedTask.technicianNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Checklist Verification */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Safety &amp; Compliance Checklist
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTask.checklist.map((chk) => (
                    <div
                      key={chk.id}
                      className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50/50 border border-emerald-200 text-slate-800 text-[11px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">{chk.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parts Used Breakdown */}
              {selectedTask.partsUsed.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                    Installed Spare Parts &amp; Materials
                  </h4>
                  <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3 text-left">Part Code</th>
                        <th className="py-2 px-3 text-left">Description</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Rate (AED)</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedTask.partsUsed.map((p) => (
                        <tr key={p.id}>
                          <td className="py-2 px-3 font-mono font-bold text-slate-800">{p.partCode}</td>
                          <td className="py-2 px-3">{p.partName}</td>
                          <td className="py-2 px-3 text-center font-bold">{p.quantity}</td>
                          <td className="py-2 px-3 text-right">{p.unitCost}</td>
                          <td className="py-2 px-3 text-right font-bold">
                            AED {(p.quantity * p.unitCost).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Bottom Customer Sign-Off Block */}
              <div className="pt-6 border-t-2 border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Service Specialist Handover
                  </span>
                  <div className="font-serif italic font-bold text-slate-900 text-base">Jordan Hayes</div>
                  <div className="text-[11px] text-slate-500">Certified Senior HVAC Tech</div>
                  <div className="text-[10px] text-emerald-700 font-bold mt-1">Verified on site ✓</div>
                </div>

                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Customer Acceptance &amp; Signature
                  </span>
                  <div className="font-serif italic font-bold text-slate-900 text-base">
                    {selectedTask.customerSignature || selectedTask.customerSignedBy || 'Customer Authorized'}
                  </div>
                  <div className="text-[11px] text-slate-700">
                    Signee: {selectedTask.customerSignedBy || selectedTask.clientName}
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs pt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-slate-700 ml-1">5.0 Star Rating</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
              Select a work order from the left to view signed certificate.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WorkerReportsPage() {
  return (
    <WorkerShell
      title="Service Reports &amp; Sign-Off Certificates"
      subtitle="Digital customer handover certificates, installed parts documentation, and CSAT rating scores"
    >
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading certificates...</div>}>
        <WorkerReportsContent />
      </Suspense>
    </WorkerShell>
  );
}
