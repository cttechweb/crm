'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  AlertCircle,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { quotationApiService, Quotation } from '@/services/quotationApiService';
import { ExecutiveQuotationDetailModal } from '@/components/sales/ExecutiveQuotationDetailModal';

type FilterStatus = 'all' | 'Pending CEO Approval' | 'Approved' | 'Rejected';

function B2BQuotationsContent() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Selected for Modal
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete Confirmation State
  const [quoteToDelete, setQuoteToDelete] = useState<Quotation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    quotationApiService
      .getQuotations({
        status: activeStatus === 'all' ? undefined : activeStatus,
        search: searchQuery,
        page,
        limit: pageSize,
      })
      .then((data) => {
        if (isMounted) {
          setQuotations(data.quotations);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load quotations');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeStatus, searchQuery, page]);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    quotationApiService
      .getQuotations({
        status: activeStatus === 'all' ? undefined : activeStatus,
        search: searchQuery,
        page,
        limit: pageSize,
      })
      .then((data) => {
        setQuotations(data.quotations);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load quotations');
        setLoading(false);
      });
  };

  const handleOpenDetail = (q: Quotation) => {
    setSelectedQuotation(q);
    setIsModalOpen(true);
  };

  const handleStatusUpdated = (updated: Quotation) => {
    setQuotations((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleDeletedQuote = (deletedId: string) => {
    setQuotations((prev) => prev.filter((item) => item.id !== deletedId));
  };

  const handleDeleteQuoteConfirm = async () => {
    if (!quoteToDelete) return;
    try {
      setDeleteLoading(true);
      await quotationApiService.deleteQuotation(quoteToDelete.id);
      handleDeletedQuote(quoteToDelete.id);
      setIsDeleteModalOpen(false);
      setQuoteToDelete(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_quotation_updated'));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete quotation';
      alert(`Error deleting quotation: ${msg}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status counts
  const pendingCount = quotations.filter(
    (q) => q.status === 'Pending CEO Approval' || q.status === 'Draft' || q.status === 'Pending'
  ).length;
  const approvedCount = quotations.filter((q) => q.status === 'Approved').length;
  const rejectedCount = quotations.filter((q) => q.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton href="/sales" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  B2B Commercial Quotations & RFQs
                </h1>
                <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-600" />
                  CEO & COO Approvals
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Review and approve inbound quotation requests submitted from the Cool Technologies website
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition shadow-xs flex items-center gap-1.5 text-xs font-semibold"
              title="Refresh Quotations"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => {
                  setActiveStatus('all');
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeStatus === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All ({quotations.length})
              </button>

              <button
                onClick={() => {
                  setActiveStatus('Pending CEO Approval');
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeStatus === 'Pending CEO Approval'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                Pending Approval ({pendingCount})
              </button>

              <button
                onClick={() => {
                  setActiveStatus('Approved');
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeStatus === 'Approved'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Approved ({approvedCount})
              </button>

              <button
                onClick={() => {
                  setActiveStatus('Rejected');
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  activeStatus === 'Rejected'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                <XCircle className="w-3 h-3" />
                Declined ({rejectedCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search RFQ #, customer..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-600 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Quotation Ref</th>
                  <th className="py-3 px-4">Customer & Company</th>
                  <th className="py-3 px-4">Project Site</th>
                  <th className="py-3 px-4">Requested Items</th>
                  <th className="py-3 px-4 text-right">Quoted Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Executive Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-600" />
                      <span className="font-semibold text-xs">Loading commercial quotations...</span>
                    </td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">No quotations found</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Inbound quotation requests submitted from the website will appear here for CEO/COO approval.
                      </p>
                    </td>
                  </tr>
                ) : (
                  quotations.map((q) => {
                    const isPending =
                      q.status === 'Pending CEO Approval' || q.status === 'Pending' || q.status === 'Draft';
                    const isAppr = q.status === 'Approved';
                    const isRej = q.status === 'Rejected';

                    const itemCount = q.items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;
                    const firstItem = q.items?.[0]?.description || 'Commercial Equipment';

                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-cyan-800 whitespace-nowrap">
                          {q.quotation_number}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            {q.quote_date || q.created_at?.substring(0, 10)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{q.customer}</span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {q.contact_person || q.email}
                          </span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                            {q.shipping_address || 'Abu Dhabi, UAE'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800 line-clamp-1 max-w-[220px]">
                            {firstItem}
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {itemCount} total unit{itemCount > 1 ? 's' : ''}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span className="font-extrabold text-slate-900">
                            AED {q.total_amount ? q.total_amount.toLocaleString() : 'TBD'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isAppr
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isRej
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {isAppr ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : isRej ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {q.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/customers/b2b-quotations/${q.id}`}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                isPending
                                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{isPending ? 'Review & Sign-off' : 'View Quote'}</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                setQuoteToDelete(q);
                                setIsDeleteModalOpen(true);
                              }}
                              title="Delete Quotation"
                              className="inline-flex items-center justify-center p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 shadow-2xs transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Detail Modal */}
      {selectedQuotation && (
        <ExecutiveQuotationDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          quotation={selectedQuotation}
          onStatusUpdated={handleStatusUpdated}
          onDeleted={handleDeletedQuote}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && quoteToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Delete B2B Quotation?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Are you sure you want to delete quotation{' '}
                <strong className="text-slate-800">{quoteToDelete.quotation_number}</strong> for{' '}
                <span className="font-semibold">{quoteToDelete.customer || quoteToDelete.contact_person || 'Customer'}</span>?
                This quotation will be removed from your active records.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setQuoteToDelete(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteQuoteConfirm()}
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

export default function B2BQuotationsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <RefreshCw className="w-6 h-6 animate-spin text-cyan-600" />
        </div>
      }
    >
      <B2BQuotationsContent />
    </Suspense>
  );
}
