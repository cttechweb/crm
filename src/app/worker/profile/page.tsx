'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  Shield,
  Truck,
  HeartHandshake,
  Star,
  CheckCircle2,
  Edit2,
  X,
  Save,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';
import { workerMockService } from '@/services/workerMockService';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { WorkerProfileData } from '@/types/worker';
import { CrmTask } from '@/types/enterprise-crm';

export default function WorkerProfilePage() {
  const { tasks: crmTasks } = useEnterpriseCrm();
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [profile, setProfile] = useState<WorkerProfileData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    phone: '',
    assignedVehicle: '',
    driverLicenseNumber: '',
    emergencyContactName: '',
    emergencyContactRelation: '',
    emergencyContactPhone: '',
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    const prof = workerMockService.getProfile(user);
    setProfile(prof);
    setEditForm({
      phone: prof.phone || '+971 50 123 4567',
      assignedVehicle: prof.assignedVehicle || 'Toyota HiAce Service Van #07 (DXB 48291)',
      driverLicenseNumber: prof.driverLicenseNumber || 'UAE-DXB-994821',
      emergencyContactName: prof.emergencyContact?.name || 'Emergency Contact',
      emergencyContactRelation: prof.emergencyContact?.relationship || 'Family Member',
      emergencyContactPhone: prof.emergencyContact?.phone || '+971 50 987 6543',
    });
  }, []);

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditForm({
      phone: profile.phone || '',
      assignedVehicle: profile.assignedVehicle || '',
      driverLicenseNumber: profile.driverLicenseNumber || '',
      emergencyContactName: profile.emergencyContact?.name || '',
      emergencyContactRelation: profile.emergencyContact?.relationship || '',
      emergencyContactPhone: profile.emergencyContact?.phone || '',
    });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updates: Partial<WorkerProfileData> = {
      phone: editForm.phone,
      assignedVehicle: editForm.assignedVehicle,
      driverLicenseNumber: editForm.driverLicenseNumber,
      emergencyContact: {
        name: editForm.emergencyContactName,
        relationship: editForm.emergencyContactRelation,
        phone: editForm.emergencyContactPhone,
      },
    };

    const updated = workerMockService.updateProfile(updates, currentUser?.id);
    setProfile(updated);
    setIsEditModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const userName = currentUser?.name || profile?.name || 'Employee';
  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const userRole = currentUser?.designation || profile?.skillLevel || 'Marketing Employee';
  const workerCode = currentUser?.id
    ? `EMP-${currentUser.id.replace(/\D/g, '').slice(-4) || '7011'}`
    : profile?.workerCode || 'EMP-7011';
  const department = currentUser?.department || profile?.department || 'Marketing & Operations';
  const userEmail = currentUser?.email || profile?.email || 'shameem@gmail.com';
  const userPhone = profile?.phone || '+971 50 123 4567';

  // Calculate real completed jobs from context
  const completedCrmTasks = (crmTasks || []).filter(
    (t: CrmTask) =>
      t.assignee?.name?.toLowerCase() === userName.toLowerCase() &&
      (t.status === 'Completed' || t.status === 'Done')
  );
  const workerPortalTasks = workerMockService.getTasks().filter((t) => t.status === 'Completed');
  const totalCompletedJobs = Math.max(completedCrmTasks.length, workerPortalTasks.length);

  return (
    <WorkerShell
      title="My Profile"
      subtitle="View and manage your employee details, contact info, and operational assignments"
    >
      <div className="space-y-4 w-full">
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">Profile updated successfully!</span>
          </div>
        )}

        {/* ── PROFILE HEADER CARD ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#002B49] to-[#0284C7] text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              {userInitials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 capitalize">{userName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {userRole}
                </span>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-600">
                  {workerCode}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {userEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {userPhone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <span className="text-[10px] font-medium text-slate-400 uppercase block">Work Orders</span>
              <span className="text-sm font-bold text-slate-800">{totalCompletedJobs} Completed</span>
            </div>
            <button
              type="button"
              onClick={handleOpenEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          </div>
        </div>

        {/* ── 2-COLUMN SIMPLE DETAILS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Employment & Organization Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Briefcase className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Employment Details
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Full Name</span>
                <span className="font-semibold text-slate-800 capitalize">{userName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Employee Code</span>
                <span className="font-mono font-semibold text-slate-800">{workerCode}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation</span>
                <span className="font-medium text-slate-800">{userRole}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <span className="font-medium text-slate-800">{department}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Reporting Manager</span>
                <span className="font-medium text-slate-800">{currentUser?.managerType || 'Operations Manager'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Account Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Column 2: Emergency Contact & Vehicle */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartHandshake className="w-4 h-4 text-slate-500" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                Emergency Contact &amp; Vehicle
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-y-3.5 gap-x-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Emergency Contact</span>
                <span className="font-semibold text-slate-800">
                  {profile?.emergencyContact?.name || 'Emergency Contact'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Relationship</span>
                <span className="font-medium text-slate-800">
                  {profile?.emergencyContact?.relationship || 'Family Member'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Emergency Phone</span>
                <a
                  href={`tel:${profile?.emergencyContact?.phone || '+971509876543'}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {profile?.emergencyContact?.phone || '+971 50 987 6543'}
                </a>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Assigned Vehicle</span>
                <span className="font-medium text-slate-800">
                  {profile?.assignedVehicle || 'Van #07 (DXB 48291)'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Driving License</span>
                <span className="font-mono font-medium text-slate-800">
                  {profile?.driverLicenseNumber || 'UAE-DXB-994821'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Helpline Support</span>
                <span className="font-medium text-slate-800">+971 4 800 COOL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL: Edit Profile ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="fixed inset-0" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative z-10 bg-white rounded-xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden text-xs">
            <div className="border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Edit Profile Details</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-4 space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+971 50 123 4567"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Assigned Vehicle</label>
                  <input
                    type="text"
                    value={editForm.assignedVehicle}
                    onChange={(e) => setEditForm({ ...editForm, assignedVehicle: e.target.value })}
                    placeholder="Van #07 (DXB 48291)"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Driving License</label>
                  <input
                    type="text"
                    value={editForm.driverLicenseNumber}
                    onChange={(e) => setEditForm({ ...editForm, driverLicenseNumber: e.target.value })}
                    placeholder="UAE-DXB-994821"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Emergency Contact Details
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">Contact Name</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactName}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                      placeholder="Contact Name"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600">Relationship</label>
                    <input
                      type="text"
                      value={editForm.emergencyContactRelation}
                      onChange={(e) => setEditForm({ ...editForm, emergencyContactRelation: e.target.value })}
                      placeholder="Relationship"
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600">Emergency Phone</label>
                  <input
                    type="text"
                    value={editForm.emergencyContactPhone}
                    onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                    placeholder="+971 50 987 6543"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-[#002B49] hover:bg-[#001E33] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkerShell>
  );
}
