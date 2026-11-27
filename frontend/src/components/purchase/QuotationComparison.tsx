'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Award,
  Trash2,
  Edit2,
  Calendar,
  Truck,
  DollarSign,
  Layers,
  ArrowRight,
  ShieldAlert,
  Send,
  RefreshCw,
  X,
  FileText,
  Clock,
  FileCheck,
} from 'lucide-react';
import {
  CrmMsrf,
  CrmSupplierQuotation,
  CrmSupplier,
} from '@/types/enterprise-crm';
import {
  msrfApiService,
  purchaseQuotationApiService,
  supplierApiService,
} from '@/services/procurementApiService';
import { MockAuthUser } from '@/services/authMockService';

interface QuotationComparisonProps {
  currentUser: MockAuthUser | null;
  initialMsrfId?: string;
  onNavigateToMsrf?: () => void;
  onNavigateToPo?: (poId?: string) => void;
}

export function QuotationComparison({
  currentUser,
  initialMsrfId,
  onNavigateToMsrf,
  onNavigateToPo,
}: QuotationComparisonProps) {
  const router = useRouter();
  const [msrfs, setMsrfs] = useState<CrmMsrf[]>([]);
  const [selectedMsrfId, setSelectedMsrfId] = useState<string>(initialMsrfId || '');
  const [selectedMsrf, setSelectedMsrf] = useState<CrmMsrf | null>(null);

  const [quotations, setQuotations] = useState<CrmSupplierQuotation[]>([]);
  const [suppliers, setSuppliers] = useState<CrmSupplier[]>([]);
  const [loading, setLoading] = useState(false);

  // Recommendation Submission State
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>('');
  const [recommendationReason, setRecommendationReason] = useState<string>('');
  const [submittingRecommendation, setSubmittingRecommendation] = useState(false);

  // Quotation Entry / Edit Modal
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CrmSupplierQuotation | null>(null);
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Form State
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formQuotationRef, setFormQuotationRef] = useState('');
  const [formQuotationDate, setFormQuotationDate] = useState('');
  const [formValidityDate, setFormValidityDate] = useState('');
  const [formSubtotal, setFormSubtotal] = useState<number>(0);
  const [formTaxAmount, setFormTaxAmount] = useState<number>(0);
  const [formShippingCost, setFormShippingCost] = useState<number>(0);
  const [formInstallationCost, setFormInstallationCost] = useState<number>(0);
  const [formOtherCosts, setFormOtherCosts] = useState<number>(0);
  const [formLeadTimeDays, setFormLeadTimeDays] = useState<number>(7);
  const [formPaymentTerms, setFormPaymentTerms] = useState('Net 30 Days');
  const [paymentTermsList, setPaymentTermsList] = useState<string[]>(() => {
    const defaults = [
      'Net 30 Days',
      'Net 60 Days',
      'Net 90 Days',
      'Cash on Delivery (COD)',
      '100% Advance',
      '50% Advance, 50% on Delivery',
      '30% Advance, 70% on Dispatch',
    ];
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('crm_custom_payment_terms');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Array.from(new Set([...defaults, ...parsed]));
          }
        }
      } catch {}
    }
    return defaults;
  });
  const [showNewTermInput, setShowNewTermInput] = useState(false);
  const [newTermText, setNewTermText] = useState('');

  const handleAddNewPaymentTerm = () => {
    const trimmed = newTermText.trim();
    if (!trimmed) return;
    const updated = Array.from(new Set([...paymentTermsList, trimmed]));
    setPaymentTermsList(updated);
    setFormPaymentTerms(trimmed);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('crm_custom_payment_terms', JSON.stringify(updated));
      } catch {}
    }
    setNewTermText('');
    setShowNewTermInput(false);
  };

  const [formDocumentUrl, setFormDocumentUrl] = useState('');

  // Auto calculate VAT (5%) whenever subtotal changes unless overridden
  const handleSubtotalChange = (val: number) => {
    setFormSubtotal(val);
    setFormTaxAmount(Math.round(val * 0.05 * 100) / 100);
  };

  // Form Computed Landed Cost
  const formComputedLandedCost = useMemo(() => {
    return (
      (Number(formSubtotal) || 0) +
      (Number(formTaxAmount) || 0) +
      (Number(formShippingCost) || 0) +
      (Number(formInstallationCost) || 0) +
      (Number(formOtherCosts) || 0)
    );
  }, [formSubtotal, formTaxAmount, formShippingCost, formInstallationCost, formOtherCosts]);

  // Robust supplier loader merging API suppliers and any locally added suppliers
  const loadSuppliersData = useCallback(async () => {
    try {
      supplierApiService.migrateLocalSuppliersToDatabase().catch(() => {});
      const suppRes = await supplierApiService.getSuppliers({ limit: 100 });
      let list: CrmSupplier[] = [];
      if (suppRes.success && suppRes.suppliers) {
        list = [...suppRes.suppliers];
      }

      // Check localStorage to immediately reflect suppliers created in the current browser session
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('crm_suppliers_list');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach((localSup: any) => {
                const sName = (localSup.supplierName || localSup.name || '').trim();
                if (!sName) return;
                const alreadyExists = list.some(
                  (s) =>
                    s.id === localSup.id ||
                    (s.supplierName && s.supplierName.toLowerCase() === sName.toLowerCase()) ||
                    ((s as any).name && (s as any).name.toLowerCase() === sName.toLowerCase())
                );
                if (!alreadyExists) {
                  list.push({
                    id: localSup.id,
                    slNo: localSup.slNo || list.length + 1,
                    supplierName: sName,
                    companyName: localSup.companyName,
                    trn: localSup.trn,
                    contactPerson: localSup.contactPerson || sName,
                    email: localSup.email,
                    phone: localSup.phone || localSup.contact || '',
                    paymentTerms: localSup.paymentTerms || '30 Days',
                    status: localSup.status || 'Active',
                  });
                }
              });
            }
          } catch {}
        }
      }
      setSuppliers(list);
    } catch (err: any) {
      console.error('Failed to load suppliers in QuotationComparison:', err);
    }
  }, []);

  // Load Approved MSRFs and Suppliers
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const msrfRes = await msrfApiService.getMSRFs();
        if (msrfRes.success) {
          const eligible = msrfRes.requests.filter(
            (r) => r.reportingHeadStatus === 'Approved'
          );
          setMsrfs(eligible);
          if (!selectedMsrfId && eligible.length > 0) {
            setSelectedMsrfId(eligible[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load initial MSRFs in QuotationComparison:', err);
      }
    };
    fetchBaseData();
    loadSuppliersData();

    const handleSuppliersUpdated = () => {
      loadSuppliersData();
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('crm_suppliers_updated', handleSuppliersUpdated);
      window.addEventListener('storage', handleSuppliersUpdated);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('crm_suppliers_updated', handleSuppliersUpdated);
        window.removeEventListener('storage', handleSuppliersUpdated);
      }
    };
  }, [loadSuppliersData]);

  // Sync selected MSRF details and quotes
  useEffect(() => {
    if (!selectedMsrfId) {
      setSelectedMsrf(null);
      setQuotations([]);
      return;
    }

    const loadMsrfAndQuotes = async () => {
      setLoading(true);
      try {
        const [msrfRes, quoteRes] = await Promise.all([
          msrfApiService.getMSRFById(selectedMsrfId),
          purchaseQuotationApiService.getQuotations({ msrfId: selectedMsrfId }),
        ]);

        if (msrfRes.success && msrfRes.request) {
          setSelectedMsrf(msrfRes.request);
        }

        if (quoteRes.success) {
          setQuotations(quoteRes.quotations);
          // Pre-select recommended quote if one exists
          const rec = quoteRes.quotations.find((q) => q.isRecommended);
          if (rec) {
            setSelectedQuoteId(rec.id);
            if (rec.recommendationReason) {
              setRecommendationReason(rec.recommendationReason);
            }
          } else if (quoteRes.quotations.length > 0) {
            setSelectedQuoteId(quoteRes.quotations[0].id);
          }
        }
      } catch (err: any) {
        console.error('Failed to load MSRF quotes:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMsrfAndQuotes();
  }, [selectedMsrfId]);

  // Rule Compliance Check
  const compliance = useMemo(() => {
    const estimated = Number(selectedMsrf?.estimatedTotalValue || 0);
    const lowestLanded =
      quotations.length > 0
        ? Math.min(...quotations.map((q) => q.landedTotalValue || q.subtotal))
        : estimated;
    const evaluatedAmount = Math.max(estimated, lowestLanded);

    const distinctSupplierIds = new Set(quotations.map((q) => q.supplierId)).size;
    const isOver10k = evaluatedAmount >= 10000.0;
    // 3 competing supplier quotations mandated to evaluate and proceed with lowest quotation policy!
    const requiredQuotes = 3;
    const isCompliant = quotations.length >= requiredQuotes || distinctSupplierIds >= requiredQuotes;

    return {
      evaluatedAmount,
      isOver10k,
      distinctCount: Math.max(distinctSupplierIds, quotations.length),
      requiredQuotes,
      isCompliant,
      missingCount: Math.max(0, requiredQuotes - quotations.length),
    };
  }, [selectedMsrf, quotations]);

  // Lowest landed cost identifier
  const lowestLandedQuoteId = useMemo(() => {
    if (quotations.length === 0) return null;
    let minVal = Infinity;
    let minId = null;
    for (const q of quotations) {
      if (q.landedTotalValue < minVal) {
        minVal = q.landedTotalValue;
        minId = q.id;
      }
    }
    return minId;
  }, [quotations]);

  // Automatically select the lowest quotation (L1) when quotations are loaded
  useEffect(() => {
    if (quotations.length > 0 && (!selectedQuoteId || !quotations.some((q) => q.id === selectedQuoteId))) {
      if (lowestLandedQuoteId) {
        setSelectedQuoteId(lowestLandedQuoteId);
      }
    }
  }, [quotations, selectedQuoteId, lowestLandedQuoteId]);

  // Open Create Quote Modal
  const handleOpenCreateQuote = () => {
    loadSuppliersData();
    setEditingQuote(null);
    setFormSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
    setFormQuotationRef('');
    const today = new Date().toISOString().split('T')[0];
    setFormQuotationDate(today);
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);
    setFormValidityDate(in30Days.toISOString().split('T')[0]);
    setFormSubtotal(0);
    setFormTaxAmount(0);
    setFormShippingCost(0);
    setFormInstallationCost(0);
    setFormOtherCosts(0);
    setFormLeadTimeDays(7);
    setFormPaymentTerms('Net 30 Days');
    setFormDocumentUrl('');
    setIsQuoteModalOpen(true);
  };

  // Open Edit Quote Modal
  const handleOpenEditQuote = (q: CrmSupplierQuotation) => {
    loadSuppliersData();
    setEditingQuote(q);
    setFormSupplierId(q.supplierId);
    setFormQuotationRef(q.quotationRef);
    setFormQuotationDate(q.quotationDate);
    setFormValidityDate(q.validityDate || '');
    setFormSubtotal(q.subtotal);
    setFormTaxAmount(q.taxAmount);
    setFormShippingCost(q.shippingDeliveryCost);
    setFormInstallationCost(q.installationCost);
    setFormOtherCosts(q.otherAssociatedCosts);
    setFormLeadTimeDays(q.deliveryLeadTimeDays || 7);
    setFormPaymentTerms(q.paymentTerms || 'Net 30 Days');
    setFormDocumentUrl(q.quoteDocumentUrl || '');
    setIsQuoteModalOpen(true);
  };

  // Submit Quotation Entry Form
  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSupplierId) {
      alert('Please select a supplier.');
      return;
    }
    if (!formQuotationRef.trim()) {
      alert('Please provide the supplier quotation reference number.');
      return;
    }

    const supplierObj = suppliers.find((s) => s.id === formSupplierId);
    const supplierName = supplierObj ? (supplierObj.supplierName || (supplierObj as any).name || 'Vendor') : 'Vendor';

    try {
      setQuoteSubmitting(true);
      // Ensure local supplier is recorded in DB
      if (supplierObj) {
        supplierApiService.createSupplier(supplierObj).catch(() => {});
      }
      const payload: Partial<CrmSupplierQuotation> = {
        msrfId: selectedMsrfId,
        quotationRef: formQuotationRef.trim(),
        quotationDate: formQuotationDate,
        validityDate: formValidityDate || undefined,
        supplierId: formSupplierId,
        supplierName,
        subtotal: Number(formSubtotal) || 0,
        taxAmount: Number(formTaxAmount) || 0,
        shippingDeliveryCost: Number(formShippingCost) || 0,
        installationCost: Number(formInstallationCost) || 0,
        otherAssociatedCosts: Number(formOtherCosts) || 0,
        landedTotalValue: formComputedLandedCost,
        deliveryLeadTimeDays: Number(formLeadTimeDays) || 7,
        paymentTerms: formPaymentTerms,
        quoteDocumentUrl: formDocumentUrl.trim() || undefined,
      };

      if (editingQuote) {
        await purchaseQuotationApiService.updateQuotation(editingQuote.id, payload);
      } else {
        await purchaseQuotationApiService.createQuotation(payload);
      }

      setIsQuoteModalOpen(false);
      setEditingQuote(null);

      // Reload quotes
      const res = await purchaseQuotationApiService.getQuotations({ msrfId: selectedMsrfId });
      if (res.success) {
        setQuotations(res.quotations);
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('crm_msrf_updated'));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to save supplier quotation');
    } finally {
      setQuoteSubmitting(false);
    }
  };

  // Delete Quotation
  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier quotation?')) return;
    try {
      await purchaseQuotationApiService.deleteQuotation(id);
      setQuotations(quotations.filter((q) => q.id !== id));
      if (selectedQuoteId === id) setSelectedQuoteId('');
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('crm_msrf_updated'));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete quotation');
    }
  };

  // Submit Recommendation
  const handleSubmitRecommendation = async () => {
    if (!selectedMsrfId || !selectedQuoteId) {
      alert('Please select a recommended supplier quotation.');
      return;
    }
    if (!recommendationReason.trim()) {
      alert('Please provide a formal justification for selecting this quotation.');
      return;
    }
    if (!compliance.isCompliant) {
      alert(
        `Quotation threshold non-compliance: AED ${compliance.evaluatedAmount.toLocaleString()} mandates at least ${compliance.requiredQuotes} competing supplier quotations.`
      );
      return;
    }

    try {
      setSubmittingRecommendation(true);
      const res = await msrfApiService.submitRecommendation(selectedMsrfId, {
        selectedQuotationId: selectedQuoteId,
        recommendationReason: recommendationReason.trim(),
        isSingleSource: quotations.length < 3,
        singleSourceJustification: recommendationReason.trim(),
      });
      if (res.success && res.request) {
        setSelectedMsrf(res.request);
        alert('Procurement recommendation submitted successfully! You can now generate the Purchase Order.');
        // Refresh quotes
        const qRes = await purchaseQuotationApiService.getQuotations({ msrfId: selectedMsrfId });
        if (qRes.success) setQuotations(qRes.quotations);
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('crm_msrf_updated'));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to submit recommendation');
    } finally {
      setSubmittingRecommendation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Context Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="flex-1 max-w-md">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Select Approved Material Request
            </label>
            <select
              value={selectedMsrfId}
              onChange={(e) => setSelectedMsrfId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {msrfs.length === 0 ? (
                <option value="">No authorized Material Requests ready for sourcing</option>
              ) : (
                msrfs.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.msrfNumber} - {m.purpose} (AED {Number(m.estimatedTotalValue || 0).toLocaleString()})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToMsrf && (
            <button
              onClick={onNavigateToMsrf}
              className="px-3 py-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              View Material Requests
            </button>
          )}
          <button
            onClick={handleOpenCreateQuote}
            disabled={!selectedMsrfId}
            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Add Supplier Quotation
          </button>
        </div>
      </div>

      {/* Selected MSRF Summary Card */}
      {selectedMsrf && (
        <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-slate-400">Requisition:</span>{' '}
              <span className="font-mono font-bold text-slate-900">{selectedMsrf.msrfNumber}</span>
            </div>
            <div>
              <span className="text-slate-400">Requestor:</span>{' '}
              <span className="font-semibold text-slate-700">{selectedMsrf.requestorName}</span>
            </div>
            <div>
              <span className="text-slate-400">Department:</span>{' '}
              <span className="font-semibold text-slate-700">{selectedMsrf.department}</span>
            </div>
            <div>
              <span className="text-slate-400">Priority:</span>{' '}
              <span className="font-semibold text-blue-600">{selectedMsrf.priority}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400">Est. Budget:</span>{' '}
              <span className="font-bold text-slate-900">
                AED {Number(selectedMsrf.estimatedTotalValue || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Status:</span>{' '}
              <span className="font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
                {selectedMsrf.procurementStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Warehouse Shortage Directives & Instructions from Fahad */}
      {selectedMsrf?.purchaseInstructions && (
        <div className="p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl text-xs space-y-1 shadow-xs">
          <div className="font-bold text-purple-950 flex items-center gap-1.5">
            <span className="text-sm">📝</span>
            Warehouse Shortage Directives &amp; Instructions for Purchase Dept:
          </div>
          <p className="italic text-purple-900 bg-white/80 p-2.5 rounded-lg border border-purple-200/60 font-medium">
            &quot;{selectedMsrf.purchaseInstructions}&quot;
          </p>
        </div>
      )}

      {/* Governance Threshold Validation Banner */}
      {selectedMsrf && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition ${
            compliance.isCompliant
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
          }`}
        >
          {compliance.isCompliant ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm">
                Procurement Sourcing Status:{' '}
                {compliance.isCompliant
                  ? `Competitive Quotation Comparison Complete (${compliance.distinctCount} Suppliers)`
                  : compliance.distinctCount > 0
                    ? `Competitive Sourcing in Progress (${compliance.distinctCount} of 3 Suppliers Recorded)`
                    : '3 Competing Supplier Quotations Required'}
              </span>
              <span className="font-mono font-semibold">
                Evaluated Value: AED {compliance.evaluatedAmount.toLocaleString('en-AE', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="mt-1 leading-relaxed">
              {compliance.distinctCount === 0 ? (
                <>
                  Corporate Procurement Policy mandates <span className="font-bold text-purple-700">at least 3 competing supplier quotations</span> to ensure price competition and proceed with the lowest quotation. Click <span className="font-bold text-purple-700">+ Add Supplier Quotation</span> above to record the first quotation.
                </>
              ) : compliance.distinctCount < 3 ? (
                <>
                  <span className="font-bold">{compliance.distinctCount} of 3 supplier quotations recorded.</span> Please record {compliance.missingCount} more competing quotation(s) from different vendors to fulfill the 3-quote policy and award to the lowest quotation.
                </>
              ) : (
                <>
                  <span className="font-bold">All {compliance.distinctCount} competing supplier quotations recorded!</span> The lowest landed quotation is automatically identified with a green badge. Mustafa can now select the lowest bidder and submit the recommendation to generate the Purchase Order.
                </>
              )}
            </p>

            {!compliance.isCompliant && (
              <div className="mt-2 text-amber-800 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Action Required: Please record {compliance.missingCount} more competing quotation{compliance.missingCount > 1 ? 's' : ''} (need 3 total from distinct suppliers) to proceed with the lowest bid.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quotations Comparison Matrix */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-slate-900">Supplier Quotations Comparison Matrix</h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
              {quotations.length} quote(s)
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Compare all landed charges: base rate, VAT, shipping, installation, and payment terms.
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
            Loading quotation records...
          </div>
        ) : quotations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <div className="font-semibold text-slate-700">No Supplier Quotations Entered Yet</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click &quot;Add Supplier Quotation&quot; above to log quotes received from vendors for side-by-side comparison.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 text-center">Select</th>
                  <th className="py-3 px-3">Supplier Name</th>
                  <th className="py-3 px-3">Quote Ref</th>
                  <th className="py-3 px-3">Date / Validity</th>
                  <th className="py-3 px-3 text-right">Subtotal</th>
                  <th className="py-3 px-3 text-right">VAT (5%)</th>
                  <th className="py-3 px-3 text-right">Freight</th>
                  <th className="py-3 px-3 text-right">Install / Other</th>
                  <th className="py-3 px-3 text-right font-bold text-slate-800">Landed Total (AED)</th>
                  <th className="py-3 px-3 text-center">Lead Time</th>
                  <th className="py-3 px-3">Payment Terms</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotations.map((q) => {
                  const isLowest = q.id === lowestLandedQuoteId;
                  const isSelected = q.id === selectedQuoteId;
                  return (
                    <tr
                      key={q.id}
                      className={`hover:bg-slate-50/70 transition ${
                        isSelected ? 'bg-purple-50/40' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="radio"
                          name="recommendedQuote"
                          checked={isSelected}
                          onChange={() => setSelectedQuoteId(q.id)}
                          className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          {q.quotationRef.toLowerCase().includes('shezin') ? 'shezin' : q.supplierName}
                          {isLowest && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Award className="w-3 h-3" /> Lowest
                            </span>
                          )}
                          {q.isRecommended && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                              Recommended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-medium text-slate-700">{q.quotationRef}</td>
                      <td className="py-3 px-3 text-slate-500">
                        <div>{q.quotationDate}</div>
                        {q.validityDate && (
                          <div className="text-[10px] text-slate-400">Valid to: {q.validityDate}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-700">
                        {Number(q.subtotal || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {Number(q.taxAmount || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {Number(q.shippingDeliveryCost || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-500">
                        {(Number(q.installationCost || 0) + Number(q.otherAssociatedCosts || 0)).toLocaleString(
                          'en-AE',
                          { minimumFractionDigits: 2 }
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                        AED {Number(q.landedTotalValue || 0).toLocaleString('en-AE', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap font-medium text-slate-700">
                        {q.deliveryLeadTimeDays} days
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{q.paymentTerms || 'Standard'}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => router.push(`/purchase?tab=po&action=add&msrfId=${selectedMsrfId}&quoteId=${q.id}`)}
                            className="p-1 text-slate-500 hover:text-emerald-600 rounded hover:bg-emerald-50 transition cursor-pointer"
                            title="Create Purchase Order (Autofill) with this Quote"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                          <button
                            onClick={() => handleOpenEditQuote(q)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                            title="Edit Quote"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100"
                            title="Delete Quote"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recommendation Submission Panel */}
      {quotations.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Procurement Officer Recommendation</h4>
              <p className="text-xs text-slate-500">
                Formally record supplier selection rationale for management and audit inspection.
              </p>
            </div>
            {selectedQuoteId && (
              <span className="text-xs font-mono font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg">
                Selected Quote: {quotations.find((q) => q.id === selectedQuoteId)?.quotationRef}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selection Rationale / Recommendation Remarks <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="e.g. Selected Al-Madina Trading due to lowest landed cost (AED 12,450 vs 13,800), favorable 30-day payment credit, and guaranteed 5-day delivery to Al-Barsha site..."
              value={recommendationReason}
              onChange={(e) => setRecommendationReason(e.target.value)}
              rows={3}
              className="w-full p-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              {!compliance.isCompliant ? (
                <span className="text-amber-600 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Cannot submit: 3 competing supplier quotations required ({compliance.distinctCount} of 3 recorded).
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 3-Quote policy satisfied ({compliance.distinctCount} quotes). Ready to proceed with lowest quotation.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSubmitRecommendation}
                disabled={submittingRecommendation || !compliance.isCompliant || !selectedQuoteId}
                className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingRecommendation ? 'Submitting...' : 'Submit Purchase Recommendation'}
              </button>
              {selectedQuoteId && (
                <button
                  type="button"
                  onClick={() => router.push(`/purchase?tab=po&action=add&msrfId=${selectedMsrfId}&quoteId=${selectedQuoteId}`)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                  title="Autofill Purchase Order with this Recommendation"
                >
                  <FileCheck className="w-3.5 h-3.5" />
                  <span>Create PO (Autofill)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Quotation Modal */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingQuote ? 'Edit Supplier Quotation' : 'Add Supplier Quotation'}
                </h3>
                <p className="text-xs text-slate-500">
                  Enter supplier pricing, taxes, freight, and commercial terms
                </p>
              </div>
              <button
                onClick={() => setIsQuoteModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitQuote} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Supplier / Vendor <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">-- Select Registered Supplier --</option>
                    {suppliers.map((s) => {
                      const name = s.supplierName || (s as any).name || 'Unnamed Supplier';
                      return (
                        <option key={s.id} value={s.id}>
                          {name} {s.trn ? `(TRN: ${s.trn})` : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quotation Reference # <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. QT-2026-9912"
                    value={formQuotationRef}
                    onChange={(e) => setFormQuotationRef(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quotation Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formQuotationDate}
                    onChange={(e) => setFormQuotationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Validity Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formValidityDate}
                    onChange={(e) => setFormValidityDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Financial Breakdown Section */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Financial Breakdown (AED)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-600 font-medium mb-0.5">Base Subtotal *</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={formSubtotal === 0 ? '' : formSubtotal}
                      onChange={(e) => handleSubtotalChange(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-right font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-medium mb-0.5">VAT 5% (AED)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={formTaxAmount === 0 ? '' : formTaxAmount}
                      onChange={(e) => setFormTaxAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-right font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-600 font-medium mb-0.5">Shipping / Freight (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="0.00"
                      value={formShippingCost === 0 ? '' : formShippingCost}
                      onChange={(e) => setFormShippingCost(e.target.value === '' ? 0 : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs bg-white text-right font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-purple-100/70 p-2.5 rounded-lg border border-purple-200 flex items-center justify-between">
                  <span className="text-xs text-purple-900 font-bold">Total Landed Cost:</span>
                  <span className="text-base font-mono font-bold text-purple-900">
                    AED {formComputedLandedCost.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Commercial Terms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Delivery Lead Time (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formLeadTimeDays}
                    onChange={(e) => setFormLeadTimeDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Payment Terms</label>
                    <button
                      type="button"
                      onClick={() => setShowNewTermInput(!showNewTermInput)}
                      className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-0.5 cursor-pointer"
                      title="Add a custom dynamic payment term"
                    >
                      <Plus className="w-3 h-3" /> New
                    </button>
                  </div>
                  <select
                    value={formPaymentTerms}
                    onChange={(e) => {
                      if (e.target.value === '__ADD_NEW__') {
                        setShowNewTermInput(true);
                      } else {
                        setFormPaymentTerms(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    {paymentTermsList.map((term) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                    <option value="__ADD_NEW__" className="text-purple-700 font-bold">
                      + Add New Payment Term...
                    </option>
                  </select>

                  {showNewTermInput && (
                    <div className="mt-1.5 p-2 bg-purple-50/70 border border-purple-200 rounded-lg flex items-center gap-1.5 animate-in fade-in duration-150">
                      <input
                        type="text"
                        placeholder="e.g. 45 Days PDC, 30% Adv 70% BL..."
                        value={newTermText}
                        onChange={(e) => setNewTermText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddNewPaymentTerm();
                          }
                        }}
                        className="flex-1 px-2.5 py-1 text-xs border border-purple-300 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={handleAddNewPaymentTerm}
                        className="px-2.5 py-1 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded transition cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewTermInput(false);
                          setNewTermText('');
                        }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quotation Document URL / Storage Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. https://storage.cooltech.ae/procurement/quote-9912.pdf"
                  value={formDocumentUrl}
                  onChange={(e) => setFormDocumentUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quoteSubmitting}
                  className="px-5 py-2 font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition shadow-sm"
                >
                  {quoteSubmitting ? 'Saving...' : editingQuote ? 'Update Quotation' : 'Save Quotation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
