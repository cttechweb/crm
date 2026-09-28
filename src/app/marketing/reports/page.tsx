'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Radio,
  CheckCircle2,
  Users,
  Target,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ChevronDown,
} from 'lucide-react';
import { BackButton } from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface CampaignRoiReport {
  id: string;
  name: string;
  channel: 'Email' | 'WhatsApp' | 'SMS' | 'Website Inbound' | 'Directory';
  spend: number;
  reach: number;
  leads: number;
  cpl: number;
  dealsWon: number;
  revenue: number;
  roi: string;
}

const INITIAL_REPORTS: CampaignRoiReport[] = [
  {
    id: 'RPT-01',
    name: 'SIMPLE LIFE - 2025',
    channel: 'Website Inbound',
    spend: 15000,
    reach: 18400,
    leads: 184,
    cpl: 81.5,
    dealsWon: 42,
    revenue: 285000,
    roi: '+1,800%',
  },
  {
    id: 'RPT-02',
    name: 'Annual HVAC AMC Renewal Perks & Early VIP Discounts',
    channel: 'Email',
    spend: 4500,
    reach: 3450,
    leads: 112,
    cpl: 40.1,
    dealsWon: 38,
    revenue: 410000,
    roi: '+9,011%',
  },
  {
    id: 'RPT-03',
    name: 'Emergency Chiller Breakdown 24/7 Rapid Response',
    channel: 'WhatsApp',
    spend: 3200,
    reach: 2450,
    leads: 96,
    cpl: 33.3,
    dealsWon: 29,
    revenue: 195000,
    roi: '+5,993%',
  },
  {
    id: 'RPT-04',
    name: 'REACHUAE - 2025 Directory Campaign',
    channel: 'Directory',
    spend: 8500,
    reach: 9600,
    leads: 78,
    cpl: 108.9,
    dealsWon: 18,
    revenue: 142000,
    roi: '+1,570%',
  },
  {
    id: 'RPT-05',
    name: 'Technician Arrival & On-Call SMS Campaign',
    channel: 'SMS',
    spend: 2100,
    reach: 6200,
    leads: 45,
    cpl: 46.6,
    dealsWon: 16,
    revenue: 88000,
    roi: '+4,090%',
  },
];

function CampaignReportsContent() {
  const [reports, setReports] = useState<CampaignRoiReport[]>(INITIAL_REPORTS);
  const [channelFilter, setChannelFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('This Quarter');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const matchChannel = channelFilter === 'All' || r.channel === channelFilter;
      const matchSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.id.toLowerCase().includes(search.toLowerCase());
      return matchChannel && matchSearch;
    });
  }, [reports, channelFilter, search]);

  const totalSpend = reports.reduce((sum, r) => sum + r.spend, 0);
  const totalReach = reports.reduce((sum, r) => sum + r.reach, 0);
  const totalLeads = reports.reduce((sum, r) => sum + r.leads, 0);
  const totalDeals = reports.reduce((sum, r) => sum + r.dealsWon, 0);
  const totalRevenue = reports.reduce((sum, r) => sum + r.revenue, 0);
  const avgCpl = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(1) : '0';
  const overallRoi = totalSpend > 0 ? (((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(0) : '0';

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-16">
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
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Campaign Reports &amp; Analytics</h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Comprehensive ROI analysis, lead acquisition costs, channel revenue breakdown, and conversion tracking.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => showToast('Exporting campaign performance metrics to CSV...')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#002B49] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics Report</span>
        </button>
      </div>

      {/* 7 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500">Total Spend</span>
          <p className="text-xl font-black text-slate-900 mt-1">AED {totalSpend.toLocaleString()}</p>
          <span className="text-[10px] text-slate-400 font-semibold">Budget spent</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600">Total Reach</span>
          <p className="text-xl font-black text-blue-600 mt-1">{totalReach.toLocaleString()}</p>
          <span className="text-[10px] text-blue-600 font-semibold">Audience touched</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600">Leads Generated</span>
          <p className="text-xl font-black text-indigo-600 mt-1">{totalLeads}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Qualified inquiries</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600">Avg. Cost/Lead</span>
          <p className="text-xl font-black text-purple-600 mt-1">AED {avgCpl}</p>
          <span className="text-[10px] text-purple-600 font-semibold">Cost per lead</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600">Deals Closed</span>
          <p className="text-xl font-black text-amber-600 mt-1">{totalDeals}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Won contracts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600">Total Revenue</span>
          <p className="text-xl font-black text-emerald-600 mt-1">AED {(totalRevenue / 1000).toFixed(0)}k</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Generated</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700">Overall ROI</span>
          <p className="text-xl font-black text-emerald-700 mt-1">+{overallRoi}%</p>
          <span className="text-[10px] text-emerald-700 font-semibold">Return on spend</span>
        </div>
      </div>

      {/* Channel Performance Meter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span>Channel Reach vs Deal Value Contribution</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-blue-900">
              <span>Email Marketing</span>
              <span>AED 410,000</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '42%' }} />
            </div>
            <p className="text-[11px] text-blue-700">38 Deals Won • 3,450 Direct Reach</p>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900">
              <span>Website Inbound</span>
              <span>AED 285,000</span>
            </div>
            <div className="w-full bg-emerald-200 rounded-full h-2">
              <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '31%' }} />
            </div>
            <p className="text-[11px] text-emerald-700">42 Deals Won • 18,400 Website Visits</p>
          </div>

          <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-teal-900">
              <span>WhatsApp API</span>
              <span>AED 195,000</span>
            </div>
            <div className="w-full bg-teal-200 rounded-full h-2">
              <div className="bg-teal-600 h-2 rounded-full" style={{ width: '22%' }} />
            </div>
            <p className="text-[11px] text-teal-700">29 Deals Won • 2,450 Messages</p>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold text-purple-900">
              <span>Direct Directory &amp; SMS</span>
              <span>AED 230,000</span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '25%' }} />
            </div>
            <p className="text-[11px] text-purple-700">34 Deals Won • 15,800 Contacts</p>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns, channels, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="All">All Channels</option>
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="Website Inbound">Website Inbound</option>
            <option value="Directory">Directory</option>
          </select>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none shadow-2xs cursor-pointer"
          >
            <option value="This Quarter">This Quarter</option>
            <option value="Past 30 Days">Past 30 Days</option>
            <option value="Year-to-Date (2026)">Year-to-Date (2026)</option>
          </select>
        </div>
      </div>

      {/* Campaign ROI Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1677FF]" />
            <h2 className="text-sm font-bold text-slate-900">Campaign Return on Investment Master Log</h2>
          </div>
          <span className="text-xs text-slate-500">{filtered.length} Reports</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3 text-right">Spend (AED)</th>
                <th className="py-3 px-3 text-center">Reach</th>
                <th className="py-3 px-3 text-center">Leads</th>
                <th className="py-3 px-3 text-right">Cost / Lead</th>
                <th className="py-3 px-3 text-center">Deals Won</th>
                <th className="py-3 px-3 text-right">Revenue (AED)</th>
                <th className="py-3 px-4 text-right">ROI %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p>{item.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal">{item.id}</p>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      {item.channel}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                    AED {item.spend.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-center font-bold text-slate-800">
                    {item.reach.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-blue-700">
                    {item.leads}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-600">
                    AED {item.cpl.toFixed(1)}
                  </td>

                  <td className="py-3.5 px-3 text-center font-black text-emerald-700">
                    {item.dealsWon}
                  </td>

                  <td className="py-3.5 px-3 text-right font-bold text-slate-900">
                    AED {item.revenue.toLocaleString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-flex items-center gap-1 font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      {item.roi}
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

export default function CampaignReportsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading Analytics Reports...</div>}>
      <CampaignReportsContent />
    </Suspense>
  );
}
