'use client';

import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';

interface DealItem {
  id: string;
  dealNumber: string;
  title: string;
  company: string;
  stage: 'Quotation' | 'Offer Sent' | 'Order' | 'In Progress' | 'Invoiced' | 'Closed Won';
  amount: string;
  closingDate: string;
  probability: string;
}

const INITIAL_DEALS: DealItem[] = [];

export default function EmployeeDealsPage() {
  const [deals, setDeals] = useState<DealItem[]>(INITIAL_DEALS);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const matchesSearch =
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.dealNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStage = stageFilter === 'All' || deal.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [deals, searchQuery, stageFilter]);

  return (
    <WorkerShell
      title="My Deals"
      subtitle="View your assigned service contracts, installation quotes, and project opportunities"
    >
      <div className="space-y-4">
        {/* Controls */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search opportunity title, client, or deal #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Stages</option>
              <option value="Offer Sent">Offer Sent</option>
              <option value="Order">Order</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed Won">Closed Won</option>
            </select>
          </div>
        </div>

        {/* Deals Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeals.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
              No assigned deals found matching your criteria.
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <div
                key={deal.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                        {deal.dealNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{deal.title}</h4>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {deal.company}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        deal.stage === 'Closed Won'
                          ? 'bg-emerald-100 text-emerald-800'
                          : deal.stage === 'Order'
                          ? 'bg-blue-100 text-blue-800'
                          : deal.stage === 'In Progress'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {deal.stage}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Deal Value</span>
                      <span className="font-black text-slate-900 text-sm">{deal.amount}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Target Closing</span>
                      <span className="font-semibold text-slate-700">{deal.closingDate}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Win Probability: {deal.probability}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Active SLA
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkerShell>
  );
}
