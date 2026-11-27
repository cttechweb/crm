'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Trash2,
  AlertCircle,
  Hash,
  DollarSign,
  FileCheck2,
} from 'lucide-react';
import { quotationApiService, Quotation } from '@/services/quotationApiService';
import { notificationService } from '@/services/notificationService';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function QuotationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const quotationId = resolvedParams.id;
  const router = useRouter();

  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision & Modal States
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);

  // Executive Sign-off Form Inputs
  const [approvedPrice, setApprovedPrice] = useState<number | ''>('');
  const [paymentTerms, setPaymentTerms] = useState<string>('Advance Payment');
  const [executiveNotes, setExecutiveNotes] = useState<string>(
    'Commercial terms approved with wholesale project discount for UAE delivery.'
  );
  const [rejectReason, setRejectReason] = useState<string>(
    'Stock unavailable for required fulfillment timeline.'
  );

  const fetchQuotation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quotationApiService.getQuotationById(quotationId);
      setQuotation(data);
      if (data.total_amount) {
        setApprovedPrice(data.total_amount);
      }
      if (data.payment_terms) {
        setPaymentTerms(data.payment_terms);
      }
    } catch (err: unknown) {
      console.error('[Quotation Detail Page] Error fetching:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve quotation details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [quotationId]);

  useEffect(() => {
    void fetchQuotation();
  }, [fetchQuotation]);

  // Executive Approval Handler
  const handleApprove = async () => {
    if (!quotation) return;
    try {
      setActionLoading(true);
      setActionErrorMessage(null);
      const updated = await quotationApiService.approveQuotation(quotation.id, {
        total_amount: typeof approvedPrice === 'number' ? approvedPrice : quotation.total_amount,
        payment_terms: paymentTerms,
        notes: executiveNotes,
      });
      setQuotation(updated);
      setActionSuccessMessage(`Quotation ${updated.quotation_number} has been officially approved.`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_quotation_updated'));
      }
      notificationService.addLocalNotification({
        title: `Quotation Approved: ${updated.quotation_number}`,
        message: `Quotation for ${updated.customer} was officially approved for AED ${updated.total_amount?.toLocaleString() || approvedPrice} (${paymentTerms}).`,
        type: 'approval',
        linkUrl: `/customers/b2b-quotations/${updated.id}`,
        metadata: { quotationId: updated.id, quotationNumber: updated.quotation_number, totalAmount: updated.total_amount },
      });
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve quotation.';
      setActionErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Executive Decline Handler
  const handleDecline = async () => {
    if (!quotation) return;
    try {
      setActionLoading(true);
      setActionErrorMessage(null);
      const updated = await quotationApiService.rejectQuotation(quotation.id, {
        reason: rejectReason,
      });
      setQuotation(updated);
      setIsDeclineModalOpen(false);
      setActionSuccessMessage(`Quotation ${updated.quotation_number} has been declined.`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_quotation_updated'));
      }
      notificationService.addLocalNotification({
        title: `Quotation Declined: ${updated.quotation_number}`,
        message: `Quotation for ${updated.customer} was declined. Reason: ${rejectReason}`,
        type: 'closure',
        linkUrl: `/customers/b2b-quotations/${updated.id}`,
        metadata: { quotationId: updated.id, quotationNumber: updated.quotation_number, reason: rejectReason },
      });
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to decline quotation.';
      setActionErrorMessage(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Handler
  const handleDelete = async () => {
    if (!quotation) return;
    try {
      setDeleteLoading(true);
      await quotationApiService.deleteQuotation(quotation.id);
      setIsDeleteModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_quotation_updated'));
      }
      router.push('/customers/b2b-quotations');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete quotation.';
      alert(`Error deleting quotation: ${msg}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const isAppr = status === 'Approved';
    const isRej = status === 'Rejected';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-2xs ${
          isAppr
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
            : isRej
            ? 'bg-rose-100 text-rose-800 border border-rose-300'
            : 'bg-amber-100 text-amber-800 border border-amber-300'
        }`}
      >
        {isAppr ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        ) : isRej ? (
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-amber-600" />
        )}
        <span>{status}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-cyan-600 mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading commercial quotation...</p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8">
        <div className="max-w-3xl mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Unable to Load Quotation</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{error || 'Quotation not found.'}</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              href="/customers/b2b-quotations"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quotations</span>
            </Link>
            <button
              onClick={() => void fetchQuotation()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isPending =
    quotation.status === 'Pending CEO Approval' ||
    quotation.status === 'Pending' ||
    quotation.status === 'Draft';

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Top Navigation & Action Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Back Link & Title */}
            <div>
              <Link
                href="/customers/b2b-quotations"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-700 transition-colors mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to B2B Quotations</span>
              </Link>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <FileText className="w-6 h-6 text-cyan-600" />
                  <span>Commercial Quotation: {quotation.quotation_number}</span>
                </h1>
                {getStatusBadge(quotation.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Direct B2B Project RFQ from Website Portal
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void fetchQuotation()}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Delete Quotation"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete</span>
              </button>

              {isPending && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsDeclineModalOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Decline Quote</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleApprove()}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Quotation</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feedback Banners */}
          {actionSuccessMessage && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMessage}</span>
            </div>
          )}

          {actionErrorMessage && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{actionErrorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Columns (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Contracting Entity & Contact Profile */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Building2 className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Retailer &amp; Contracting Entity Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Contracting Entity / Company</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{quotation.customer}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Contact Person</span>
                  <p className="font-bold text-slate-900 mt-1">{quotation.contact_person || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Email Address</span>
                  <a
                    href={`mailto:${quotation.email}`}
                    className="font-bold text-cyan-700 hover:underline mt-1 flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quotation.email || 'N/A'}</span>
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Phone / WhatsApp</span>
                  <a
                    href={`tel:${quotation.phone}`}
                    className="font-bold text-slate-900 hover:text-cyan-700 mt-1 flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quotation.phone || 'N/A'}</span>
                  </a>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Project Site Location</span>
                  <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{quotation.shipping_address || 'Abu Dhabi, UAE'}</span>
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Submission Date</span>
                  <p className="font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{quotation.quote_date || quotation.created_at}</span>
                  </p>
                </div>
              </div>

              {quotation.customer_notes && (
                <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3.5">
                  <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider">
                    Client Project Notes / Site Constraints:
                  </span>
                  <p className="text-slate-800 text-xs font-medium italic mt-1 leading-relaxed">
                    "{quotation.customer_notes}"
                  </p>
                </div>
              )}
            </div>

            {/* 2. Requested Equipment & Line Items */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Requested Equipment &amp; Specifications
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {quotation.items?.length || 0} line item{(quotation.items?.length || 0) === 1 ? '' : 's'}
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Equipment Description &amp; Specifications</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Catalog Unit (AED)</th>
                      <th className="py-3 px-4 text-right">Subtotal (AED)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quotation.items && quotation.items.length > 0 ? (
                      quotation.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{item.description}</span>
                            {item.item_code && (
                              <span className="inline-block mt-0.5 text-[10px] font-mono font-medium bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                Model: {item.item_code}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-800">
                            {item.quantity}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-600 font-medium">
                            {item.unit_price > 0 ? item.unit_price.toLocaleString() : 'Quotation Req'}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                            {item.total_amount > 0 ? item.total_amount.toLocaleString() : 'TBD'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Equipment line item details logged in project scope.
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 text-slate-800">
                    <tr>
                      <td colSpan={3} className="py-2.5 px-4 text-right text-slate-500 font-medium">
                        Standard UAE VAT (5%):
                      </td>
                      <td className="py-2.5 px-4 text-right font-semibold text-slate-700">
                        AED {quotation.vat_amount ? quotation.vat_amount.toLocaleString() : '0'}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-200 text-sm">
                      <td colSpan={3} className="py-3 px-4 text-right font-bold text-slate-900">
                        Total Quoted Amount:
                      </td>
                      <td className="py-3 px-4 text-right font-black text-cyan-700 text-base">
                        AED {quotation.total_amount ? quotation.total_amount.toLocaleString() : '0'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Commercial Sign-Off Controls & Audit */}
          <div className="space-y-6">
            {/* CEO & COO Commercial Sign-off Controls */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Executive Sign-Off Controls
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Approved Commercial Price (AED)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      AED
                    </span>
                    <input
                      type="number"
                      value={approvedPrice}
                      onChange={(e) => setApprovedPrice(parseFloat(e.target.value) || '')}
                      placeholder={`e.g. ${quotation.total_amount || 0}`}
                      disabled={!isPending || actionLoading}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-12 pr-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Approved Payment Terms
                  </label>
                  <select
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    disabled={!isPending || actionLoading}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-50 cursor-pointer"
                  >
                    <option value="Advance Payment">Advance Payment</option>
                    <option value="30 Days PDC">30 Days PDC</option>
                    <option value="60 Days Credit">60 Days Credit</option>
                    <option value="50% Advance, 50% on Delivery">50% Advance, 50% on Delivery</option>
                    <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Executive Notes &amp; Warranty Sign-off
                  </label>
                  <textarea
                    rows={3}
                    value={executiveNotes}
                    onChange={(e) => setExecutiveNotes(e.target.value)}
                    disabled={!isPending || actionLoading}
                    placeholder="Enter executive terms or warranty conditions..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-50"
                  />
                </div>

                {isPending && (
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => void handleApprove()}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Signing off...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve &amp; Sign-off</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsDeclineModalOpen(true)}
                      disabled={actionLoading}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Decline Quotation</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Audit & Workflow Metadata */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 text-xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <Hash className="w-4 h-4 text-slate-400" />
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Audit &amp; Record Details
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Internal Reference</span>
                  <span className="font-mono font-bold text-slate-800">{quotation.quotation_number}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">System Record ID</span>
                  <span className="font-mono text-[11px] text-slate-500 truncate max-w-[150px]">
                    {quotation.id}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Creation Date</span>
                  <span className="font-medium text-slate-700">{quotation.created_at || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Workflow Status</span>
                  <span className="font-semibold text-slate-800">{quotation.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decline Dialog Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Decline Commercial Quotation?
              </h3>
              <p className="text-xs text-slate-600 text-center">
                Please specify the reason for declining quotation{' '}
                <strong className="text-slate-800">{quotation.quotation_number}</strong>:
              </p>
              <div>
                <label className="block text-slate-700 font-bold mb-1 text-xs">
                  Decline Reason
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Stock unavailable within required timeframe"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeclineModalOpen(false)}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDecline()}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Declining...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Confirm Decline</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Delete Commercial Quotation?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Are you sure you want to permanently delete quotation{' '}
                <strong className="text-slate-800">{quotation.quotation_number}</strong> for{' '}
                <span className="font-semibold">{quotation.customer}</span>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
