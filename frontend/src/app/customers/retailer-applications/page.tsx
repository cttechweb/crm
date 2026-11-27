'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  RefreshCw,
  Eye,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import {
  retailerApplicationApiService,
  RetailerApplication,
} from '@/services/retailerApplicationApiService';
import { RetailerApplicationDetailModal } from '@/components/customers/RetailerApplicationDetailModal';

type FilterStatus = 'all' | 'pending' | 'under_review' | 'approved' | 'rejected';

function RetailerApplicationsContent() {
  const [applications, setApplications] = useState<RetailerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [activeStatus, setActiveStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const pageSize = 15;

  // Modal State
  const [selectedApplication, setSelectedApplication] = useState<RetailerApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<RetailerApplication | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status Counts for Tabs
  const [statusCounts, setStatusCounts] = useState<{
    all: number;
    pending: number;
    under_review: number;
    approved: number;
    rejected: number;
  }>({
    all: 0,
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
  });

  const fetchApplications = useCallback(async () => {
    try {
      const res = await retailerApplicationApiService.getApplications({
        status: activeStatus,
        search: searchQuery,
        page,
        limit: pageSize,
      });

      setError(null);
      setApplications(res.applications);
      setTotalPages(res.totalPages);
      setTotalRecords(res.total);

      // Refresh overall status counters when on 'all' tab with no query
      if (activeStatus === 'all' && !searchQuery.trim()) {
        const counts = {
          all: res.total,
          pending: res.applications.filter((a) => a.status === 'pending').length,
          under_review: res.applications.filter((a) => a.status === 'under_review').length,
          approved: res.applications.filter((a) => a.status === 'approved').length,
          rejected: res.applications.filter((a) => a.status === 'rejected').length,
        };
        setStatusCounts(counts);
      }
    } catch (err: unknown) {
      console.error('[Retailer Applications Page] Load error:', err);
      const msg = err instanceof Error ? err.message : 'Failed to load retailer applications.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeStatus, searchQuery, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchApplications();
  }, [fetchApplications]);

  const handleStatusChange = (status: FilterStatus) => {
    setActiveStatus(status);
    setPage(1);
    setLoading(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLoading(true);
    void fetchApplications();
  };

  const handleManualRefresh = () => {
    setLoading(true);
    void fetchApplications();
  };

  const handleViewDetails = (app: RetailerApplication) => {
    setSelectedApplication(app);
    setIsDetailModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return;
    try {
      setDeleteLoading(true);
      await retailerApplicationApiService.deleteApplication(appToDelete.id);
      setIsDeleteModalOpen(false);
      setAppToDelete(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      void fetchApplications();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete application.';
      alert(`Error deleting application: ${msg}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending Review
          </span>
        );
    }
  };

  const formatApplicationDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Building2 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                B2B Retailer Applications
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Review and manage incoming B2B retailer account registrations received from the Cool Technologies website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', loading && 'animate-spin text-blue-600')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Inbound</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalRecords}</p>
          <span className="text-[11px] font-semibold text-slate-400">Applications Received</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-amber-600">Pending CEO Review</span>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {applications.filter((a) => a.status === 'pending').length}
          </p>
          <span className="text-[11px] font-semibold text-amber-600">Awaiting Decision</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Approved Retailers</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {applications.filter((a) => a.status === 'approved').length}
          </p>
          <span className="text-[11px] font-semibold text-emerald-600">Verified B2B Accounts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-rose-600">Rejected / Declined</span>
          <p className="text-2xl font-black text-rose-600 mt-1">
            {applications.filter((a) => a.status === 'rejected').length}
          </p>
          <span className="text-[11px] font-semibold text-rose-600">Ineligible Applications</span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 border-b lg:border-b-0 border-slate-100 pb-2 lg:pb-0">
            {(
              [
                { id: 'all', label: 'All Applications', count: statusCounts.all },
                { id: 'pending', label: 'Pending', count: statusCounts.pending },
                { id: 'under_review', label: 'Under Review', count: statusCounts.under_review },
                { id: 'approved', label: 'Approved', count: statusCounts.approved },
                { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
              ] as const
            ).map((tab) => {
              const isActive = activeStatus === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
                    isActive
                      ? 'bg-[#1677FF] text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60'
                  )}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span
                      className={cn(
                        'px-1.5 py-0.2 rounded-full text-[10px] font-bold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-200 text-slate-700'
                      )}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business, contact, license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
            />
          </form>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {/* Retailer Applications Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Retailer Name</th>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4">Application Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Loading retailer applications...</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No Retailer Applications Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {searchQuery
                        ? 'Try adjusting your search criteria or switching status filters.'
                        : 'New B2B applications submitted through the website will appear here.'}
                    </p>
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-default"
                  >
                    {/* 1. Retailer Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {app.contactPerson || 'N/A'}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {app.designation || 'Proprietor / Representative'}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {app.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {app.phone}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Business Name */}
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{app.companyName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                            Lic: {app.tradeLicenseNumber || 'N/A'}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {app.emirate || 'Dubai'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 3. Application Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium">{formatApplicationDate(app.createdAt)}</span>
                      </div>
                    </td>

                    {/* 4. Application Status */}
                    <td className="py-3.5 px-4">{renderStatusBadge(app.status)}</td>

                    {/* 5. Actions (View Details & Delete) */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/customers/retailer-applications/${app.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-[#1677FF] font-bold text-xs shadow-2xs transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setAppToDelete(app);
                            setIsDeleteModalOpen(true);
                          }}
                          title="Delete Application"
                          className="inline-flex items-center justify-center p-1.5 rounded-xl bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 shadow-2xs transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">
            Showing{' '}
            <strong className="text-slate-800">
              {applications.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </strong>{' '}
            to{' '}
            <strong className="text-slate-800">
              {Math.min(page * pageSize, totalRecords)}
            </strong>{' '}
            of <strong className="text-slate-800">{totalRecords}</strong> applications
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 text-slate-600 font-medium">
              Page {page} of {totalPages || 1}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Read-Only Details Modal */}
      <RetailerApplicationDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && appToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Delete Retailer Application?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to permanently delete the application for{' '}
                  <strong className="text-slate-800">{appToDelete.companyName}</strong> (License:{' '}
                  <span className="font-mono">{appToDelete.tradeLicenseNumber || 'N/A'}</span>)?
                  This action will remove it from the CRM.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setAppToDelete(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteConfirm()}
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

export default function RetailerApplicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading Retailer Applications module...</span>
        </div>
      }
    >
      <RetailerApplicationsContent />
    </Suspense>
  );
}
