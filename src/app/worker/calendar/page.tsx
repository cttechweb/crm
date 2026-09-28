'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';

interface ScheduledEvent {
  id: string;
  time: string;
  duration: string;
  title: string;
  client: string;
  location: string;
  type: 'Maintenance' | 'Emergency' | 'Inspection' | 'Installation';
  status: 'In Progress' | 'Upcoming' | 'Completed';
  phone: string;
}

const SCHEDULED_EVENTS: ScheduledEvent[] = [
  {
    id: 'evt_1',
    time: '08:30 AM',
    duration: '2.5 hrs',
    title: 'Precision Server Room CRAC Unit Overhaul',
    client: 'Emirates Towers Facility',
    location: 'Trade Centre, Sheikh Zayed Rd, Dubai',
    type: 'Emergency',
    status: 'In Progress',
    phone: '+971 50 319 8820',
  },
  {
    id: 'evt_2',
    time: '12:00 PM',
    duration: '1.5 hrs',
    title: 'AHU Primary Air Intake Filter Bank Replacement',
    client: 'Al Futtaim Logistics Hub',
    location: 'Dubai South Aviation District, Warehouse 4',
    type: 'Maintenance',
    status: 'Upcoming',
    phone: '+971 52 481 0092',
  },
  {
    id: 'evt_3',
    time: '03:00 PM',
    duration: '2.0 hrs',
    title: 'VRF Diagnostic & High-Side Condenser Coil Flush',
    client: 'Silicon Oasis Tech Park',
    location: 'Building D, Silicon Oasis, Dubai',
    type: 'Inspection',
    status: 'Upcoming',
    phone: '+971 55 902 4411',
  },
  {
    id: 'evt_4',
    time: '05:30 PM',
    duration: '1.0 hr',
    title: 'Post-Maintenance Client Sign-off & Temperature Log',
    client: 'Downtown Residence Mgmt',
    location: 'Tower B, Downtown Dubai',
    type: 'Inspection',
    status: 'Upcoming',
    phone: '+971 54 812 9901',
  },
];

export default function EmployeeCalendarPage() {
  const [selectedDay, setSelectedDay] = useState('Today (25 Sep 2026)');

  return (
    <WorkerShell
      title="Field Calendar & Schedule"
      subtitle="Your live operational itinerary, scheduled site appointments, and client service windows"
    >
      <div className="space-y-4">
        {/* Calendar Nav Header */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">{selectedDay}</span>
              <p className="text-[11px] text-slate-500">4 service dispatches assigned</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-slate-100"
            >
              Today
            </button>
            <button
              type="button"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="space-y-3">
          {SCHEDULED_EVENTS.map((evt) => (
            <div
              key={evt.id}
              className={`bg-white border rounded-xl p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                evt.status === 'In Progress'
                  ? 'border-blue-300 bg-blue-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                {/* Time Badge */}
                <div className="flex flex-col items-center justify-center w-20 py-2 rounded-lg bg-slate-100 text-slate-800 flex-shrink-0">
                  <span className="text-xs font-black">{evt.time}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{evt.duration}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        evt.type === 'Emergency'
                          ? 'bg-rose-100 text-rose-700'
                          : evt.type === 'Maintenance'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}
                    >
                      {evt.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        evt.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{evt.title}</h4>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {evt.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {evt.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={`tel:${evt.phone}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Site</span>
                </a>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(evt.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>GPS Directions</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkerShell>
  );
}
