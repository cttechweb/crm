'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  X,
  AlertTriangle,
  FileText,
  DollarSign,
  Building,
} from 'lucide-react';
import { CrmPurchaseOrder, CrmPurchaseApproval } from '@/types/enterprise-crm';
import { purchaseOrderApiService } from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface PurchaseApprovalModalProps {
  purchaseOrder: CrmPurchaseOrder;
  currentUser: MockAuthUser | null;
  onClose: () => void;
  onSuccess: (updatedOrder: CrmPurchaseOrder) => void;
}

export function PurchaseApprovalModal({
  purchaseOrder,
  currentUser,
  onClose,
  onSuccess,
}: PurchaseApprovalModalProps) {
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approvalsHistory, setApprovalsHistory] = useState<CrmPurchaseApproval[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const evaluatedAmount = purchaseOrder.evaluatedTotalValue || purchaseOrder.totalAmount || 0;
  const isCooTier = evaluatedAmount >= 100000.0;
  const requiredTierName = isCooTier ? 'Chief Operating Officer (COO)' : 'Finance Controller (FC)';

  // Fetch approvals audit history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const res = await purchaseOrderApiService.getPurchaseOrderApprovals(purchaseOrder.id);
        if (res.success) {
          setApprovalsHistory(res.approvals);
        }
      } catch (err: any) {
        console.error('Failed to fetch approval history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [purchaseOrder.id]);

  const handleDecision = async (decision: 'Approved' | 'Rejected') => {
    if (decision === 'Rejected' && !remarks.trim()) {
      alert('Remarks are required when rejecting a Purchase Order.');
      return;
    }

    try {
      setSubmitting(true);

      // Ensure the PO exists in the database prior to approval
      try {
        await purchaseOrderApiService.createPurchaseOrder({
          id: purchaseOrder.id,
          poNumber: purchaseOrder.poNumber,
          date: purchaseOrder.date,
          expectedDeliveryDate: purchaseOrder.expectedDeliveryDate,
          supplier: purchaseOrder.supplier,
          supplierId: purchaseOrder.supplierId,
          orderRef: purchaseOrder.orderRef,
          reference: purchaseOrder.reference,
          description: purchaseOrder.description,
          opportunityOrder: purchaseOrder.opportunityOrder,
          projectNumber: purchaseOrder.projectNumber,
          projectName: purchaseOrder.projectName,
          vatType: purchaseOrder.vatType,
          vatRate: purchaseOrder.vatRate,
          attention: purchaseOrder.attention,
          preparedBy: purchaseOrder.preparedBy,
          preparedByMobile: purchaseOrder.preparedByMobile,
          preparedByEmail: purchaseOrder.preparedByEmail,
          preparedByDesignation: purchaseOrder.preparedByDesignation,
          termsCondition: purchaseOrder.termsCondition,
          termsConditionText: purchaseOrder.termsConditionText,
          amount: purchaseOrder.amount,
          vat: purchaseOrder.vat,
          discount: purchaseOrder.discount,
          adjustment: purchaseOrder.adjustment,
          totalAmount: purchaseOrder.totalAmount,
          items: purchaseOrder.items,
          msrfId: purchaseOrder.msrfId,
          salesOrderId: purchaseOrder.salesOrderId,
        });
      } catch (syncErr) {
        // If already exists (409) or minor warning, proceed
        console.debug('PO database sync note:', syncErr);
      }

      const targetId = purchaseOrder.poNumber || purchaseOrder.id;
      const res = await purchaseOrderApiService.approvePurchaseOrder(targetId, {
        decision,
        remarks: remarks.trim() || undefined,
        purchaseOrder,
      } as any);

      if (res.success && res.order) {
        alert(`Purchase Order ${decision === 'Approved' ? 'Authorized Successfully' : 'Rejected'}.`);
        onSuccess(res.order as any);
        onClose();
      } else {
        alert(res.message || 'Approval action failed');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit executive approval');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Executive Purchase Order Authorization</h3>
              <p className="text-xs text-slate-500 font-mono">PO: {purchaseOrder.poNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs">
          {/* Summary Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400 block mb-0.5">Supplier / Vendor:</span>
              <span className="font-semibold text-slate-900 text-sm">{purchaseOrder.supplier}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">PO Date:</span>
              <span className="font-medium text-slate-700">{purchaseOrder.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Current Status:</span>
              <span className="inline-block font-semibold px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-800">
                {purchaseOrder.approval}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Total Landed Value:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                AED {evaluatedAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Governance Authority Tier Badge */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isCooTier
                ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                : 'bg-blue-50/70 border-blue-200 text-blue-900'
            }`}
          >
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs uppercase tracking-wide">
                Mandatory Approval Authority Tier: {requiredTierName}
              </div>
              <p className="mt-1 leading-relaxed text-[11px]">
                {isCooTier ? (
                  <>
                    Expenditures of <span className="font-bold">AED 100,000 or greater</span> strictly mandate
                    executive sign-off by the <span className="font-bold">Chief Operating Officer (COO)</span> or an
                    active delegated authority.
                  </>
                ) : (
                  <>
                    Expenditures <span className="font-bold">below AED 100,000</span> require authorization by the{' '}
                    <span className="font-bold">Finance Controller (FC)</span> or an active delegated authority.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Decision Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Executive Remarks / Conditionality (Mandatory if rejecting)
            </label>
            <textarea
              placeholder="e.g. Approved as per Q4 HVAC Capital Budget allocation. Payment terms confirmed Net 30..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed bg-white"
            />
          </div>

          {/* Historical Approvals Timeline */}
          {approvalsHistory.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                Prior Sign-off Audits ({approvalsHistory.length})
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {approvalsHistory.map((a) => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-start justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {a.decision === 'Approved' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        {a.decision} by {a.approverName} ({a.approverDesignation || a.approvalTier})
                        {a.isDelegated && (
                          <span className="text-[10px] text-purple-600 font-mono">(Delegated)</span>
                        )}
                      </div>
                      {a.remarks && <div className="text-slate-500 italic mt-0.5">&quot;{a.remarks}&quot;</div>}
                    </div>
                    <span className="text-slate-400 font-mono text-[10px]">{a.decisionAt?.split('T')[0]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('Rejected')}
              className="px-4 py-2 font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
            >
              Reject PO
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleDecision('Approved')}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Recording...' : 'Authorize Purchase Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
