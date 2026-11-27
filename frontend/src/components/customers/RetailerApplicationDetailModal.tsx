'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Briefcase,
  MessageCircle,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  retailerApplicationApiService,
  type RetailerApplication,
} from '@/services/retailerApplicationApiService';

interface RetailerApplicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: RetailerApplication | null;
  onStatusChange?: (updated: RetailerApplication) => void;
}

export function RetailerApplicationDetailModal({
  isOpen,
  onClose,
  application: initialApplication,
  onStatusChange,
}: RetailerApplicationDetailModalProps) {
  const [currentApp, setCurrentApp] = useState<RetailerApplication | null>(initialApplication);
  const [actionLoading, setActionLoading] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Incomplete or unverified documentation');

  React.useEffect(() => {
    setCurrentApp(initialApplication);
  }, [initialApplication]);

  if (!isOpen || !currentApp) return null;

  const application = currentApp;
  const isPending = application.status === 'pending' || application.status === 'under_review';

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const updated = await retailerApplicationApiService.approveApplication(application.id);
      setCurrentApp(updated);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      onStatusChange?.(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to approve application.';
      alert(`Approval error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please select a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const updated = await retailerApplicationApiService.rejectApplication(application.id, rejectReason);
      setCurrentApp(updated);
      setIsRejectDialogOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('crm_retailer_app_updated'));
      }
      onStatusChange?.(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reject application.';
      alert(`Rejection error: ${msg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
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

  const formattedDate = application.createdAt
    ? new Date(application.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'N/A';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title="B2B Retailer Application Details"
      description={`Submitted on ${formattedDate} (Ref: ${application.websiteApplicationId || application.id})`}
      icon={<Building2 className="w-5 h-5 text-blue-600" />}
    >
      <div className="space-y-6 pt-2 pb-1">
        {/* Top Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Application Status
            </span>
            <div className="mt-1">{getStatusBadge(application.status)}</div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Record ID
            </span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {application.id}
            </span>
          </div>
        </div>

        {/* Section 1: Business / Company Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Business &amp; Company Information
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Trading Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.companyName || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Legal Registered Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.legalName || application.companyName || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Trade License Number</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">{application.tradeLicenseNumber || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Tax Registration Number (TRN)</span>
              <p className="font-mono font-bold text-slate-900 mt-0.5">
                {application.taxRegistrationNumber || 'Not Registered / Pending'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Business Type</span>
              <p className="font-bold text-slate-900 capitalize mt-0.5">{application.businessType || 'General Retailer'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Emirate / City</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.emirate || 'Dubai'}{application.city && application.city !== application.emirate ? `, ${application.city}` : ''}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium block">Physical Address</span>
              <p className="font-semibold text-slate-900 mt-0.5">{application.address || 'Address not provided'}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Primary Contact Person
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Contact Name</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.contactPerson || 'N/A'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Designation</span>
              <p className="font-bold text-slate-900 mt-0.5">{application.designation || 'Proprietor / Director'}</p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Email Address</span>
              <a
                href={`mailto:${application.email}`}
                className="font-bold text-blue-600 hover:underline mt-0.5 flex items-center gap-1"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {application.email || 'N/A'}
              </a>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Phone Number</span>
              <a
                href={`tel:${application.phone}`}
                className="font-bold text-slate-800 hover:text-blue-600 mt-0.5 flex items-center gap-1"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {application.phone || 'N/A'}
              </a>
            </div>

            {application.whatsappNumber && (
              <div>
                <span className="text-slate-500 font-medium block">WhatsApp Number</span>
                <p className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {application.whatsappNumber}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Commercial Parameters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Commercial Parameters
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Estimated Annual Volume</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.annualVolumeEstimate || 'Standard Volume'}
              </p>
            </div>

            <div>
              <span className="text-slate-500 font-medium block">Requested Payment Terms</span>
              <p className="font-bold text-slate-900 mt-0.5">
                {application.paymentTermsRequested || 'Advance / Standard Terms'}
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-slate-500 font-medium block">Categories of Interest</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {application.interestedCategories && application.interestedCategories.length > 0 ? (
                  application.interestedCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic font-normal">No specific category indicated</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Document Attachments */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Uploaded Documents &amp; Compliance Files
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Trade License */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">Trade License</p>
                  <p className="text-[11px] text-slate-400">
                    {application.hasTradeLicense ? 'Verified File Uploaded' : 'Not Uploaded'}
                  </p>
                </div>
              </div>
              {application.tradeLicenseUrl ? (
                <a
                  href={application.tradeLicenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shrink-0"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] font-medium text-slate-400 italic shrink-0">
                  Unavailable
                </span>
              )}
            </div>

            {/* VAT / Tax Certificate */}
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">VAT Certificate</p>
                  <p className="text-[11px] text-slate-400">
                    {application.hasTaxCertificate ? 'Uploaded Document' : 'Optional (Not Provided)'}
                  </p>
                </div>
              </div>
              {application.taxCertificateUrl ? (
                <a
                  href={application.taxCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors shrink-0"
                >
                  <span>View</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="text-[11px] font-medium text-slate-400 italic shrink-0">
                  Optional
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Section 5: Review & Audit Notes (Read-Only) */}
        {(application.reviewNotes || application.rejectionReason || application.reviewedByName) && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Review Audit Information
            </h4>
            {application.reviewedByName && (
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">Reviewed By:</span>{' '}
                {application.reviewedByName}
                {application.reviewedAt ? ` on ${new Date(application.reviewedAt).toLocaleString()}` : ''}
              </p>
            )}
            {application.reviewNotes && (
              <p className="text-slate-600">
                <span className="font-semibold text-slate-700">Internal Notes:</span>{' '}
                {application.reviewNotes}
              </p>
            )}
            {application.rejectionReason && (
              <p className="text-rose-600">
                <span className="font-semibold">Rejection Reason:</span>{' '}
                {application.rejectionReason}
              </p>
            )}
          </div>
        )}

        {/* Rejection Prompt inside Modal */}
        {isRejectDialogOpen && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-rose-900">Select Reason for Rejection:</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border border-rose-300 rounded-lg p-2 text-xs text-slate-900 bg-white"
            >
              <option value="Incomplete or unverified documentation">Incomplete or unverified documentation</option>
              <option value="Expired Trade License">Expired Trade License</option>
              <option value="Invalid Contact or Phone Number">Invalid Contact or Phone Number</option>
              <option value="Company details could not be authenticated with DED">Company details could not be authenticated with DED</option>
              <option value="Outside eligible service territories">Outside eligible service territories</option>
            </select>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={actionLoading}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        )}

        {/* Modal Action Footer with Approve / Reject / Open Full Page */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <Link
            href={`/customers/retailer-applications/${application.id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Open Dedicated Review Page</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </Button>

            {isPending && !isRejectDialogOpen && (
              <>
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all shadow-2xs"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => void handleApprove()}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Retailer</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
