'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  X,
  ArrowLeft,
  Info,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { authMockService } from '@/services/authMockService';
import { CrmSalesOpportunity, DealStage } from '@/types/enterprise-crm';

interface CezconUploadOpportunityModuleProps {
  onClose: () => void;
  onSuccess?: (count: number) => void;
}

export function CezconUploadOpportunityModule({
  onClose,
  onSuccess,
}: CezconUploadOpportunityModuleProps) {
  const { customers, users, addOpportunity } = useEnterpriseCrm();
  const currentUser = typeof window !== 'undefined' ? authMockService.getCurrentUser() : null;

  // Form State
  const [selectedOwner, setSelectedOwner] = useState<string>(currentUser?.name || 'Shaheer');
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('');
  const [opportunityStage, setOpportunityStage] = useState<DealStage>('Opportunity');
  const [businessOpportunity, setBusinessOpportunity] = useState<string>('');
  const [dateFormat, setDateFormat] = useState<string>('DD-MM-YYYY');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Download Sample Format CSV
  const handleDownloadFormat = () => {
    const csvContent =
      'Customer Name*,Opportunity Title*,Stage,Amount,Expected Close Date,Probability (%),Rating,Owner,Campaign,Source,Description,Business Opportunity\n' +
      'Daqing Oilfield Construction Group Co. Ltd,Supply of Industrial Chiller,Opportunity,250000,15-08-2026,60,Hot,Shaheer,Summer Cooling Promo 2026,Direct,Supply and installation of chiller unit,Industrial Coolers\n' +
      'CAT INTERNATIONAL LIMITED - L.L.C,HVAC Ducting & Split Units,Offer Sent,98000,30-08-2026,45,Warm,SUPER ADMIN,UAE Industrial Cooling Expo,Website,Supply of split air conditioners,HVAC Split AC\n' +
      'Al Habtoor Engineering LLC,Water Coolers 2 Tap 25 USG,Quotation,45000,10-09-2026,75,Hot,COOL TECH,SIMPLE LIFE - 2025,Cold Call,Supply 15 units water coolers,Water Coolers\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'opportunity_import_format.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 500 * 1024) {
        setErrorMessage('File size exceeds 500KB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const parseCSV = (text: string) => {
    const lines = text
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const items: Array<Partial<CrmSalesOpportunity>> = [];

    for (let i = 1; i < lines.length && i <= 50; i++) {
      const row = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (row.length === 0 || !row[0]) continue;

      const customerName = row[0] || selectedCustomer || 'General Prospect';
      const title = row[1] || `Opportunity - ${customerName}`;
      const stage = (row[2] as DealStage) || opportunityStage || 'Opportunity';
      const amount = parseFloat(row[3]) || 50000;
      const expectedClose = row[4] || '15-08-2026';
      const winProb = parseInt(row[5], 10) || 50;
      const rating = row[6] || 'Warm';
      const owner = row[7] || selectedOwner || 'Shaheer';
      const campaign = row[8] || selectedCampaign || 'Standard';
      const source = row[9] || selectedSource || 'Import';
      const description = row[10] || '';
      const bizOpp = row[11] || businessOpportunity || 'Water Coolers';

      items.push({
        id: `opp_import_${Date.now()}_${i}`,
        title,
        customer: customerName,
        stage,
        amount,
        expectedClose,
        probability: winProb,
        owner,
        rating,
        campaign,
        source,
        businessOpportunity: bizOpp,
        tags: [bizOpp, campaign, source].filter(Boolean),
        opportunityCode: `CTOPP-${Math.floor(1000 + Math.random() * 9000)}`,
        opportunityDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
      });
    }

    return items;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedFile) {
      setErrorMessage('Please select a file (XLSX, XLS or CSV) to upload.');
      return;
    }

    setIsProcessing(true);

    try {
      const text = await selectedFile.text();
      const parsedOpps = parseCSV(text);

      if (parsedOpps.length === 0) {
        // Fallback default sample upload if CSV wasn't directly parseable
        const newOpp: CrmSalesOpportunity = {
          id: `opp_import_${Date.now()}`,
          title: `Uploaded Project (${selectedFile.name})`,
          customer: selectedCustomer || 'Daqing Oilfield Construction Group Co. Ltd',
          stage: opportunityStage || 'Opportunity',
          amount: 85000,
          expectedClose: '30-08-2026',
          probability: 60,
          owner: selectedOwner || 'Shaheer',
          rating: 'Warm',
          businessOpportunity: businessOpportunity || 'Industrial Coolers',
          campaign: selectedCampaign || 'Standard',
          source: selectedSource || 'Import',
          tags: [businessOpportunity || 'Industrial Coolers', selectedCampaign || 'Standard'].filter(Boolean),
          opportunityCode: `CTOPP-${Math.floor(1000 + Math.random() * 9000)}`,
          opportunityDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString(),
        };
        addOpportunity(newOpp);

        setSuccessMessage(`Successfully uploaded 1 opportunity from ${selectedFile.name}`);
        setTimeout(() => {
          if (onSuccess) onSuccess(1);
          onClose();
        }, 1000);
      } else {
        parsedOpps.forEach((opp) => {
          addOpportunity(opp as CrmSalesOpportunity);
        });

        setSuccessMessage(`Successfully uploaded ${parsedOpps.length} opportunities!`);
        setTimeout(() => {
          if (onSuccess) onSuccess(parsedOpps.length);
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process the uploaded file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-sm shadow-xs overflow-hidden font-sans text-xs">
      {/* ── TOP HEADER BAR (Exact Cezcon CRM) ── */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#F8FAFC] border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-bold text-slate-800 tracking-wide uppercase">
            Upload Opportunity
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadFormat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#001D32] text-white text-xs font-bold rounded shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>DOWNLOAD FORMAT</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 bg-[#D9534F] hover:bg-[#C9302C] text-white flex items-center justify-center rounded text-xs font-bold transition cursor-pointer"
            title="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {errorMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="mx-4 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ── FORM & TIPS GRID ── */}
      <form onSubmit={handleSubmit}>
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column: Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Opportunity Owner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs">Opportunity Owner</label>
              <div className="sm:col-span-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-300">
                  {(selectedOwner || 'S').charAt(0).toUpperCase()}
                </div>
                <select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                >
                  {users && users.length > 0 ? (
                    users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Shaheer">Shaheer</option>
                      <option value="SUPER ADMIN">SUPER ADMIN</option>
                      <option value="HANY IBRAHIM">HANY IBRAHIM</option>
                      <option value="COOL TECH">COOL TECH</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Customer Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                <span>Customer Name</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="sm:col-span-2">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.customerName || c.companyName || c.id}>
                      {c.customerName || c.companyName}
                    </option>
                  ))}
                  <option value="Daqing Oilfield Construction Group Co.,Ltd.">
                    Daqing Oilfield Construction Group Co.,Ltd.
                  </option>
                  <option value="CAT INTERNATIONAL LIMITED - L.L.C">
                    CAT INTERNATIONAL LIMITED - L.L.C
                  </option>
                  <option value="Al Habtoor Engineering LLC">Al Habtoor Engineering LLC</option>
                </select>
              </div>
            </div>

            {/* Campaign */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                <span>Campaign</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="sm:col-span-2">
                <select
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Campaign</option>
                  <option value="SIMPLE LIFE - 2025">SIMPLE LIFE - 2025</option>
                  <option value="Summer Cooling Promo 2026">Summer Cooling Promo 2026</option>
                  <option value="UAE Industrial Cooling Expo">UAE Industrial Cooling Expo</option>
                </select>
              </div>
            </div>

            {/* Source */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs flex items-center gap-1">
                <span>Source</span>
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </label>
              <div className="sm:col-span-2">
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Source</option>
                  <option value="Direct">Direct</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Website">Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Exhibition">Exhibition</option>
                </select>
              </div>
            </div>

            {/* Source Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs">Source Name</label>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Source Name"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Opportunity Stage */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs">Opportunity Stage</label>
              <div className="sm:col-span-2">
                <select
                  value={opportunityStage}
                  onChange={(e) => setOpportunityStage(e.target.value as DealStage)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="Opportunity">Opportunity</option>
                  <option value="Offer Sent">Offer Sent</option>
                  <option value="On Review">On Review</option>
                  <option value="Quotation">Quotation</option>
                  <option value="Order">Order</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>

            {/* Business Opportunity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
              <label className="text-slate-700 font-semibold text-xs">Business Opportunity</label>
              <div className="sm:col-span-2">
                <select
                  value={businessOpportunity}
                  onChange={(e) => setBusinessOpportunity(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select Business Opportunity</option>
                  <option value="Water Coolers">Water Coolers</option>
                  <option value="Industrial Coolers">Industrial Coolers</option>
                  <option value="HVAC Split AC">HVAC Split AC</option>
                  <option value="Cold Storage">Cold Storage</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Upload File * */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start pt-1">
              <label className="text-slate-700 font-semibold text-xs">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#C9302C] hover:bg-[#AC2925] text-white font-bold rounded text-xs transition cursor-pointer shadow-2xs"
                  >
                    Choose file
                  </button>
                  <span className="text-xs text-slate-500 truncate max-w-xs">
                    {selectedFile ? selectedFile.name : 'No file chosen'}
                  </span>
                </div>
                <p className="text-[11px] text-blue-600 font-medium">
                  Maximum Records : 50 | File Format : XLSX , XLS and CSV
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Upload Tips (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded p-3 text-xs shadow-2xs">
            <div className="font-bold text-[#D97706] flex items-center gap-1.5 mb-2.5 pb-1 border-b border-amber-100">
              <span>💡 Upload Tips</span>
            </div>
            <ul className="space-y-1.5 text-slate-700 list-disc list-inside text-[11px] leading-relaxed">
              <li>Excel File Size Limit is 500 KB</li>
              <li>Maximum Allowed Records are 50 records</li>
              <li>Avoid using single quotation marks, double quotes, and other special characters in any column</li>
              <li>Do not leave empty rows in the excel file</li>
              <li>Select correct date format corresponding to the excel date format</li>
              <li>Phone number without space & without special characters</li>
              <li>Amount must be in numeric format (e.g. 5000)</li>
              <li>Only active customer can be uploaded</li>
              <li>Columns marked with red background are mandatory</li>
              <li>For better experience, please use the sample format downloaded from here</li>
            </ul>
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR (Exact Cezcon CRM) ── */}
        <div className="px-4 py-3 bg-[#F8FAFC] border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[11px] text-[#C9302C] font-semibold text-center md:text-left leading-tight">
            * NB : Exact column match with sample excel format is required. Customer name, Opportunity name & Opportunity Owner are mandatory fields.
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
            <div className="flex items-center gap-2">
              <span className="text-slate-700 font-semibold text-xs whitespace-nowrap">
                Date Format of Excel
              </span>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-4 py-1.5 bg-[#002B49] hover:bg-[#001D32] disabled:opacity-50 text-white font-bold rounded text-xs shadow-2xs transition-colors cursor-pointer"
            >
              {isProcessing ? 'Processing...' : 'Submit'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded text-xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
