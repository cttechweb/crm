'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  User,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Clock,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Hash,
  FileCheck2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  retailerApplicationApiService,
  RetailerApplication,
} from '@/services/retailerApplicationApiService';
import { notificationService } from '@/services/notificationService';
import { Modal } from '@/components/ui/Modal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RetailerApplicationDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const applicationId = resolvedParams.id;
  const router = useRouter();

  const [application, setApplication] = useState<RetailerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Action Modals State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Form inputs for modals
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Incomplete or unverified documentation');
  const [customRejectionReason, setCustomRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await retailerApplicationApiService.getApplicationById(applicationId);
      setApplication(data);
    } catch (err: unknown) {
      console.error('[Retailer Application Detail Page] Error fetching:', err);
      const msg = err instanceof Error ? err.message : 'Failed to retrieve application details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  // Handle Approve
  const handleApprove = async () => {
    if (!application) return;
    try {
      setActionLoading(true);
      const updated = await retailerApplicationApiService.approveApplication(
        application.id,
        approvalNotes
      );
      setApplication(updated);
      setIsApproveModalOpen(false);
      setActionSuccessMessage('Application has been successfully approved.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      notificationService.addLocalNotification({
        title: `Retailer Approved: ${updated.companyName}`,
        message: `B2B Retailer Application for ${updated.companyName} (Lic: ${updated.tradeLicenseNumber || 'N/A'}) was approved.`,
        type: 'approval',
        linkUrl: `/customers/retailer-applications/${updated.id}`,
        metadata: { applicationId: updated.id, companyName: updated.companyName },
      });
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve application.';
      alert(`Error approving application: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!application) return;
    try {
      setDeleteLoading(true);
      await retailerApplicationApiService.deleteApplication(application.id);
      setIsDeleteModalOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      router.push('/customers/retailer-applications');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete application.';
      alert(`Error deleting application: ${msg}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle Reject
  const handleReject = async () => {
    if (!application) return;
    const finalReason = rejectionReason === 'Other' ? customRejectionReason.trim() : rejectionReason;
    if (!finalReason) {
      alert('Please select or specify a rejection reason.');
      return;
    }

    try {
      setActionLoading(true);
      const updated = await retailerApplicationApiService.rejectApplication(
        application.id,
        finalReason,
        rejectionNotes
      );
      setApplication(updated);
      setIsRejectModalOpen(false);
      setActionSuccessMessage('Application has been marked as rejected.');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      notificationService.addLocalNotification({
        title: `Retailer Rejected: ${updated.companyName}`,
        message: `B2B Retailer Application for ${updated.companyName} was rejected. Reason: ${finalReason}`,
        type: 'closure',
        linkUrl: `/customers/retailer-applications/${updated.id}`,
        metadata: { applicationId: updated.id, companyName: updated.companyName, reason: finalReason },
      });
      setTimeout(() => setActionSuccessMessage(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application.';
      alert(`Error rejecting application: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved Retailer Account
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Application Rejected
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Under Commercial Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending CEO Review
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Loading B2B retailer application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-10 max-w-5xl mx-auto">
        <Link
          href="/customers/retailer-applications"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to B2B Applications
        </Link>
        <div className="p-8 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">Application Not Found</h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">{error || 'Could not locate retailer record.'}</p>
          <button
            onClick={() => void fetchApplication()}
            className="mt-5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const isPending = application.status === 'pending' || application.status === 'under_review';

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Breadcrumbs & Title */}
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link
                  href="/customers/retailer-applications"
                  className="hover:text-blue-600 transition-colors font-medium flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  B2B Applications
                </Link>
                <span>/</span>
                <span className="text-slate-900 font-semibold truncate max-w-[200px]">
                  {application.companyName}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  {application.companyName}
                </h1>
                {getStatusBadge(application.status)}
              </div>
            </div>

            {/* Right: Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => void fetchApplication()}
                className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Delete Application"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Delete</span>
              </button>

              {isPending && (
                <>
                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Reject Application
                  </button>

                  <button
                    onClick={() => setIsApproveModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Application
                  </button>
                </>
              )}
            </div>
          </div>

          {actionSuccessMessage && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {actionSuccessMessage}
            </div>
          )}
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Columns (Left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Business & Legal Entity Profile */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Business &amp; Legal Entity Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Trading Name</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{application.companyName || 'N/A'}</p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Legal Registered Entity</span>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{application.legalName || application.companyName || 'N/A'}</p>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                  <span className="text-blue-700 font-semibold block text-[11px]">Trade License Number</span>
                  <p className="font-mono font-black text-blue-950 mt-0.5 text-sm tracking-wide">
                    {application.tradeLicenseNumber || 'N/A'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-semibold block text-[11px]">Tax Registration Number (TRN)</span>
                  <p className="font-mono font-bold text-slate-900 mt-0.5 text-sm">
                    {application.taxRegistrationNumber || 'Not Registered / Pending TRN'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Business Sector / Classification</span>
                  <p className="font-bold text-slate-900 capitalize mt-1">
                    {application.businessType || 'General Retailer / Contractor'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 font-medium block">Operating Emirate &amp; City</span>
                  <p className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {application.emirate || 'Dubai'}{application.city && application.city !== application.emirate ? `, ${application.city}` : ''}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-500 font-medium block">Registered Physical Address</span>
                  <p className="font-semibold text-slate-800 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {application.address || 'Address details not specified in application'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Commercial Parameters & Equipment Categories */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Commercial Parameters &amp; Requirements
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Estimated Annual Purchasing Volume</span>
                  <p className="font-black text-slate-900 text-sm mt-0.5">
                    {application.annualVolumeEstimate || 'Standard Volume (AED 100,000+)'}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 font-medium block">Requested Payment Terms</span>
                  <p className="font-black text-blue-700 text-sm mt-0.5">
                    {application.paymentTermsRequested || 'Standard Direct Payment Terms'}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-medium block text-xs mb-1.5">Categories of Interest</span>
                <div className="flex flex-wrap gap-2">
                  {application.interestedCategories && application.interestedCategories.length > 0 ? (
                    application.interestedCategories.map((category, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold"
                      >
                        <Layers className="w-3 h-3 text-blue-500" />
                        {category}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-xs">No specific categories specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Uploaded Compliance Files */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Uploaded Compliance Documents
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trade License Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Official Trade License</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {application.hasTradeLicense ? 'Verified document submitted' : 'Document pending'}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Lic: {application.tradeLicenseNumber}
                      </p>
                    </div>
                  </div>

                  <div>
                    {application.tradeLicenseUrl ? (
                      <a
                        href={application.tradeLicenseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <span>View Trade License PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-slate-400 italic bg-white rounded border border-slate-200">
                        File not provided
                      </div>
                    )}
                  </div>
                </div>

                {/* Tax / VAT Certificate Card */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">VAT / Tax Certificate</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {application.hasTaxCertificate ? 'TRN document uploaded' : 'Optional document not provided'}
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        TRN: {application.taxRegistrationNumber || 'None'}
                      </p>
                    </div>
                  </div>

                  <div>
                    {application.taxCertificateUrl ? (
                      <a
                        href={application.taxCertificateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <span>View VAT Certificate PDF</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <div className="text-center py-1.5 text-xs text-slate-400 italic bg-white rounded border border-slate-200">
                        Optional / Not provided
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Decision & Audit Log */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Review &amp; Audit Trail
                </h3>
              </div>

              {application.status === 'approved' ? (
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Application Approved by {application.reviewedByName || 'Management'}
                  </div>
                  {application.reviewedAt && (
                    <p className="text-emerald-700 text-[11px]">
                      Timestamp: {new Date(application.reviewedAt).toLocaleString()}
                    </p>
                  )}
                  {application.reviewNotes && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 text-slate-700">
                      <span className="font-semibold block text-emerald-900">Review Notes:</span>
                      <p className="mt-0.5">{application.reviewNotes}</p>
                    </div>
                  )}
                </div>
              ) : application.status === 'rejected' ? (
                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    Application Rejected by {application.reviewedByName || 'Management'}
                  </div>
                  {application.reviewedAt && (
                    <p className="text-rose-700 text-[11px]">
                      Timestamp: {new Date(application.reviewedAt).toLocaleString()}
                    </p>
                  )}
                  {application.rejectionReason && (
                    <div className="mt-2 pt-2 border-t border-rose-200/60 text-slate-800">
                      <span className="font-bold block text-rose-900">Rejection Reason:</span>
                      <p className="mt-0.5 font-medium">{application.rejectionReason}</p>
                    </div>
                  )}
                  {application.reviewNotes && (
                    <div className="mt-1 text-slate-700">
                      <span className="font-semibold block text-rose-900">Additional Notes:</span>
                      <p className="mt-0.5">{application.reviewNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Awaiting Decision</h4>
                    <p className="text-amber-800 mt-0.5 text-[11px]">
                      This registration is in the pending queue awaiting commercial evaluation and CEO approval.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Contact, Metadata & Actions */}
          <div className="space-y-6">
            {/* 1. Primary Contact Person Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Contact Information
                </h3>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-base">
                  {application.contactPerson?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{application.contactPerson}</h4>
                  <p className="text-xs text-slate-500 font-medium">
                    {application.designation || 'Owner / Authorized Representative'}
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Email Address</span>
                  <a
                    href={`mailto:${application.email}`}
                    className="font-bold text-blue-600 hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    {application.email}
                  </a>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Direct Phone Number</span>
                  <a
                    href={`tel:${application.phone}`}
                    className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {application.phone}
                  </a>
                </div>

                {application.whatsappNumber && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200">
                    <span className="text-emerald-700 block text-[11px]">WhatsApp Business</span>
                    <a
                      href={`https://wa.me/${application.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-emerald-800 hover:underline flex items-center gap-1.5 mt-0.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      {application.whatsappNumber}
                    </a>
                  </div>
                )}
              </div>
            </div>


            {/* 3. Quick Action Decision Card */}
            {isPending && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-5 shadow-md space-y-4">
                <div>
                  <h4 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Review Decision Required
                  </h4>
                  <p className="text-xs text-slate-300 mt-1">
                    Verify company trade license and credentials before approving wholesale terms.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => setIsApproveModalOpen(true)}
                    className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Application
                  </button>

                  <button
                    onClick={() => setIsRejectModalOpen(true)}
                    className="w-full py-2 px-4 bg-slate-800 hover:bg-rose-950 text-rose-300 border border-rose-800/60 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* Approve Confirmation Modal */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Retailer Application"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900">
            <p className="font-bold">You are approving this B2B retailer application:</p>
            <p className="mt-1 font-semibold text-sm text-emerald-950">{application.companyName}</p>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              License: {application.tradeLicenseNumber} · Contact: {application.contactPerson} ({application.email})
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Approval Notes / Commercial Terms (Optional)
            </label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="e.g. Approved for Net 30 wholesale terms. Standard contractor discount matrix applied."
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsApproveModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleApprove()}
              disabled={actionLoading}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Approving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm &amp; Approve Retailer
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* ==================================================================== */}
      {/* Reject Confirmation Modal */}
      {/* ==================================================================== */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Retailer Application"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900">
            <p className="font-bold">Are you sure you want to reject this application?</p>
            <p className="mt-1 font-semibold text-rose-950">{application.companyName}</p>
            <p className="text-[11px] text-rose-700 mt-0.5">
              License: {application.tradeLicenseNumber}
            </p>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Rejection Reason <span className="text-rose-500">*</span>
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Incomplete or unverified documentation">Incomplete or unverified documentation</option>
              <option value="Expired Trade License">Expired Trade License</option>
              <option value="Invalid Contact or Phone Number">Invalid Contact or Phone Number</option>
              <option value="Company details could not be authenticated with DED">Company details could not be authenticated with DED</option>
              <option value="Outside eligible service territories">Outside eligible service territories</option>
              <option value="Other">Other (Specify Below)</option>
            </select>
          </div>

          {rejectionReason === 'Other' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Custom Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customRejectionReason}
                onChange={(e) => setCustomRejectionReason(e.target.value)}
                placeholder="Enter specific rejection reason"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Internal Review Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              placeholder="Additional internal notes for CRM audit..."
              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => void handleReject()}
              disabled={actionLoading}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              {actionLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  Confirm Rejection
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && application && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 text-center">
                Delete Retailer Application?
              </h3>
              <p className="text-xs text-slate-600 text-center mt-2 leading-relaxed">
                Are you sure you want to permanently delete the application for{' '}
                <strong className="text-slate-800">{application.companyName}</strong> (License:{' '}
                <span className="font-mono">{application.tradeLicenseNumber || 'N/A'}</span>)?
                This action will remove it from the CRM.
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
