'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  Upload,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Copy,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  X,
  FileSpreadsheet,
  Database,
  Check,
  Building,
  ArrowRight,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

interface ImportBatchItem {
  id: string;
  sourceType: 'CSV File' | 'Meta Lead Ads' | 'Google Sheets' | 'PBX Inbound';
  fileNameOrSource: string;
  totalRecords: number;
  importedSuccessfully: number;
  duplicatesSkipped: number;
  assignedRep: string;
  importedAt: string;
  status: 'Completed' | 'Processing' | 'Failed';
}

const INITIAL_BATCHES: ImportBatchItem[] = [];

function ImportLeadsContent() {
  const { users } = useEnterpriseCrm();
  const [batches, setBatches] = useState<ImportBatchItem[]>(INITIAL_BATCHES);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSource, setSelectedSource] = useState('Website Inbound');
  const [selectedRep, setSelectedRep] = useState(users[0]?.name || 'shaheer');
  const [dedupPolicy, setDedupPolicy] = useState('skip');
  const [isImporting, setIsImporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);

    setTimeout(() => {
      const newBatch: ImportBatchItem = {
        id: `BATCH-${Math.floor(800 + Math.random() * 200)}`,
        sourceType: 'CSV File',
        fileNameOrSource: selectedFile ? selectedFile.name : 'Uploaded_Lead_Contacts.csv',
        totalRecords: 145,
        importedSuccessfully: 142,
        duplicatesSkipped: 3,
        assignedRep: selectedRep,
        importedAt: 'Just now',
        status: 'Completed',
      };

      setBatches([newBatch, ...batches]);
      setIsImporting(false);
      setSelectedFile(null);
      showToast(`Imported ${newBatch.importedSuccessfully} leads successfully into CRM!`);
    }, 1200);
  };

  const totalImportedAllTime = batches.reduce((sum, b) => sum + b.importedSuccessfully, 0);
  const totalDuplicatesHandled = batches.reduce((sum, b) => sum + b.duplicatesSkipped, 0);

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#002B49] text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <BackButton />
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-blue-50 text-[#1677FF]">
                <Upload className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Import Leads &amp; Data Ingestion</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Bulk upload lead records from CSV/Excel, sync Meta instant forms, and map fields seamlessly into CRM.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Downloading standard Cool Technologies Lead CSV Template...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-slate-500">Total Leads Ingested</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalImportedAllTime.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-slate-400">All batches combined</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-600">Auto-Mapped Fields</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">100%</p>
          <span className="text-[11px] font-semibold text-emerald-600">Smart schema matcher</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-purple-600">Duplicates Filtered</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{totalDuplicatesHandled}</p>
          <span className="text-[11px] font-semibold text-purple-600">Deduplicated by Phone/Email</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-blue-600">Latest Batch Accuracy</span>
          <p className="text-2xl font-black text-blue-600 mt-1">99.2%</p>
          <span className="text-[11px] font-semibold text-blue-600">Zero data loss</span>
        </div>
      </div>

      {/* Main Upload Dropzone Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Bulk Upload CSV or Excel Lead List</span>
        </h2>

        <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs text-slate-700">
          {/* Dropzone */}
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-50/60 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setSelectedFile(e.target.files[0]);
                  showToast(`Selected file: ${e.target.files[0].name}`);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-2xs">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-slate-900">
                  {selectedFile ? selectedFile.name : 'Click to select or drag & drop CSV file'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supports .CSV, .XLSX up to 25MB (Max 5,000 records per upload)
                </p>
              </div>
            </div>
          </div>

          {/* Import Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Default Lead Source</label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="Website Inbound">Website Inbound</option>
                <option value="ReachUAE B2B Directory">ReachUAE B2B Directory</option>
                <option value="Arabian Trade Network">Arabian Trade Network</option>
                <option value="Direct Client Referral">Direct Client Referral</option>
                <option value="Trade Exhibition">Trade Exhibition / Big 5</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Assign Sales Representative</label>
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
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
                    <option value="Muhammed Shibil">Muhammed Shibil</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Duplicate Phone/Email Handling</label>
              <select
                value={dedupPolicy}
                onChange={(e) => setDedupPolicy(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              >
                <option value="skip">Skip duplicates (Recommended)</option>
                <option value="update">Update existing lead data</option>
                <option value="allow">Allow duplicate records</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isImporting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Validating Records...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Bulk Lead Ingestion</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Recent Batches Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Lead Ingestion Log</h2>
          <span className="text-xs text-slate-500">{batches.length} Batches</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Batch ID &amp; File Name</th>
                <th className="py-3 px-3">Source Type</th>
                <th className="py-3 px-3 text-center">Total Rows</th>
                <th className="py-3 px-3 text-center">Imported</th>
                <th className="py-3 px-3 text-center">Duplicates Skipped</th>
                <th className="py-3 px-3">Assigned Rep</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{batch.fileNameOrSource}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{batch.id}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {batch.sourceType}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center font-semibold text-slate-700">
                    {batch.totalRecords}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                    {batch.importedSuccessfully}
                  </td>

                  <td className="py-3.5 px-3 text-center font-medium text-purple-700">
                    {batch.duplicatesSkipped}
                  </td>

                  <td className="py-3.5 px-3 font-medium text-slate-700">{batch.assignedRep}</td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-500 whitespace-nowrap">
                    {batch.importedAt}
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ImportLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Import Wizard...</div>}>
      <ImportLeadsContent />
    </Suspense>
  );
}
