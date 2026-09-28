'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  Award,
  Wrench,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';

export default function WorkerProfilePage() {
  const profile = workerMockService.getProfile();

  return (
    <WorkerShell
      title="Employee Profile & Fleet Asset Registry"
      subtitle="Employee credentials, skill certifications, assigned service vehicle, and safety clearances"
    >
      <div className="space-y-6">
        {/* ── SECTION 1: PROFILE HERO CARD ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#002B49] to-[#00AEEF] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{profile.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {profile.skillLevel}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700">
                  {profile.workerCode}
                </span>
              </div>

              <div className="text-xs text-slate-600 font-medium">{profile.department}</div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {profile.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {profile.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase text-emerald-700 block">CSAT Rating</span>
              <div className="flex items-center gap-1 font-black text-emerald-950 text-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{profile.metrics.averageRating} / 5.0</span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase text-blue-700 block">Total Completed</span>
              <div className="font-black text-blue-950 text-lg">
                {profile.metrics.completedJobs} Work Orders
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: 3-COLUMN DETAIL CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Assigned Vehicle & Fleet Info */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Assigned Service Van</h3>
                <p className="text-[11px] text-slate-500">Fleet Operations Management</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Vehicle Description</span>
                <span className="font-bold text-slate-900">{profile.assignedVehicle}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">UAE Driving License</span>
                  <span className="font-mono font-bold text-slate-800">{profile.driverLicenseNumber}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Van Tool Audit</span>
                  <span className="font-bold text-emerald-700">Verified Passed ✓</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Assigned Manager</span>
                <span className="font-semibold text-slate-800">{profile.assignedManager}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Technical Certifications & Safety */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Technical Certifications</h3>
                <p className="text-[11px] text-slate-500">Accredited HVAC Standards</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { title: 'EPA Section 608 Universal Certification', issuer: 'HVAC Excellence', valid: 'Permanent' },
                { title: 'UAE Civil Defense Fire & LOTO Compliance', issuer: 'Dubai Civil Defense', valid: '2028' },
                { title: 'Carrier & York Heavy Chiller Specialist', issuer: 'OEM Factory Training', valid: '2027' },
                { title: 'First Aid & High-Altitude Rigging', issuer: 'OSHAE Safety Board', valid: '2027' },
              ].map((cert, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cert.title}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{cert.issuer}</span>
                    <span>Exp: {cert.valid}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Emergency & Toolbox Registry */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Emergency &amp; Support</h3>
                <p className="text-[11px] text-slate-500">24/7 Operations Protocol</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 space-y-1">
                <span className="text-[10px] font-bold text-rose-700 block uppercase">
                  Next of Kin / Emergency Contact
                </span>
                <div className="font-bold text-slate-900">{profile.emergencyContact.name}</div>
                <div className="text-slate-600">Relation: {profile.emergencyContact.relationship}</div>
                <a
                  href={`tel:${profile.emergencyContact.phone}`}
                  className="inline-flex items-center gap-1 text-rose-700 font-bold hover:underline"
                >
                  <Phone className="w-3 h-3" />
                  {profile.emergencyContact.phone}
                </a>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  Central Operations Helpline
                </span>
                <div className="font-bold text-slate-900">Cool Tech Dispatch Room</div>
                <div className="text-blue-600 font-bold">+971 4 800 COOL (2665)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkerShell>
  );
}
