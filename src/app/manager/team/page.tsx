'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Users, Search, Plus, MapPin, Phone, Mail, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';

import { authMockService } from '@/services/authMockService';

const ALL_EMPLOYEES = [
  { id: 'emp_1', managerId: 'mgr_1', name: 'Employee 1', role: 'Sales Representative', email: 'employee1@company.com', phone: '+971 50 111 0001', zone: 'Dubai HQ', specialization: 'Enterprise Accounts', capacity: 85, assignedTasks: 4, completedMonth: 38, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
  { id: 'emp_2', managerId: 'mgr_1', name: 'Employee 2', role: 'Sales Representative', email: 'employee2@company.com', phone: '+971 50 111 0002', zone: 'Dubai HQ', specialization: 'Inside Sales', capacity: 60, assignedTasks: 2, completedMonth: 25, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
  { id: 'emp_3', managerId: 'mgr_1', name: 'Employee 3', role: 'Sales Representative', email: 'employee3@company.com', phone: '+971 50 111 0003', zone: 'Dubai HQ', specialization: 'Direct Sales', capacity: 45, assignedTasks: 1, completedMonth: 19, status: 'Active', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' },
  { id: 'emp_4', managerId: 'mgr_2', name: 'Employee 4', role: 'Sales Representative', email: 'employee4@company.com', phone: '+971 50 222 0004', zone: 'Abu Dhabi Hub', specialization: 'Key Accounts', capacity: 70, assignedTasks: 3, completedMonth: 30, status: 'Active', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120' },
  { id: 'emp_5', managerId: 'mgr_2', name: 'Employee 5', role: 'Sales Representative', email: 'employee5@company.com', phone: '+971 50 222 0005', zone: 'Abu Dhabi Hub', specialization: 'Customer Success', capacity: 90, assignedTasks: 5, completedMonth: 42, status: 'Active', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120' },
  { id: 'emp_6', managerId: 'mgr_2', name: 'Employee 6', role: 'Sales Representative', email: 'employee6@company.com', phone: '+971 50 222 0006', zone: 'Abu Dhabi Hub', specialization: 'Corporate Demos', capacity: 40, assignedTasks: 2, completedMonth: 21, status: 'Active', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120' },
  { id: 'emp_7', managerId: 'mgr_3', name: 'Employee 7', role: 'Sales Representative', email: 'employee7@company.com', phone: '+971 50 333 0007', zone: 'Northern Emirates', specialization: 'Trade Center Sales', capacity: 65, assignedTasks: 3, completedMonth: 28, status: 'Active', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120' },
  { id: 'emp_8', managerId: 'mgr_3', name: 'Employee 8', role: 'Sales Representative', email: 'employee8@company.com', phone: '+971 50 333 0008', zone: 'Northern Emirates', specialization: 'Commercial Quotes', capacity: 55, assignedTasks: 2, completedMonth: 26, status: 'Active', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120' },
  { id: 'emp_9', managerId: 'mgr_4', name: 'Employee 9', role: 'Sales Representative', email: 'employee9@company.com', phone: '+971 50 444 0009', zone: 'Global Accounts', specialization: 'Enterprise Tenders', capacity: 80, assignedTasks: 4, completedMonth: 35, status: 'Active', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120' },
  { id: 'emp_10', managerId: 'mgr_4', name: 'Employee 10', role: 'Sales Representative', email: 'employee10@company.com', phone: '+971 50 444 0010', zone: 'Global Accounts', specialization: 'Client Acquisition', capacity: 50, assignedTasks: 2, completedMonth: 22, status: 'Active', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120' },
];

export default function ManagerTeamPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') || 'members';
  const [search, setSearch] = useState('');
  const [usersVersion, setUsersVersion] = useState(0);

  const currentUser = authMockService.getCurrentUser();
  const currentManagerId = currentUser?.id || 'mgr_1';

  React.useEffect(() => {
    const handleUpdate = () => setUsersVersion((v) => v + 1);
    window.addEventListener('crm_users_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('crm_users_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const teamMembers = React.useMemo(() => {
    let dynamicList: any[] = [];
    const curMgrId = String(currentManagerId || '').toLowerCase();
    const curMgrEmail = String(currentUser?.email || '').toLowerCase();
    const curMgrName = String(currentUser?.name || '').toLowerCase();

    try {
      const stored = localStorage.getItem('cezcon_crm_users_list');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dynamicList = parsed.filter(
            (u: any) => {
              const uMgrId = String(u.managerId || u.reportingManagerId || '').toLowerCase();
              const isEmployeeOrWorker =
                u.profileType === 'Employee' ||
                u.role === 'Employee' ||
                u.isWorker ||
                (!u.isAdmin && !u.profileType?.toLowerCase().includes('manager') && !u.profileType?.toLowerCase().includes('admin'));

              const matches =
                uMgrId.length > 0 &&
                (uMgrId === curMgrId ||
                  `usr_${uMgrId}` === curMgrId ||
                  uMgrId === curMgrId.replace('usr_', '') ||
                  uMgrId === curMgrEmail ||
                  uMgrId === curMgrName ||
                  (curMgrEmail.startsWith('manager') && uMgrId === curMgrId.replace('mgr_', '')));

              return isEmployeeOrWorker && matches;
            }
          ).map((u: any) => ({
            id: String(u.id).startsWith('usr_') ? u.id : `usr_${u.id}`,
            name: u.name,
            role: u.designation || u.employeeType || u.profileType || 'Sales Representative',
            email: u.email || `${u.username}@company.com`,
            phone: u.phone || '+971 50 123 4567',
            zone: 'Regional Desk',
            specialization: u.employeeType ? `${u.employeeType} Specialist` : 'Client Deals & Relations',
            capacity: 65,
            assignedTasks: 2,
            completedMonth: 18,
            status: 'Active',
            avatar: u.avatarImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
          }));
        }
      }
    } catch (e) {
      console.error(e);
    }

    const mgrType = (currentUser?.managerType || currentUser?.profileType || '').toLowerCase();
    const staticAssigned = ALL_EMPLOYEES.filter((e) => {
      if (e.managerId === currentManagerId) return true;
      if (currentManagerId.startsWith('usr_')) {
        if (mgrType.includes('sales') && e.managerId === 'mgr_1') return true;
        if (mgrType.includes('purchase') && e.managerId === 'mgr_2') return true;
        if (mgrType.includes('marketing') && e.managerId === 'mgr_3') return true;
        if (mgrType.includes('operation') && e.managerId === 'mgr_4') return true;
      }
      return false;
    });

    const mergedMap = new Map<string, any>();
    staticAssigned.forEach((s) => mergedMap.set((s.email || s.id).toLowerCase(), s));
    dynamicList.forEach((d) => mergedMap.set((d.email || d.id).toLowerCase(), d));

    return Array.from(mergedMap.values());
  }, [currentManagerId, currentUser, usersVersion]);

  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()) ||
    m.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ManagerShell
      title="Field Team Management & Workload"
      subtitle="Supervise field technicians, monitor real-time capacity balance, and coordinate zone assignments"
    >
      {/* Capacity Overview Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold">Field Workforce Capacity: 72.5% Balanced</h2>
          <p className="text-xs text-blue-200 mt-0.5">5 Field Technicians on Duty · 16 Active Operational Tasks Assigned Today</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
            2 Techs Available
          </span>
          <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold">
            1 Tech Overloaded
          </span>
        </div>
      </div>

      {/* Team Roster Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative w-72">
            <input
              type="text"
              placeholder="Search technician by name, skill, or zone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Team Member</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {filtered.map((tech) => (
            <div key={tech.id} className="p-5 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={tech.avatar}
                  alt={tech.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{tech.name}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tech.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : tech.status === 'On Field'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                    >
                      {tech.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{tech.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {tech.zone}
                  </p>
                </div>
              </div>

              {/* Workload Progress */}
              <div className="w-full md:w-64 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Workload Capacity</span>
                  <span className="font-bold text-slate-800">{tech.capacity}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${tech.capacity > 90
                        ? 'bg-rose-500'
                        : tech.capacity > 70
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                    style={{ width: `${tech.capacity}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{tech.assignedTasks} Active Tasks</span>
                  <span className="text-emerald-600 font-semibold">{tech.completedMonth} Completed This Mo</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${tech.phone}`}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="Call Technician"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
                <a
                  href={`mailto:${tech.email}`}
                  className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                  title="Email Technician"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
                <button className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold">
                  Reassign Jobs
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ManagerShell>
  );
}
