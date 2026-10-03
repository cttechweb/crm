'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Printer,
  Edit3,
  Send,
  Lock,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Check,
  ShoppingBag,
  DollarSign,
  User,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  Eye,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { CrmQuotation } from '@/types/enterprise-crm';
import { authMockService } from '@/services/authMockService';
import { canApproveQuotation, canConvertQuotation } from '@/services/crmDataScopeService';

interface QuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: CrmQuotation | null;
  onEdit?: (quote: CrmQuotation) => void;
  onPrintVoucher?: (quote: CrmQuotation) => void;
  onPrint?: (quote: CrmQuotation) => void;
}

export function QuotationDetailModal({
  isOpen,
  onClose,
  quotation,
  onEdit,
  onPrintVoucher,
  onPrint,
}: QuotationDetailModalProps) {
  const handlePrint = onPrintVoucher || onPrint;
  const { updateQuotation, convertQuotationToSalesOrder, users } = useEnterpriseCrm();
  const currentUser = authMockService.getCurrentUser();

  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !quotation) return null;

  const roleStr = String(currentUser?.role || '').toLowerCase();
  const isManagerOrAdmin =
    roleStr.includes('manager') ||
    roleStr.includes('admin') ||
    roleStr.includes('super');

  const userCanApprove = canApproveQuotation(currentUser);
  const userCanConvert = canConvertQuotation(currentUser);

  // Workflow Handlers
  const handleStatusChange = async (
    newStatus: CrmQuotation['status'],
    reason?: string
  ) => {
    setIsProcessing(true);
    try {
      const now = new Date().toISOString();
      const historyEntry = {
        id: `hist-${Date.now()}`,
        date: now,
        action: `Status updated to ${newStatus}`,
        user: currentUser?.name || 'System User',
        role: currentUser?.role || 'Employee',
        remarks: reason || (newStatus === 'Approved' ? 'Quotation approved by management.' : ''),
      };

      const updated = {
        ...quotation,
        status: newStatus,
        approvedBy: newStatus === 'Approved' ? currentUser?.name : quotation.approvedBy,
        approvalDate: newStatus === 'Approved' ? now : quotation.approvalDate,
        rejectionReason: newStatus === 'Rejected' ? reason : undefined,
        history: [...(quotation.history || []), historyEntry],
        updatedAt: now,
      };

      updateQuotation(updated);
      setActionSuccessMessage(`Quotation status updated to "${newStatus}" successfully.`);
      setShowRejectBox(false);
      setRejectionReason('');
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvertToOrder = async () => {
    setIsProcessing(true);
    try {
      const order = convertQuotationToSalesOrder(quotation.id);
      if (order) {
        setActionSuccessMessage(`🎉 Successfully converted to Sales Order: ${order.orderNumber}`);
      }
    } catch (e: any) {
      alert(e.message || 'Error converting to sales order');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: CrmQuotation['status']) => {
    const config: Record<
      CrmQuotation['status'],
      { bg: string; text: string; border: string; icon: React.ReactNode }
    > = {
      Draft: {
        bg: 'bg-slate-500/10 dark:bg-slate-500/20',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-500/30',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      'Pending Approval': {
        bg: 'bg-amber-500/10 dark:bg-amber-500/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      },
      Approved: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/30',
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
      },
      Sent: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/20',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-500/30',
        icon: <Send className="w-3.5 h-3.5" />,
      },
      Viewed: {
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-500/30',
        icon: <Eye className="w-3.5 h-3.5" />,
      },
      Accepted: {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      },
      Rejected: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/20',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30',
        icon: <XCircle className="w-3.5 h-3.5" />,
      },
      Converted: {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/20',
        text: 'text-cyan-700 dark:text-cyan-400',
        border: 'border-cyan-500/30',
        icon: <ShoppingBag className="w-3.5 h-3.5" />,
      },
      Expired: {
        bg: 'bg-gray-500/10 dark:bg-gray-500/20',
        text: 'text-gray-700 dark:text-gray-400',
        border: 'border-gray-500/30',
        icon: <RotateCcw className="w-3.5 h-3.5" />,
      },
      Cancelled: {
        bg: 'bg-zinc-500/10 dark:bg-zinc-500/20',
        text: 'text-zinc-700 dark:text-zinc-400',
        border: 'border-zinc-500/30',
        icon: <XCircle className="w-3.5 h-3.5" />,
      },
    };

    const c = config[status] || config.Draft;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}
      >
        {c.icon}
        {status}
      </span>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl">
      <div className="flex flex-col h-full max-h-[88vh] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight">{quotation.quotationNumber}</h2>
                {getStatusBadge(quotation.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {quotation.subject || 'Commercial Quotation'} • Valid until {quotation.validUntil}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {handlePrint && (
              <button
                type="button"
                onClick={() => handlePrint(quotation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Voucher / PDF
              </button>
            )}

            {quotation.status === 'Draft' && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(quotation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors border border-indigo-200 dark:border-indigo-800 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Action Banner */}
        {actionSuccessMessage && (
          <div className="px-6 py-2.5 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            {actionSuccessMessage}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Action Toolbar */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Workflow Actions
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Current Role: <span className="font-semibold text-indigo-500">{currentUser?.role || 'Employee'}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Draft state actions */}
              {quotation.status === 'Draft' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('Pending Approval', 'Submitted for Manager Approval')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Submit for Approval
                </button>
              )}

              {/* Pending Approval state actions (Only for Manager / Admin) */}
              {quotation.status === 'Pending Approval' && userCanApprove && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleStatusChange('Approved')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Quotation
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setShowRejectBox(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                </>
              )}

              {quotation.status === 'Pending Approval' && !userCanApprove && (
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  Waiting for Manager Review & Approval
                </div>
              )}

              {/* Approved state actions */}
              {quotation.status === 'Approved' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handleStatusChange('Sent', 'Quotation dispatched to client via email')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  Mark as Sent to Client
                </button>
              )}

              {/* Sent state actions */}
              {quotation.status === 'Sent' && (
                <>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleStatusChange('Accepted', 'Client approved & confirmed quotation')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Mark Accepted by Client
                  </button>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setShowRejectBox(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    Declined by Client
                  </button>
                </>
              )}

              {/* Accepted state actions -> Convert to Sales Order */}
              {quotation.status === 'Accepted' && (
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConvertToOrder}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Convert to Sales Order
                </button>
              )}

              {/* Converted state information */}
              {quotation.status === 'Converted' && (
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 font-medium">
                  <FileCheck2 className="w-4 h-4" />
                  Converted to Sales Order: <span className="font-bold underline">{quotation.salesOrderNumber || quotation.salesOrderId || 'Linked'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Prompt Box */}
          {showRejectBox && (
            <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-rose-700 dark:text-rose-400">
                  Please provide a reason for rejecting this quotation:
                </label>
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Pricing margin too low, customer requested revised scope, etc."
                className="w-full text-xs p-2.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-rose-500 outline-none"
                rows={2}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={!rejectionReason.trim() || isProcessing}
                  onClick={() => handleStatusChange('Rejected', rejectionReason)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          )}

          {/* Customer & Opportunity Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                Customer Details
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{quotation.customer}</p>
                {quotation.contactPerson && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" /> Attn: {quotation.contactPerson}
                  </p>
                )}
                {quotation.phone && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" /> {quotation.phone}
                  </p>
                )}
                {quotation.email && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-slate-400" /> {quotation.email}
                  </p>
                )}
                {quotation.billingAddress && (
                  <p className="text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400 mt-0.5" /> {quotation.billingAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Quote & Deal Meta Box */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Quotation & Ownership Meta
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Quotation Date</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{quotation.quoteDate || quotation.createdDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Valid Until</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{quotation.validUntil}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Assigned Representative</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">{quotation.assignedTo || 'Unassigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Linked Deal / Opportunity</span>
                  <span className="font-medium text-indigo-600 dark:text-indigo-400">{quotation.opportunityCode || 'Direct Quote'}</span>
                </div>
                {quotation.approvedBy && (
                  <div className="col-span-2 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-400 text-[11px] block">Approved By & Timestamp</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {quotation.approvedBy} ({new Date(quotation.approvalDate || Date.now()).toLocaleDateString()})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Quotation Line Items ({quotation.items?.length || 0})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Currency: AED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-4 font-semibold w-10 text-center">#</th>
                    <th className="py-2.5 px-4 font-semibold">Item & Description</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-20">Qty</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-28">Unit Price</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-20">Disc %</th>
                    <th className="py-2.5 px-4 font-semibold text-right w-32">Total (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.productName || item.description}</p>
                          {item.productName && item.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                          )}
                          {item.sku && <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-800 dark:text-slate-200">
                          {item.quantity} {item.unit || 'pcs'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                          AED {Number(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400 font-mono">
                          {item.discountPercentage ? `${item.discountPercentage}%` : '—'}
                        </td>
                        <td className="py-3 px-4 text-right font-bold font-mono text-slate-900 dark:text-white">
                          AED {Number(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 italic">
                        No line items recorded for this quotation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Totals */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-700/80 flex justify-end">
              <div className="w-full sm:w-80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Gross Total:</span>
                  <span className="font-mono">
                    AED {(quotation.grossAmount || quotation.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {Boolean(quotation.discountAmount) && (
                  <div className="flex justify-between text-rose-600 dark:text-rose-400">
                    <span>Discount:</span>
                    <span className="font-mono">
                      - AED {Number(quotation.discountAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono">
                    AED {(quotation.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono">
                    AED {(quotation.vatAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Net Grand Total:</span>
                  <span className="font-mono text-indigo-600 dark:text-indigo-400">
                    AED {(quotation.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Commercial Terms & Conditions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Payment Terms:</span>
                <p>{quotation.paymentTerms || 'Standard commercial terms apply.'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Delivery / Execution:</span>
                <p>{quotation.deliveryTerms || 'Within agreed timeframe upon confirmed LPO.'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Warranty:</span>
                <p>{quotation.warrantyTerms || quotation.warranty || '1 Year standard manufacturer warranty.'}</p>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-200 block mb-1">Validity:</span>
                <p>{quotation.validityTerms || `Valid until ${quotation.validUntil}`}</p>
              </div>
            </div>
          </div>

          {/* Notes: Client Notes vs Management Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Notes */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                Customer Visible Notes
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {quotation.customerNotes || quotation.notes || 'No public remarks provided.'}
              </p>
            </div>

            {/* Internal Confidential Notes (Management only) */}
            {isManagerOrAdmin && (
              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Confidential Internal Margin & Cost Notes
                </div>
                <p className="text-xs text-amber-900/80 dark:text-amber-300/80 whitespace-pre-wrap">
                  {quotation.internalNotes || 'No internal manager remarks recorded.'}
                </p>
              </div>
            )}
          </div>

          {/* Audit History Timeline */}
          {quotation.history && quotation.history.length > 0 && (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                Quotation Lifecycle & Audit Log
              </h3>
              <div className="space-y-2 text-xs">
                {quotation.history.map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-3 py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <span className="text-[11px] text-slate-400 font-mono whitespace-nowrap mt-0.5">
                      {new Date(h.date || h.timestamp || Date.now()).toLocaleDateString()}{' '}
                      {new Date(h.date || h.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">
                        {h.action} <span className="font-normal text-slate-500">by {h.user || h.performedBy || 'User'} ({h.role || h.performedByRole || 'Staff'})</span>
                      </p>
                      {(h.remarks || h.notes) && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{h.remarks || h.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
