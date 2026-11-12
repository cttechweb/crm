'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X, FileText, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { authMockService } from '@/services/authMockService';

export interface ProcurementNotificationPayload {
  id: string;
  type: 'po_awaiting_approval' | 'po_approved' | 'po_rejected';
  poId: string;
  poNumber: string;
  supplier: string;
  amount: number;
  preparedBy: string;
  approvedByName?: string;
  approvedByDesignation?: string;
  timestamp: string;
}

const STORAGE_EVENT_KEY = 'cooltech_procurement_cross_tab_event';
const SEEN_PO_SESSION_KEY = 'cooltech_seen_procurement_popups';

export function dispatchProcurementPopup(payload: ProcurementNotificationPayload) {
  if (typeof window === 'undefined') return;
  try {
    // 1. Dispatch custom event for current window
    window.dispatchEvent(
      new CustomEvent('cooltech_procurement_notification', { detail: payload })
    );
    // 2. Dispatch cross-tab storage event for other open tabs
    localStorage.setItem(STORAGE_EVENT_KEY, JSON.stringify({ ...payload, _t: Date.now() }));
  } catch (err) {
    console.warn('Failed to dispatch procurement popup:', err);
  }
}

export function ProcurementNotificationToast() {
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<ProcurementNotificationPayload | null>(null);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Soft chime notification for executive attention
  const playChime = (tone: 'urgent' | 'success' = 'urgent') => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';

      if (tone === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      } else {
        osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      }

      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  };

  const handleIncomingPayload = (payload: ProcurementNotificationPayload) => {
    if (!payload || !payload.poNumber) return;

    const currentUser = authMockService.getCurrentUser();
    const userName = (currentUser?.name || '').toLowerCase().trim();
    const userRole = (currentUser?.role || '').toLowerCase().trim();
    const userPosition = (currentUser?.position || '').toLowerCase().trim();
    const userDesignation = (currentUser?.designation || '').toLowerCase().trim();
    const userDept = (currentUser?.department || '').toLowerCase().trim();

    const isFinanceOrExecutive =
      userName === 'hamdan' ||
      userName === 'coo' ||
      userName === 'ceo' ||
      userRole.includes('admin') ||
      userRole === 'super_admin' ||
      userPosition.includes('finance') ||
      userDesignation.includes('finance') ||
      userPosition.includes('controller') ||
      userDesignation.includes('controller') ||
      userPosition.includes('coo') ||
      userPosition.includes('ceo') ||
      userDept.includes('finance');

    const cleanCreator = (payload.preparedBy || '').toLowerCase().trim();
    const isCreator =
      userName === cleanCreator ||
      (cleanCreator && userName.includes(cleanCreator)) ||
      (cleanCreator && cleanCreator.includes(userName)) ||
      (userName === 'murshid' && cleanCreator.includes('murshid'));

    // EVENT 1: PO Awaiting Approval -> target Finance Controller (Hamdan), COO, CEO
    if (payload.type === 'po_awaiting_approval') {
      if (!isFinanceOrExecutive) return;
      setActiveToast(payload);
      playChime('urgent');
    }

    // EVENT 2: PO Approved / Rejected -> target Creator (Murshid)
    if (payload.type === 'po_approved' || payload.type === 'po_rejected') {
      if (!isCreator && !userRole.includes('admin')) return;
      setActiveToast(payload);
      playChime('success');
    }

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 12000);
  };

  useEffect(() => {
    // 1. Listen for current window events
    const handleCustom = (e: any) => {
      if (e?.detail) handleIncomingPayload(e.detail);
    };

    // 2. Listen for cross-tab storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_EVENT_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.poNumber) handleIncomingPayload(parsed);
        } catch {}
      }
    };

    window.addEventListener('cooltech_procurement_notification', handleCustom);
    window.addEventListener('storage', handleStorage);

    // 3. Proactive check on mount: If Hamdan/Executive is viewing and has unapproved POs, alert once
    try {
      const currentUser = authMockService.getCurrentUser();
      const userName = (currentUser?.name || '').toLowerCase().trim();
      const userPosition = (currentUser?.position || '').toLowerCase().trim();
      const userDesignation = (currentUser?.designation || '').toLowerCase().trim();

      const isHamdanOrExecutive =
        userName === 'hamdan' ||
        userPosition.includes('finance') ||
        userDesignation.includes('finance') ||
        userPosition.includes('controller') ||
        userDesignation.includes('controller') ||
        userName === 'coo' ||
        userName === 'ceo';

      if (isHamdanOrExecutive) {
        const raw = localStorage.getItem('crm_purchase_orders');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const pendingPo = list.find(
              (p: any) => p.approval === 'Pending' || p.approval === 'Pending Approval' || !p.approval
            );
            if (pendingPo) {
              const seenRaw = sessionStorage.getItem(SEEN_PO_SESSION_KEY) || '[]';
              const seenList: string[] = JSON.parse(seenRaw);
              if (!seenList.includes(pendingPo.id || pendingPo.poNumber)) {
                seenList.push(pendingPo.id || pendingPo.poNumber);
                sessionStorage.setItem(SEEN_PO_SESSION_KEY, JSON.stringify(seenList));
                handleIncomingPayload({
                  id: `po_pending_${pendingPo.id || Date.now()}`,
                  type: 'po_awaiting_approval',
                  poId: pendingPo.id || '',
                  poNumber: pendingPo.poNumber || 'CTPO#Pending',
                  supplier: pendingPo.supplier || 'Vendor',
                  amount: Number(pendingPo.totalAmount || pendingPo.amount || 0),
                  preparedBy: pendingPo.preparedBy || 'Procurement',
                  timestamp: new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    } catch {}

    return () => {
      window.removeEventListener('cooltech_procurement_notification', handleCustom);
      window.removeEventListener('storage', handleStorage);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  if (!activeToast) return null;

  const isApproved = activeToast.type === 'po_approved';
  const isAwaiting = activeToast.type === 'po_awaiting_approval';

  const handleAction = () => {
    const targetUrl = activeToast.poId
      ? `/purchase?tab=po&poId=${encodeURIComponent(activeToast.poId)}`
      : '/purchase?tab=po';
    setActiveToast(null);
    router.push(targetUrl);
  };

  return (
    <div className="fixed top-5 right-5 z-[110] max-w-sm w-[360px] sm:w-[420px] bg-white rounded-2xl shadow-2xl border-2 p-4 animate-in slide-in-from-top-4 fade-in duration-200 select-none print:hidden border-slate-200">
      <div className="flex items-start gap-3.5">
        {/* Visual Icon Badge */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
            isApproved
              ? 'bg-emerald-500 text-white'
              : 'bg-amber-500 text-white'
          }`}
        >
          {isApproved ? (
            <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isApproved ? '✓ PO Approved & Signed' : '🚨 PO Awaiting Approval'}
            </span>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-xs font-bold text-slate-900 leading-tight">
            {isApproved
              ? `${activeToast.poNumber} has been Authorized!`
              : `${activeToast.poNumber} requires your Authorization`}
          </h4>

          <div className="text-[11px] text-slate-600 mt-1 space-y-0.5 leading-snug">
            <p className="font-semibold text-slate-800">
              Supplier: <span className="font-bold text-slate-900">{activeToast.supplier}</span>
            </p>
            <div className="flex items-center justify-between text-slate-500 pt-0.5">
              <span>Amount: <strong className="text-slate-800">AED {activeToast.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
              <span>By: <strong className="text-slate-800">{activeToast.preparedBy}</strong></span>
            </div>
            {isApproved && activeToast.approvedByName && (
              <p className="text-[10px] text-emerald-700 font-semibold pt-0.5">
                Authorized by: {activeToast.approvedByName} ({activeToast.approvedByDesignation || 'Finance Controller'})
              </p>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="px-2.5 py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleAction}
              className={`px-3 py-1.5 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                isApproved
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <span>{isApproved ? 'View Signed PO' : 'Review & Authorize'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
