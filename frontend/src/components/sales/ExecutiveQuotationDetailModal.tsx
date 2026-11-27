'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  FileText,
  Mail,
  Phone,
  Layers,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Trash2,
  Maximize2,
} from 'lucide-react';
import { Quotation, quotationApiService } from '@/services/quotationApiService';

interface ExecutiveQuotationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation | null;
  onStatusUpdated?: (updated: Quotation) => void;
  onDeleted?: (deletedId: string) => void;
}

export function ExecutiveQuotationDetailModal({
  isOpen,
  onClose,
  quotation,
  onStatusUpdated,
  onDeleted,
}: ExecutiveQuotationDetailModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Executive Decision Inputs
  const [approvedPrice, setApprovedPrice] = useState<number | ''>(quotation?.total_amount || '');
  const [paymentTerms, setPaymentTerms] = useState(quotation?.payment_terms || 'Advance Payment');
  const [executiveNotes, setExecutiveNotes] = useState(
    'Commercial terms approved with wholesale project discount for UAE delivery.'
  );
  const [rejectReason, setRejectReason] = useState('Stock unavailable for required fulfillment timeline.');

  if (!isOpen || !quotation) return null;

  const isPending = quotation.status === 'Pending CEO Approval' || quotation.status === 'Pending' || quotation.status === 'Draft';
  const isApproved = quotation.status === 'Approved';
  const isRejected = quotation.status === 'Rejected';

  const handleApprove = async () => {
    setIsApproving(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const updated = await quotationApiService.approveQuotation(quotation.id, {
        total_amount: typeof approvedPrice === 'number' ? approvedPrice : quotation.total_amount,
        payment_terms: paymentTerms,
        notes: executiveNotes,
      });

      setActionSuccess(`Quotation ${updated.quotation_number} has been officially approved.`);
      if (onStatusUpdated) onStatusUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to approve quotation.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const updated = await quotationApiService.rejectQuotation(quotation.id, {
        reason: rejectReason,
      });

      setActionSuccess(`Quotation ${updated.quotation_number} has been declined.`);
      if (onStatusUpdated) onStatusUpdated(updated);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to decline quotation.');
    } finally {
      setIsRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!quotation) return;
    if (!window.confirm(`Are you sure you want to permanently delete quotation ${quotation.quotation_number}?`)) {
      return;
    }

    setIsDeleting(true);
    setActionError(null);
    try {
      await quotationApiService.deleteQuotation(quotation.id);
      if (onDeleted) onDeleted(quotation.id);
      onClose();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete quotation.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">
                  Commercial Quotation Review: {quotation.quotation_number}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isApproved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isRejected
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {quotation.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Direct B2B Project RFQ from Website Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/customers/b2b-quotations/${quotation.id}`}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              title="Open Full Page View"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open Full Page</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
        )}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Customer / Company Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-cyan-700" />
              Retailer & Project Contact
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contracting Entity / Company</span>
                <span className="font-bold text-slate-900 text-sm">{quotation.customer}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact Person</span>
                <span className="font-semibold text-slate-800">{quotation.contact_person || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {quotation.email || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone / WhatsApp</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {quotation.phone || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Project Site Location</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {quotation.shipping_address || 'Abu Dhabi, UAE'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Submitted Date</span>
                <span className="font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {quotation.quote_date || quotation.created_at}
                </span>
              </div>
            </div>

            {quotation.customer_notes && (
              <div className="mt-3 pt-3 border-t border-slate-200 text-xs">
                <span className="text-slate-400 block text-[11px]">Client Project Notes / Constraints</span>
                <p className="text-slate-700 font-medium italic mt-0.5">{quotation.customer_notes}</p>
              </div>
            )}
          </div>

          {/* Equipment Line Items Table */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-700" />
              Requested Equipment & Cart Items
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Equipment Description</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Catalog Unit (AED)</th>
                    <th className="py-2.5 px-3 text-right">Subtotal (AED)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items && quotation.items.length > 0 ? (
                    quotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-medium text-slate-800">
                          {item.description}
                          {item.item_code && (
                            <span className="block text-[10px] text-slate-400">
                              Brand: {item.item_code}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {item.unit_price > 0 ? item.unit_price.toLocaleString() : 'Quotation Req'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {item.total_amount > 0 ? item.total_amount.toLocaleString() : 'TBD'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-400">
                        Equipment line item details logged in project scope.
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-slate-800">
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right text-slate-500">
                      Standard UAE VAT (5%):
                    </td>
                    <td className="py-2 px-3 text-right font-medium">
                      AED {quotation.vat_amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-200 text-sm">
                    <td colSpan={3} className="py-2.5 px-3 text-right font-bold text-slate-900">
                      Total Quoted Amount:
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-cyan-700">
                      AED {quotation.total_amount.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Executive Sign-off Controls (Active only if Pending) */}
          {isPending && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                CEO & COO Commercial Sign-off Controls
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Approved Commercial Price (AED)
                  </label>
                  <input
                    type="number"
                    value={approvedPrice}
                    onChange={(e) => setApprovedPrice(parseFloat(e.target.value) || '')}
                    placeholder={`e.g. ${quotation.total_amount}`}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Approved Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-cyan-600"
                  >
                    <option value="Advance Payment">Advance Payment</option>
                    <option value="30 Days PDC">30 Days PDC</option>
                    <option value="60 Days Credit">60 Days Credit</option>
                    <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Executive Notes & Warranty Sign-off
                </label>
                <input
                  type="text"
                  value={executiveNotes}
                  onChange={(e) => setExecutiveNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-cyan-600"
                />
              </div>

              <div className="pt-2 border-t border-emerald-200/60">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason if Declining (Optional)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Stock unavailable within required timeframe"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isApproving || isRejecting}
              className="px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Delete Quotation"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              <span>Delete</span>
            </button>
          </div>

          {isPending && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleReject}
                disabled={isRejecting || isApproving}
                className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Decline Quote
              </button>

              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isApproving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                Approve Quotation (CEO/COO Sign-off)
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
