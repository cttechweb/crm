'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Users,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  X,
  Building2,
  Calendar,
  Check,
  Power,
  ChevronRight,
  Shield,
  EyeOff,
} from 'lucide-react';
import { adminMockService, AdminAccount, AdminStatus } from '@/services/adminMockService';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

export default function AdminManagementPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Toast / Notification State
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewingAdmin, setViewingAdmin] = useState<AdminAccount | null>(null);
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<AdminAccount | null>(null);

  // Create Admin Form State
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'Admin' as const,
    organizationName: 'Cool Technologies LLC',
    organizationId: 'org_cool_tech_001',
    status: 'Active' as AdminStatus,
    designation: 'Business Administrator',
    department: 'Executive Management',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Admins from Mock Service
  const loadAdmins = async () => {
    setLoading(true);
    try {
      const response = await adminMockService.getAdmins({
        search: searchQuery,
        status: statusFilter,
        page: currentPage,
        limit: rowsPerPage,
      });
      setAdmins(response.admins);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [searchQuery, statusFilter, currentPage, rowsPerPage]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Validation Logic for Create Form
  const validateCreateForm = () => {
    const errors: Record<string, string> = {};

    if (!createForm.name.trim()) {
      errors.name = 'Full name is required.';
    }

    if (!createForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(createForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!createForm.username.trim()) {
      errors.username = 'Username is required.';
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(createForm.username.trim())) {
      errors.username = 'Username can only contain letters, numbers, underscores, and dots.';
    }

    if (!createForm.password) {
      errors.password = 'Password is required.';
    } else if (createForm.password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    if (!createForm.confirmPassword) {
      errors.confirmPassword = 'Confirm password is required.';
    } else if (createForm.password !== createForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!createForm.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await adminMockService.createAdmin({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        username: createForm.username.trim(),
        password: createForm.password,
        phone: createForm.phone.trim(),
        organizationId: createForm.organizationId,
        organizationName: createForm.organizationName,
        status: createForm.status,
        designation: createForm.designation,
        department: createForm.department,
      });

      if (result.success && result.admin) {
        showToast(`Admin account for ${result.admin.name} created successfully!`);
        setIsCreateModalOpen(false);
        setCreateForm({
          name: '',
          email: '',
          username: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: 'Admin',
          organizationName: 'Cool Technologies LLC',
          organizationId: 'org_cool_tech_001',
          status: 'Active',
          designation: 'Business Administrator',
          department: 'Executive Management',
        });
        setFormErrors({});
        loadAdmins();
      } else {
        showToast(result.error || 'Failed to create Admin.', 'error');
      }
    } catch {
      showToast('An unexpected error occurred.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin: AdminAccount) => {
    try {
      const res = await adminMockService.toggleAdminStatus(admin.id);
      if (res.success) {
        showToast(`${admin.name} is now ${res.newStatus}`);
        loadAdmins();
      }
    } catch {
      showToast('Failed to update admin status.', 'error');
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    try {
      const res = await adminMockService.deleteAdmin(deletingAdmin.id);
      if (res.success) {
        showToast(`Admin ${deletingAdmin.name} removed successfully.`);
        setDeletingAdmin(null);
        loadAdmins();
      }
    } catch {
      showToast('Failed to delete admin.', 'error');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;

    try {
      const res = await adminMockService.updateAdmin(editingAdmin.id, {
        name: editingAdmin.name,
        phone: editingAdmin.phone,
        designation: editingAdmin.designation,
        status: editingAdmin.status,
      });

      if (res.success) {
        showToast('Admin details updated successfully.');
        setEditingAdmin(null);
        loadAdmins();
      } else {
        showToast(res.error || 'Failed to update.', 'error');
      }
    } catch {
      showToast('Error updating admin.', 'error');
    }
  };

  const activeCount = admins.filter((a) => a.status === 'Active').length;
  const inactiveCount = admins.filter((a) => a.status === 'Inactive').length;

  return (
    <div className="space-y-4 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : 'bg-rose-900 text-rose-100 border-rose-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── Top Header Banner ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Admin Management
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                Super Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Create, provision, and govern Organization Admin accounts and security privileges.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="primary"
            size="sm"
            className="bg-[#1677FF] hover:bg-[#0958D9] text-white font-bold shadow-xs px-4 py-2 text-xs flex items-center gap-1.5 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create Admin</span>
          </Button>
        </div>
      </div>

      {/* ── KPI Stat Cards (4 Executive Cards) ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Admins</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-black text-slate-900">{admins.length}</p>
          <span className="text-[10px] text-slate-400 font-medium">Provisioned accounts</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Admins</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-black text-emerald-600">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% operational</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Inactive Admins</span>
            <UserX className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-slate-900">{inactiveCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Deactivated / Pending</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tenants</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-black text-slate-900">2 Organizations</p>
          <span className="text-[10px] text-purple-600 font-medium">Cool Technologies</span>
        </div>
      </div>

      {/* ── Main Data Card with Filter Toolbar & Table ─────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, username, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>

          {/* Status Filter & Rows */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-600 font-medium">Show:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={10}>10 Rows</option>
                <option value={25}>25 Rows</option>
                <option value={50}>50 Rows</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Admin Name &amp; Contact</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4 text-center">Role</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading Admin records...</span>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No Admin accounts found</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Click &quot;+ Create Admin&quot; above to provision a new admin.</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Contact */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{admin.name}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{admin.email}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{admin.phone}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {admin.username}
                      </span>
                    </td>

                    {/* Organization */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{admin.organizationName}</span>
                        <span className="text-[10px] text-slate-500">{admin.designation}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span>Admin</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(admin)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                          admin.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${admin.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{admin.status}</span>
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{admin.createdAt}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* View */}
                        <button
                          type="button"
                          onClick={() => setViewingAdmin(admin)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Admin Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => setEditingAdmin(admin)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(admin)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title={admin.status === 'Active' ? 'Deactivate Admin' : 'Activate Admin'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setDeletingAdmin(admin)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CREATE ADMIN MODAL & FORM (Step 1 & Step 2) ────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => !isSubmitting && setIsCreateModalOpen(false)}
        title="Create Organization Admin"
        description="Provision a new tenant Administrator account. The admin will immediately be able to log in using these credentials."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs pt-1">
          {/* Full Name */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Johnathan Smith"
              value={createForm.name}
              onChange={(e) => {
                setCreateForm({ ...createForm, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
              }}
              className={`w-full bg-white border ${formErrors.name ? 'border-rose-400' : 'border-slate-300'} rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
            />
            {formErrors.name && <p className="text-[11px] text-rose-600 mt-1">{formErrors.name}</p>}
          </div>

          {/* Email & Username Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  placeholder="admin@company.com"
                  value={createForm.email}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                  className={`w-full pl-9 pr-3 py-2 bg-white border ${formErrors.email ? 'border-rose-400' : 'border-slate-300'} rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
                />
              </div>
              {formErrors.email && <p className="text-[11px] text-rose-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Username <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. john_admin"
                value={createForm.username}
                onChange={(e) => {
                  setCreateForm({ ...createForm, username: e.target.value });
                  if (formErrors.username) setFormErrors({ ...formErrors, username: '' });
                }}
                className={`w-full bg-white border ${formErrors.username ? 'border-rose-400' : 'border-slate-300'} rounded-lg px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
              />
              {formErrors.username && <p className="text-[11px] text-rose-600 mt-1">{formErrors.username}</p>}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min 6 characters"
                  value={createForm.password}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, password: e.target.value });
                    if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                  }}
                  className={`w-full pl-9 pr-8 py-2 bg-white border ${formErrors.password ? 'border-rose-400' : 'border-slate-300'} rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {formErrors.password && <p className="text-[11px] text-rose-600 mt-1">{formErrors.password}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Confirm Password <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter password"
                  value={createForm.confirmPassword}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, confirmPassword: e.target.value });
                    if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                  }}
                  className={`w-full pl-9 pr-8 py-2 bg-white border ${formErrors.confirmPassword ? 'border-rose-400' : 'border-slate-300'} rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1">{formErrors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Phone Number & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-rose-500 font-bold">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="+971 50 123 4567"
                  value={createForm.phone}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, phone: e.target.value });
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                  }}
                  className={`w-full pl-9 pr-3 py-2 bg-white border ${formErrors.phone ? 'border-rose-400' : 'border-slate-300'} rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600`}
                />
              </div>
              {formErrors.phone && <p className="text-[11px] text-rose-600 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={createForm.status}
                onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as AdminStatus })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="Active">Active (Can log in immediately)</option>
                <option value="Inactive">Inactive (Access suspended)</option>
              </select>
            </div>
          </div>

          {/* Organization & Role (Locked to Admin) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role Assigned</label>
              <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Admin</span>
                </span>
                <span className="text-[10px] text-blue-600 font-medium">Tenant Level Access</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tenant Organization</label>
              <input
                type="text"
                disabled
                value="Cool Technologies LLC"
                className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting}
              className="bg-[#1677FF] hover:bg-[#0958D9] text-white font-bold"
            >
              {isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── VIEW ADMIN MODAL ─────────────────────────────────────────── */}
      {viewingAdmin && (
        <Modal
          isOpen={true}
          onClose={() => setViewingAdmin(null)}
          title="Admin User Details"
          description="Detailed profile and access scopes for this administrator."
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                {viewingAdmin.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{viewingAdmin.name}</h3>
                <p className="text-slate-500">{viewingAdmin.designation}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {viewingAdmin.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Email Address</span>
                <span className="font-semibold text-slate-800 break-all">{viewingAdmin.email}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Username</span>
                <span className="font-mono text-slate-800 font-bold">{viewingAdmin.username}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                <span className="font-semibold text-slate-800">{viewingAdmin.phone}</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Organization</span>
                <span className="font-semibold text-slate-800">{viewingAdmin.organizationName}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50 text-slate-700 space-y-1">
              <span className="font-bold text-slate-900 block">Assigned Scopes:</span>
              <p>• Full organization access to Leads, Sales, Customers, Tasks, and Settings.</p>
              <p>• Cannot manage Super Admin or peer Admin accounts.</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setViewingAdmin(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── EDIT ADMIN MODAL ─────────────────────────────────────────── */}
      {editingAdmin && (
        <Modal
          isOpen={true}
          onClose={() => setEditingAdmin(null)}
          title="Edit Admin Account"
          description="Update contact information and active status."
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editingAdmin.name}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={editingAdmin.phone}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editingAdmin.status}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value as AdminStatus })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={editingAdmin.designation}
                onChange={(e) => setEditingAdmin({ ...editingAdmin, designation: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditingAdmin(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-[#1677FF] hover:bg-[#0958D9] text-white font-bold">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── DELETE ADMIN MODAL ───────────────────────────────────────── */}
      {deletingAdmin && (
        <Modal
          isOpen={true}
          onClose={() => setDeletingAdmin(null)}
          title="Delete Admin Account"
          description="Are you sure you want to delete this Admin account? This action cannot be undone."
        >
          <div className="space-y-4 text-xs pt-1">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800">
              <p className="font-bold">Warning:</p>
              <p className="mt-0.5">
                Admin <strong>{deletingAdmin.name}</strong> ({deletingAdmin.email}) will permanently lose access to the CRM.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeletingAdmin(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleDeleteAdmin}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                Delete Admin
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
