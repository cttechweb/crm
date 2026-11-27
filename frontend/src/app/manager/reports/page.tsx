'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  DollarSign,
  ListChecks,
  Shield,
  CheckSquare,
  UserCheck,
  Users,
  Activity,
  ShoppingCart,
  Boxes,
  Megaphone,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ManagerReportsContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'tasks';
  const [activeTab, setActiveTab] = useState(initialType);

  const reportCategories = [
    { id: 'sales', label: 'Sales', icon: DollarSign },
    { id: 'leads', label: 'Leads', icon: ListChecks },
    { id: 'customers', label: 'Customers', icon: Shield },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'employee-performance', label: 'Employee Performance', icon: UserCheck },
    { id: 'team-performance', label: 'Team Performance', icon: Users },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'campaign', label: 'Campaign', icon: Megaphone },
  ];

  const REPORT_DATA: Record<string, Array<{ title: string; period: string; format: string; size: string; status: string }>> = {
    sales: [
      { title: 'Commercial Deals Pipeline & Stage Velocity Audit', period: 'Sep 2026', format: 'PDF & XLSX', size: '2.8 MB', status: 'Ready' },
      { title: 'Quotation-to-Order Conversion Rate Summary', period: 'Q3 2026', format: 'PDF & CSV', size: '1.4 MB', status: 'Ready' },
      { title: 'Revenue Forecast vs Actuals (UAE Regions)', period: '2026 YTD', format: 'PDF & XLSX', size: '3.9 MB', status: 'Ready' },
    ],
    leads: [
      { title: 'Inbound Lead Quality & Source Attribution', period: 'Sep 2026', format: 'CSV', size: '890 KB', status: 'Ready' },
      { title: 'Lead Response Time & First-Touch SLA', period: 'Sep 2026', format: 'PDF', size: '1.2 MB', status: 'Ready' },
    ],
    customers: [
      { title: 'Corporate AMC Asset & Chiller Health Report', period: 'Annual 2026', format: 'PDF', size: '4.5 MB', status: 'Ready' },
      { title: 'Customer Retention & SLA Compliance Log', period: 'Q3 2026', format: 'XLSX', size: '2.1 MB', status: 'Ready' },
    ],
    tasks: [
      { title: 'Monthly Operational SLA & Turnaround Report', period: 'Sep 2026', format: 'PDF & CSV', size: '2.4 MB', status: 'Ready' },
      { title: 'Emergency Dispatch Response Metrics', period: 'Sep 2026', format: 'PDF', size: '1.7 MB', status: 'Ready' },
    ],
    'employee-performance': [
      { title: 'Individual Field Technician Workload & First-Time Fix Rate', period: 'Sep 2026', format: 'PDF & XLSX', size: '3.2 MB', status: 'Ready' },
      { title: 'Technician Job Hours & Overtime Log', period: 'Sep 2026', format: 'CSV', size: '1.1 MB', status: 'Ready' },
    ],
    'team-performance': [
      { title: 'Team Capacity Utilization & Job Distribution Matrix', period: 'Sep 2026', format: 'PDF', size: '2.9 MB', status: 'Ready' },
      { title: 'Regional Field Van Coverage & Fuel Efficiency', period: 'Q3 2026', format: 'XLSX', size: '2.0 MB', status: 'Ready' },
    ],
    activities: [
      { title: 'Daily Customer Visit & Inspection Activities Log', period: 'Sep 2026', format: 'CSV & PDF', size: '1.6 MB', status: 'Ready' },
    ],
    purchase: [
      { title: 'Supplier PO Fulfillment & Lead Time Audit', period: 'Q3 2026', format: 'PDF & XLSX', size: '2.3 MB', status: 'Ready' },
      { title: 'Procurement Cost & Spend Analysis (AED)', period: '2026 YTD', format: 'PDF & XLSX', size: '4.1 MB', status: 'Ready' },
    ],
    inventory: [
      { title: 'Spare Parts & Refrigerant Stock Level Valuation', period: 'Current Month', format: 'XLSX', size: '1.9 MB', status: 'Ready' },
      { title: 'Van Stock Minimum Threshold Reorder Triggers', period: 'Live Status', format: 'PDF', size: '1.0 MB', status: 'Ready' },
    ],
    campaign: [
      { title: 'Marketing Campaign ROI & Lead Generation Metrics', period: 'Sep 2026', format: 'PDF & CSV', size: '2.5 MB', status: 'Ready' },
      { title: 'WhatsApp & Email Commercial Blast Engagement', period: 'Sep 2026', format: 'PDF', size: '1.3 MB', status: 'Ready' },
    ],
  };

  const currentReports = REPORT_DATA[activeTab] || REPORT_DATA.tasks;

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#1677FF]" />
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Reports & Operational Analytics Hub
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Generate, preview, schedule, and export business intelligence reports across all operational departments.
          </p>
        </div>

        <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors self-start sm:self-auto cursor-pointer">
          <Download className="w-3.5 h-3.5" />
          <span>Export All Data</span>
        </button>
      </div>

      {/* Categories Bar (Mobile Horizontal Scroll / Full wrap) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {reportCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                'flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer',
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-500 tracking-wider">
            Available {reportCategories.find((c) => c.id === activeTab)?.label} Reports
          </h2>
          <span className="text-xs text-slate-400 font-semibold">{currentReports.length} Reports</span>
        </div>

        <div className="divide-y divide-slate-100">
          {currentReports.map((rpt, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#1677FF] border border-blue-100 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{rpt.title}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Period: <span className="font-semibold text-slate-700">{rpt.period}</span> • Format: <span className="font-semibold text-slate-700">{rpt.format}</span> • Size: {rpt.size}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>XLSX</span>
                </button>
                <button className="px-3 py-1.5 rounded-xl bg-[#1677FF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Export</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ManagerReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Reports...</div>}>
      <ManagerReportsContent />
    </Suspense>
  );
}
