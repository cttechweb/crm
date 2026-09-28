'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Users } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';

const CALENDAR_EVENTS = [
  { id: 1, day: 25, title: 'Emergency Chiller Overhaul', client: 'Lumina Health Tower', tech: 'Tariq Mansour', time: '11:00 AM - 03:00 PM', type: 'Task', color: 'bg-rose-500' },
  { id: 2, day: 25, title: 'Operations Capacity Briefing', client: 'Internal Cool Tech', tech: 'Alex Rivera', time: '08:30 AM - 09:15 AM', type: 'Meeting', color: 'bg-blue-600' },
  { id: 3, day: 26, title: 'Quarterly AMC Site Survey', client: 'Apex Logistics Complex', tech: 'Zayed Al Qasimi', time: '09:00 AM - 12:00 PM', type: 'Site Visit', color: 'bg-indigo-600' },
  { id: 4, day: 28, title: 'Contract Renewal Discussion', client: 'Yas Marina Towers', tech: 'Alex Rivera', time: '02:00 PM - 03:00 PM', type: 'Meeting', color: 'bg-emerald-600' },
  { id: 5, day: 30, title: 'Q3 Operations Wrap-up', client: 'Management Board', tech: 'All Managers', time: '04:00 PM - 05:30 PM', type: 'Meeting', color: 'bg-purple-600' },
];

export default function ManagerCalendarPage() {
  const [selectedDay, setSelectedDay] = useState(25);

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <ManagerShell
      title="Operations Calendar"
      subtitle="Schedule meetings, technician dispatch schedules, and critical contract deadlines"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">September 2026</h2>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 px-2">Today</span>
              <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 py-2 border-b border-slate-100 uppercase tracking-wider text-[11px]">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {daysInMonth.map((day) => {
              const hasEvents = CALENDAR_EVENTS.some((e) => e.day === day);
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`h-20 p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600'
                      : day === 25
                      ? 'border-blue-300 bg-slate-50'
                      : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                  }`}
                >
                  <span
                    className={`text-xs font-bold ${
                      day === 25 ? 'text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {day}
                  </span>
                  {hasEvents && (
                    <div className="space-y-1">
                      {CALENDAR_EVENTS.filter((e) => e.day === day).map((e) => (
                        <div
                          key={e.id}
                          className={`text-[9px] font-bold text-white px-1.5 py-0.5 rounded truncate ${e.color}`}
                        >
                          {e.title}
                        </div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Agenda for Sep {selectedDay}, 2026</h3>
              <p className="text-[11px] text-slate-400">Scheduled events &amp; technician dispatches</p>
            </div>
            <button className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {CALENDAR_EVENTS.filter((e) => e.day === selectedDay).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">No scheduled activities for this day</p>
            ) : (
              CALENDAR_EVENTS.filter((e) => e.day === selectedDay).map((e) => (
                <div key={e.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{e.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {e.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{e.client}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {e.time}
                    </span>
                    <span className="font-semibold text-slate-700">{e.tech}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ManagerShell>
  );
}
