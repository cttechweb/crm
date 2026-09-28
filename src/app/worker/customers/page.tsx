'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';

export default function EmployeeCustomersPage() {
  const { customers } = useEnterpriseCrm();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredCustomers = useMemo(() => {
    return customers.filter((cust) => {
      const company = cust.companyName || cust.customerName || '';
      const matchesSearch =
        company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || cust.category === selectedCategory || cust.companyGroup === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [customers, searchQuery, selectedCategory]);

  return (
    <WorkerShell
      title="My Customers"
      subtitle="Directory of your assigned client facilities, maintenance contracts, and HVAC installation sites"
    >
      <div className="space-y-4">
        {/* Search & Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company, contact person, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Accounts</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Commercial">Commercial</option>
              <option value="Residential">Residential</option>
            </select>
          </div>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.length === 0 ? (
            <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
              No assigned customer accounts found matching your search.
            </div>
          ) : (
            filteredCustomers.map((cust) => {
              const displayName = cust.companyName || cust.customerName || 'Client Account';
              return (
                <div
                  key={cust.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{displayName}</h4>
                        <p className="text-xs text-slate-500 font-medium">{cust.contactPerson}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cust.status || 'Active Client'}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> Phone:
                        </span>
                        <a href={`tel:${cust.phone}`} className="font-semibold text-[#2563EB]">
                          {cust.phone}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> Email:
                        </span>
                        <a href={`mailto:${cust.email}`} className="text-slate-700 truncate max-w-[150px]">
                          {cust.email}
                        </a>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" /> Location:
                        </span>
                        <span className="font-medium text-slate-700 truncate max-w-[160px]">
                          {cust.address || cust.city || 'Dubai, UAE'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>SLA Level: Platinum 24/7</span>
                      <span className="text-emerald-600 font-bold">AMC Active</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${cust.phone}`}
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Call</span>
                    </a>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(displayName + ' ' + (cust.address || 'Dubai'))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Map View</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </WorkerShell>
  );
}
