'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Contact,
  Plus,
  Check,
  CheckCircle,
  Edit2,
  Trash2,
  Users,
  Eye,
  X,
  ArrowRight,
  Shield,
  ShieldCheck,
  Briefcase,
  Layers,
  Calendar,
  Search,
  Sparkles,
  UserCheck,
  UserX,
  Zap,
  TrendingUp,
  CheckSquare,
  ShoppingCart,
  FileText,
  MessageSquare,
  Wrench,
  BarChart3,
  Settings,
  Upload,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CezconProfileItem, CezconUserItem } from '@/types/settings';
import { CEZCON_PROFILES_DATA } from '@/data/settingsMockData';

function formatProfileDate(dateStr?: string | number) {
  if (!dateStr) return '28-09-2026';
  if (typeof dateStr === 'number') {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
  }
  const str = String(dateStr).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) {
    return str;
  }
  try {
    const parts = str.split(/[-/T ]/);
    if (parts.length >= 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) {
          return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        }
      } else {
        // DD-MM-YYYY
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) {
          return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
        }
      }
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
    }
  } catch (e) {}
  return str;
}

function ProfileAvatarItem({
  profile,
  assignedUsers,
  style,
}: {
  profile: CezconProfileItem;
  assignedUsers: CezconUserItem[];
  style: { bg: string; icon: React.ComponentType<{ className?: string }>; iconColor: string };
}) {
  const [imageError, setImageError] = useState(false);
  const firstUserWithImage = assignedUsers.find((u) => u.avatarImage || u.avatarUrl);
  const rawImage = profile.avatarImage || profile.avatarUrl || firstUserWithImage?.avatarImage || firstUserWithImage?.avatarUrl;
  const validImage = typeof rawImage === 'string' && rawImage.trim().length > 5 && !imageError ? rawImage : null;
  const firstUser = assignedUsers[0];
  const IconComponent = style.icon;

  if (validImage) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/90 shadow-2xs bg-slate-100">
        <img
          src={validImage}
          alt=""
          onError={() => setImageError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  if (firstUser) {
    return (
      <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/90 shadow-2xs ${firstUser.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white font-bold text-[11px]`}>
        {firstUser.name ? firstUser.name.slice(0, 2).toUpperCase() : 'U'}
      </div>
    );
  }

  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${style.bg}`}>
      <IconComponent className={`w-4 h-4 ${style.iconColor}`} />
    </div>
  );
}

export function ProfileTab() {
  const router = useRouter();
  const [profilesList, setProfilesList] = useState<CezconProfileItem[]>(CEZCON_PROFILES_DATA);
  const [usersList, setUsersList] = useState<CezconUserItem[]>([]);
  const [profileRowsPerPage, setProfileRowsPerPage] = useState(10);
  const [profileSearch, setProfileSearch] = useState('');
  const [openActionMenuId, setOpenActionMenuId] = useState<number | string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.profile-action-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const [isAddProfileModalOpen, setIsAddProfileModalOpen] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDepartment, setNewProfileDepartment] = useState('Sales & Commercial');
  const [newProfileDescription, setNewProfileDescription] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('blue');
  const [newProfileDataScope, setNewProfileDataScope] = useState('team');
  const [newProfileModules, setNewProfileModules] = useState({
    sales: true,
    project: true,
    purchase: false,
    invoices: true,
    marketing: false,
    service: false,
    reports: true,
    settings: false,
  });
  const [newProfileActionPermissions, setNewProfileActionPermissions] = useState({
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canApprove: false,
  });
  const [newProfileAvatar, setNewProfileAvatar] = useState<string | null>(null);
  const [createModalTab, setCreateModalTab] = useState<'identity' | 'modules' | 'scope'>('identity');

  const [editingProfile, setEditingProfile] = useState<CezconProfileItem | null>(null);
  const [editModalTab, setEditModalTab] = useState<'identity' | 'modules' | 'scope'>('identity');
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileDepartment, setEditProfileDepartment] = useState('Sales & Commercial');
  const [editProfileDescription, setEditProfileDescription] = useState('');
  const [editProfileColor, setEditProfileColor] = useState('blue');
  const [editProfileDataScope, setEditProfileDataScope] = useState('team');
  const [editProfileModules, setEditProfileModules] = useState({
    sales: true,
    project: true,
    purchase: false,
    invoices: true,
    marketing: false,
    service: false,
    reports: true,
    settings: false,
  });
  const [editProfileActionPermissions, setEditProfileActionPermissions] = useState({
    canCreate: true,
    canEdit: true,
    canDelete: false,
    canExport: true,
    canApprove: false,
  });
  const [editProfileAvatar, setEditProfileAvatar] = useState<string | null>(null);

  const [profileToDelete, setProfileToDelete] = useState<CezconProfileItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedProfileForUsers, setSelectedProfileForUsers] = useState<CezconProfileItem | null>(null);
  const [viewingProfile, setViewingProfile] = useState<CezconProfileItem | null>(null);
  const [modalUserSearch, setModalUserSearch] = useState('');

  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const applyPresetToForm = (preset: 'admin' | 'manager' | 'sales' | 'worker', isEdit: boolean) => {
    if (preset === 'admin') {
      const mods = { sales: true, project: true, purchase: true, invoices: true, marketing: true, service: true, reports: true, settings: true };
      const acts = { canCreate: true, canEdit: true, canDelete: true, canExport: true, canApprove: true };
      if (isEdit) {
        setEditProfileModules(mods);
        setEditProfileActionPermissions(acts);
        setEditProfileDataScope('all');
      } else {
        setNewProfileModules(mods);
        setNewProfileActionPermissions(acts);
        setNewProfileDataScope('all');
      }
    } else if (preset === 'manager') {
      const mods = { sales: true, project: true, purchase: true, invoices: true, marketing: true, service: true, reports: true, settings: false };
      const acts = { canCreate: true, canEdit: true, canDelete: false, canExport: true, canApprove: true };
      if (isEdit) {
        setEditProfileModules(mods);
        setEditProfileActionPermissions(acts);
        setEditProfileDataScope('team');
      } else {
        setNewProfileModules(mods);
        setNewProfileActionPermissions(acts);
        setNewProfileDataScope('team');
      }
    } else if (preset === 'sales') {
      const mods = { sales: true, project: false, purchase: false, invoices: true, marketing: true, service: false, reports: true, settings: false };
      const acts = { canCreate: true, canEdit: true, canDelete: false, canExport: true, canApprove: false };
      if (isEdit) {
        setEditProfileModules(mods);
        setEditProfileActionPermissions(acts);
        setEditProfileDataScope('own');
      } else {
        setNewProfileModules(mods);
        setNewProfileActionPermissions(acts);
        setNewProfileDataScope('own');
      }
    } else if (preset === 'worker') {
      const mods = { sales: false, project: true, purchase: true, invoices: false, marketing: false, service: true, reports: false, settings: false };
      const acts = { canCreate: true, canEdit: true, canDelete: false, canExport: false, canApprove: false };
      if (isEdit) {
        setEditProfileModules(mods);
        setEditProfileActionPermissions(acts);
        setEditProfileDataScope('own');
      } else {
        setNewProfileModules(mods);
        setNewProfileActionPermissions(acts);
        setNewProfileDataScope('own');
      }
    }
  };

  const toggleAllModules = (select: boolean, isEdit: boolean) => {
    const all = {
      sales: select,
      project: select,
      purchase: select,
      invoices: select,
      marketing: select,
      service: select,
      reports: select,
      settings: select,
    };
    if (isEdit) {
      setEditProfileModules(all);
    } else {
      setNewProfileModules(all);
    }
  };

  const syncProfiles = (updated: CezconProfileItem[], message?: string) => {
    setProfilesList(updated);
    try {
      localStorage.setItem('cezcon_crm_profiles_list', JSON.stringify(updated));
      window.dispatchEvent(new Event('crm_profiles_updated'));
    } catch (err) {
      console.error(err);
    }
    if (message) {
      setSaveSuccess(message);
      setTimeout(() => setSaveSuccess(null), 3500);
    }
  };

  const loadData = () => {
    try {
      const savedUsers = localStorage.getItem('cezcon_crm_users_list');
      let currentUsers: CezconUserItem[] = [];
      if (savedUsers) {
        const parsedUsers = JSON.parse(savedUsers);
        if (Array.isArray(parsedUsers)) {
          currentUsers = parsedUsers;
          setUsersList(parsedUsers);
        }
      }

      const savedProfiles = localStorage.getItem('cezcon_crm_profiles_list');
      let existingProfiles: CezconProfileItem[] = [];
      if (savedProfiles) {
        const parsed = JSON.parse(savedProfiles);
        if (Array.isArray(parsed)) {
          existingProfiles = parsed;
        }
      }

      // Collect all distinct profiles needed by existing users in currentUsers
      const userProfileNames = new Set<string>();
      currentUsers.forEach((u) => {
        const prof = u.profileType?.trim();
        const pLower = (prof || '').toLowerCase();
        if (prof && prof !== 'Select Profile' && pLower !== 'admin' && pLower !== 'super admin') {
          userProfileNames.add(prof);
        } else if (u.managerType && !u.managerType.toLowerCase().includes('admin')) {
          userProfileNames.add(u.managerType);
        } else if (u.employeeType && !u.employeeType.toLowerCase().includes('admin')) {
          userProfileNames.add(u.employeeType);
        }
      });

      const profileMap = new Map<string, CezconProfileItem>();

      // 1. Add user-based profiles to make sure every created user's profile is present
      Array.from(userProfileNames).forEach((name, idx) => {
        const existing = existingProfiles.find((p) => p.name.toLowerCase().trim() === name.toLowerCase().trim());
        if (existing) {
          profileMap.set(name.toLowerCase().trim(), existing);
        } else {
          profileMap.set(name.toLowerCase().trim(), {
            id: Date.now() + idx,
            name: name,
            date: '28-09-2026',
            sales: true,
            project: true,
            description: `Role profile for ${name}`,
            superAdminOnly: false,
          });
        }
      });

      // 2. Add custom-created profiles from existingProfiles
      existingProfiles.forEach((p) => {
        const key = p.name.toLowerCase().trim();
        if (key !== 'admin' && key !== 'super admin' && !p.superAdminOnly) {
          if (!profileMap.has(key)) {
            // If currentUsers has users, only keep custom profiles or non-seed profiles
            if (currentUsers.length === 0 || Number(p.id) > 10) {
              profileMap.set(key, p);
            }
          }
        }
      });

      // Fallback if no users or profiles
      let mergedProfiles = Array.from(profileMap.values()).filter(
        (p) => p.name.toLowerCase().trim() !== 'admin' && p.name.toLowerCase().trim() !== 'super admin'
      );
      if (mergedProfiles.length === 0) {
        mergedProfiles = CEZCON_PROFILES_DATA.filter(
          (p) => p.name.toLowerCase().trim() !== 'admin' && p.name.toLowerCase().trim() !== 'super admin'
        );
      }

      setProfilesList(mergedProfiles);
      localStorage.setItem('cezcon_crm_profiles_list', JSON.stringify(mergedProfiles));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('crm_profiles_updated', loadData);
    window.addEventListener('crm_users_updated', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('crm_profiles_updated', loadData);
      window.removeEventListener('crm_users_updated', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  const getProfileUsers = (profileName: string): CezconUserItem[] => {
    const pName = (profileName || '').toLowerCase().trim();
    if (!pName) return [];

    return usersList.filter((u) => {
      const uProf = (u.profileType || '').toLowerCase().trim();
      const uMgrType = (u.managerType || '').toLowerCase().trim();
      const uEmpType = (u.employeeType || '').toLowerCase().trim();
      const uRole = (u.role || '').toLowerCase().trim();
      const uDesig = (u.designation || '').toLowerCase().trim();

      // 1. Direct exact match on profileType
      if (uProf && uProf === pName) {
        return true;
      }

      // If user has an explicit profileType assigned that exists in the system profiles list,
      // and it doesn't match this profile, do NOT match this profile
      if (uProf && uProf !== pName && profilesList.some((p) => p.name.toLowerCase().trim() === uProf)) {
        return false;
      }

      // 2. Custom role profile match (e.g., 'Sales Manager', 'Operations Manager')
      if (pName !== 'manager' && pName !== 'employee' && pName !== 'admin' && pName !== 'worker') {
        return (
          uProf === pName ||
          uMgrType === pName ||
          uEmpType === pName ||
          uDesig === pName
        );
      }

      // 3. Generic 'Manager' profile: only match if user doesn't belong to a more specific manager profile
      if (pName === 'manager') {
        if (uMgrType && uMgrType !== 'manager' && profilesList.some((p) => p.name.toLowerCase().trim() === uMgrType)) {
          return false;
        }
        if (uProf && uProf !== 'manager') {
          return false;
        }
        return uProf === 'manager' || uMgrType === 'manager' || (uRole === 'manager' && !uMgrType && !uProf);
      }

      // 4. Generic 'Employee' profile: only match if user doesn't belong to a more specific employee profile
      if (pName === 'employee') {
        if (uEmpType && uEmpType !== 'employee' && profilesList.some((p) => p.name.toLowerCase().trim() === uEmpType)) {
          return false;
        }
        if (uProf && uProf !== 'employee') {
          return false;
        }
        return uProf === 'employee' || uEmpType === 'employee' || (uRole === 'employee' && !uEmpType && !uProf);
      }

      // 5. Admin profile: only true admins
      if (pName === 'admin') {
        if (uProf && uProf !== 'admin') return false;
        return uProf === 'admin' || (!uProf && (Boolean(u.isAdmin) || uRole === 'admin'));
      }

      // 6. Worker profile: only workers
      if (pName === 'worker') {
        if (uProf && uProf !== 'worker') return false;
        return uProf === 'worker' || (!uProf && (Boolean(u.isWorker) || uRole === 'worker'));
      }

      return false;
    });
  };

  const totalUsersAcrossProfiles = usersList.length;
  const salesEnabledCount = profilesList.filter((p) => p.sales).length;
  const projectEnabledCount = profilesList.filter((p) => p.project).length;

  const filteredProfiles = profilesList.filter((p) => {
    const pName = p.name.toLowerCase().trim();
    if (pName === 'admin' || pName === 'super admin' || p.superAdminOnly) {
      return false;
    }

    const assignedUsers = getProfileUsers(p.name);
    // When actual users exist, only show profiles that have assigned users or are custom added
    if (usersList.length > 0 && assignedUsers.length === 0 && Number(p.id) <= 10) {
      return false;
    }

    const matchesName = p.name.toLowerCase().includes(profileSearch.toLowerCase());
    const matchesUser = assignedUsers.some(
      (u) =>
        u.name.toLowerCase().includes(profileSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(profileSearch.toLowerCase())
    );
    return matchesName || matchesUser;
  });

  const handleAddProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;

    const newProfile: CezconProfileItem = {
      id: Date.now(),
      name: newProfileName.trim(),
      date: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'),
      sales: Boolean(newProfileModules.sales),
      project: Boolean(newProfileModules.project),
      description: newProfileDescription.trim() || `${newProfileDepartment} Profile`,
      superAdminOnly: false,
      avatarImage: newProfileAvatar,
    };

    const updated = [...profilesList, newProfile];
    syncProfiles(updated, `Role profile "${newProfile.name}" created successfully.`);
    setNewProfileName('');
    setNewProfileDescription('');
    setNewProfileAvatar(null);
    setIsAddProfileModalOpen(false);
  };

  const handleStartEdit = (p: CezconProfileItem) => {
    setEditingProfile(p);
    setEditProfileName(p.name);
    setEditProfileDepartment((p as any).department || 'Sales & Commercial');
    setEditProfileDescription(p.description || '');
    setEditProfileModules({
      sales: Boolean(p.sales),
      project: Boolean(p.project),
      purchase: Boolean((p as any).purchase ?? false),
      invoices: Boolean((p as any).invoices ?? true),
      marketing: Boolean((p as any).marketing ?? false),
      service: Boolean((p as any).service ?? false),
      reports: Boolean((p as any).reports ?? true),
      settings: Boolean((p as any).settings ?? false),
    });
    setEditProfileAvatar(p.avatarImage || null);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile || !editProfileName.trim()) return;

    const updated = profilesList.map((p) =>
      p.id === editingProfile.id
        ? {
            ...p,
            name: editProfileName.trim(),
            sales: Boolean(editProfileModules.sales),
            project: Boolean(editProfileModules.project),
            description: editProfileDescription.trim() || p.description,
            avatarImage: editProfileAvatar,
          }
        : p
    );

    syncProfiles(updated, `Profile "${editProfileName.trim()}" updated successfully.`);
    setEditingProfile(null);
  };

  const handleDeleteProfile = () => {
    if (!profileToDelete) return;
    const updated = profilesList.filter((p) => p.id !== profileToDelete.id);
    syncProfiles(updated, `Profile "${profileToDelete.name}" deleted successfully.`);
    setProfileToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleToggleSales = (p: CezconProfileItem) => {
    const updated = profilesList.map((item) =>
      item.id === p.id ? { ...item, sales: !item.sales } : item
    );
    syncProfiles(updated);
  };

  const handleToggleProject = (p: CezconProfileItem) => {
    const updated = profilesList.map((item) =>
      item.id === p.id ? { ...item, project: !item.project } : item
    );
    syncProfiles(updated);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (isEdit) {
        setEditProfileAvatar(result);
      } else {
        setNewProfileAvatar(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const getProfileBadgeStyle = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('admin')) {
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
        icon: ShieldCheck,
        iconColor: 'text-indigo-600',
      };
    }
    if (lower.includes('manager')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/80',
        icon: Briefcase,
        iconColor: 'text-blue-600',
      };
    }
    if (lower.includes('worker')) {
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
        icon: Layers,
        iconColor: 'text-amber-600',
      };
    }
    return {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: Contact,
      iconColor: 'text-emerald-600',
    };
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2.5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        {/* Card Header Bar (Breadcrumb & + PROFILE Button) */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2 text-slate-700">
            <span className="text-slate-400 font-normal">📁</span>
            <span className="text-xs font-semibold text-slate-700">Profile</span>
          </div>
          <button
            type="button"
            onClick={() => setIsAddProfileModalOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>+ PROFILE</span>
          </button>
        </div>

        {/* Controls Bar: Show entries & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white text-xs border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Show</span>
            <select
              value={profileRowsPerPage}
              onChange={(e) => {
                setProfileRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>Rows</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 text-xs">Search</span>
            <input
              type="text"
              value={profileSearch}
              onChange={(e) => {
                setProfileSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-48 sm:w-56 bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Profiles Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[12px]">
              <tr>
                <th className="py-2.5 px-4 text-center w-16 border-r border-slate-200/60 font-semibold">SL.No</th>
                <th className="py-2.5 px-4 font-semibold">Profile Name</th>
                <th className="py-2.5 px-4 text-center w-36 font-semibold">Date</th>
                <th className="py-2.5 px-3 text-center w-24 font-semibold">Sales</th>
                <th className="py-2.5 px-3 text-center w-24 font-semibold">Project</th>
                <th className="py-2.5 px-4 text-center w-24 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Contact className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No matching user profiles found</p>
                    <p className="text-[11px] text-slate-400">Try adjusting your search query</p>
                  </td>
                </tr>
              ) : (
                filteredProfiles
                  .slice((currentPage - 1) * profileRowsPerPage, currentPage * profileRowsPerPage)
                  .map((p, idx) => {
                    const rowNumber = (currentPage - 1) * profileRowsPerPage + idx + 1;
                    const assignedUsers = getProfileUsers(p.name);

                    return (
                      <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                        {/* SL.No */}
                        <td className="py-3 px-4 text-center text-slate-700 font-medium border-r border-slate-100">
                          {rowNumber}
                        </td>

                        {/* Profile Name (Blue Link) */}
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => setViewingProfile(p)}
                            className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline font-normal text-[13px] text-left cursor-pointer transition-colors"
                          >
                            {p.name}
                          </button>
                        </td>

                        {/* Date (DD-MM-YYYY) */}
                        <td className="py-3 px-4 text-center text-slate-600 font-normal">
                          {formatProfileDate(p.date)}
                        </td>

                        {/* Sales Checkmark */}
                        <td className="py-3 px-3 text-center">
                          {p.sales ? (
                            <Check className="w-4 h-4 text-[#16A34A] stroke-[3] mx-auto" />
                          ) : (
                            <span className="text-slate-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Project Checkmark */}
                        <td className="py-3 px-3 text-center">
                          {p.project ? (
                            <Check className="w-4 h-4 text-[#16A34A] stroke-[3] mx-auto" />
                          ) : (
                            <span className="text-slate-300 font-bold">-</span>
                          )}
                        </td>

                        {/* Actions Dropdown Button [ ⚙ ▾ ] */}
                        <td className="py-3 px-4 text-center">
                          <div className="relative inline-block profile-action-menu-container">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenuId(openActionMenuId === p.id ? null : p.id);
                              }}
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1 bg-[#002D4A] hover:bg-[#001E33] text-white text-[11px] font-medium rounded transition-colors cursor-pointer shadow-xs"
                            >
                              <Settings className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {/* Dropdown Menu matching exact Cezcon CRM screenshot */}
                            {openActionMenuId === p.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenActionMenuId(null)}
                                />
                                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg border border-slate-200 py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setViewingProfile(p);
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                  >
                                    <svg className="w-4 h-4 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 3h10v2H7V5zm0 4h10v2H7V9zm0 4h7v2H7v-2z" />
                                    </svg>
                                    <span>View</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      handleStartEdit(p);
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                  >
                                    <svg className="w-4 h-4 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    <span>Edit</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenuId(null);
                                      setProfileToDelete(p);
                                      setIsDeleteModalOpen(true);
                                    }}
                                    className="w-full text-left px-3 py-1.5 flex items-center gap-2.5 hover:bg-[#F3F4F6] text-[13px] text-slate-800 cursor-pointer font-normal"
                                  >
                                    <svg className="w-4 h-4 text-slate-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M3 6h18" />
                                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Showing X to Y of Z entries & Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs text-slate-600">
          <div>
            Showing {filteredProfiles.length === 0 ? 0 : (currentPage - 1) * profileRowsPerPage + 1} to{' '}
            {Math.min(currentPage * profileRowsPerPage, filteredProfiles.length)} of {filteredProfiles.length} entries
          </div>

          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              «
            </button>

            {Array.from({ length: Math.ceil(filteredProfiles.length / profileRowsPerPage) || 1 }).map((_, i) => (
              <button
                key={i + 1}
                type="button"
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 rounded text-xs font-semibold cursor-pointer transition-colors ${
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage >= Math.ceil(filteredProfiles.length / profileRowsPerPage)}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 cursor-pointer disabled:cursor-not-allowed"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {isAddProfileModalOpen && (
        <Modal
          isOpen={isAddProfileModalOpen}
          onClose={() => setIsAddProfileModalOpen(false)}
          title="Add Profile"
          description="Configure role module privileges, charts, additional privileges, and activities"
          icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
          maxWidth="6xl"
        >
          <form onSubmit={handleAddProfile} className="space-y-6 text-xs text-slate-800">
            {/* Top Bar: Name Input */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="font-bold text-slate-800 whitespace-nowrap text-xs">
                Name <span className="text-rose-600">*</span> :
              </label>
              <input
                type="text"
                required
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Enter profile / role title (e.g. Sales Manager)"
                className="w-full max-w-md bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* ===================== SECTION 1: SALES ===================== */}
            <div className="space-y-6 pt-2">
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest pb-1.5 border-b-2 border-slate-300 inline-block px-8">
                    SALES
                  </h3>
                </div>

                {/* Module Privileges Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Module Privileges</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 w-72">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  const keys = [
                                    'dashboard', 'task', 'campaign', 'lead', 'customer',
                                    'contact', 'receipt', 'delivery', 'stock', 'purchase_order',
                                    'purchase_invoice', 'supplier_payment', 'opp_settings',
                                    'init_settings', 'camp_settings', 'order_settings',
                                    'task_settings', 'biz_opp', 'target', 'cost_job',
                                    'tags', 'products'
                                  ];
                                  const updated: any = { ...newProfileActionPermissions };
                                  keys.forEach((k) => {
                                    updated[`${k}_view`] = checked;
                                    updated[`${k}_create`] = checked;
                                    updated[`${k}_edit`] = checked;
                                    updated[`${k}_delete`] = checked;
                                  });
                                  setNewProfileActionPermissions(updated);
                                }}
                                className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                              />
                              <span>Module Name</span>
                            </label>
                          </th>
                          {['View All', 'Create All', 'Edit All', 'Delete All'].map((header, hIdx) => {
                            const actionKey = ['view', 'create', 'edit', 'delete'][hIdx];
                            return (
                              <th key={header} className="py-2.5 px-4 text-center w-32">
                                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      const keys = [
                                        'dashboard', 'task', 'campaign', 'lead', 'customer',
                                        'contact', 'receipt', 'delivery', 'stock', 'purchase_order',
                                        'purchase_invoice', 'supplier_payment', 'opp_settings',
                                        'init_settings', 'camp_settings', 'order_settings',
                                        'task_settings', 'biz_opp', 'target', 'cost_job',
                                        'tags', 'products'
                                      ];
                                      const updated: any = { ...newProfileActionPermissions };
                                      keys.forEach((k) => {
                                        updated[`${k}_${actionKey}`] = checked;
                                      });
                                      setNewProfileActionPermissions(updated);
                                    }}
                                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                  />
                                  <span>{header}</span>
                                </label>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'dashboard', name: 'Dashboard / Calendar', view: true, create: true, edit: true, delete: true },
                          { key: 'task', name: 'Task', view: true, create: true, edit: true, delete: true },
                          { key: 'marketing_header', name: 'Marketing', isHeader: true },
                          { key: 'campaign', name: 'Campaign', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'lead', name: 'Lead', view: true, create: true, edit: true, delete: true },
                          { key: 'customer_header', name: 'Customer', isHeader: true },
                          { key: 'customer', name: 'Customer', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'contact', name: 'Contact', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'receipt', name: 'Set Receipt', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'delivery', name: 'Delivery Note', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'purchase_header', name: 'Purchase', isHeader: true },
                          { key: 'stock', name: 'Stock', indent: true, view: true, create: false, edit: true, delete: false },
                          { key: 'purchase_order', name: 'Purchase Order', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'purchase_invoice', name: 'Purchase Invoice', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'supplier_payment', name: 'Supplier Bill Payment', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'settings_header', name: 'Settings', isHeader: true },
                          { key: 'opp_settings', name: 'Opportunity Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'init_settings', name: 'Initial Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'camp_settings', name: 'Campaign Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'order_settings', name: 'Order Settings', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'task_settings', name: 'Task Settings', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'biz_opp', name: 'Business Opportunity', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'target', name: 'Company Target', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'cost_job', name: 'Cost/Job Type', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'tags', name: 'Customers Tags', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'products', name: 'Products', indent: true, view: true, create: true, edit: true, delete: true },
                        ].map((row) => {
                          if (row.isHeader) {
                            return (
                              <tr key={row.key} className="bg-slate-50/70">
                                <td colSpan={5} className="py-2 px-4 font-bold text-slate-800">
                                  <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                                    />
                                    <span>{row.name}</span>
                                  </label>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4">
                                <label className={`inline-flex items-center gap-2 cursor-pointer ${row.indent ? 'pl-5' : ''}`}>
                                  <input
                                    type="checkbox"
                                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                  />
                                  <span className="text-slate-700">{row.name}</span>
                                </label>
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.view && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      defaultChecked
                                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                    />
                                    <span>View</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.create && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                    />
                                    <span>Create</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.edit && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                    />
                                    <span>Edit</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.delete && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                                    />
                                    <span>Delete</span>
                                  </label>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chart Permissions Grid */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Chart</h4>
                  <div className="border border-slate-200 rounded p-3 bg-white space-y-2.5">
                    <div className="text-left">
                      <button
                        type="button"
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Check All / Uncheck All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        'Company Overview', 'User Overview', 'Company Sales', 'User Sales',
                        'Opportunity Closed Lost (Company)', 'Opportunity Closed Lost (User)',
                        'Company Opportunity Stages', 'User Opportunity Stages',
                        'Opportunity Closing This Month (Company)', 'Opportunity Closing This Month (User)',
                        'Opportunity This Month (Company)', 'Opportunity This Month (User)',
                        'Lead This Month (Company)', 'Lead This Month (User)'
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                          />
                          <span className="truncate">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Privileges Grid */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Additional Privileges</h4>
                  <div className="border border-slate-200 rounded p-3 bg-white space-y-2.5">
                    <div className="text-left">
                      <button
                        type="button"
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Check All / Uncheck All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        'Campaign Expense', 'Opportunity Closing Permission', 'Profit View',
                        'Report Export Privilege', 'Customer Overview Privilege', 'Customer Statement View Privilege',
                        'Purchase Rate', 'Sales Visit Settings', 'Staff Visit View',
                        'Staff Activity Summary', 'Staff Performance', 'Sales Report by Category',
                        'Credit Limit', 'Stock Requirement', 'Quotation Approval',
                        'Sales Cost', 'Raw Materials', 'Order Cancellation'
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer"
                          />
                          <span className="truncate">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activities Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Activities</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'note', name: 'Note' },
                          { key: 'file', name: 'File' },
                          { key: 'order_expense', name: 'Order Expense' },
                        ].map((row) => (
                          <tr key={row.key} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4 w-72">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300"
                                />
                                <span className="text-slate-700">{row.name}</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>View</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Create</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Edit</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Delete</span>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ===================== SECTION 2: PROJECT ===================== */}
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest pb-1.5 border-b-2 border-slate-300 inline-block px-8">
                    PROJECT
                  </h3>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Module Privileges</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 w-72">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                              <span>Module Name</span>
                            </label>
                          </th>
                          {['View All', 'Create All', 'Edit All', 'Delete All'].map((header) => (
                            <th key={header} className="py-2.5 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>{header}</span>
                              </label>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'pm_dashboard', name: 'Dashboard', view: true, create: true, edit: true, delete: true },
                          { key: 'pm_task', name: 'Task', view: true, create: true, edit: true, delete: true },
                          { key: 'pm_project_header', name: 'Project', isHeader: true },
                          { key: 'pm_orders', name: 'Orders', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_report_header', name: 'Report', isHeader: true },
                          { key: 'pm_proj_rep', name: 'Project Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_time_rep', name: 'Timesheet Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_daily_rep', name: 'Daily Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_task_rep', name: 'Task Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_settings_header', name: 'Settings', isHeader: true },
                          { key: 'pm_grade', name: 'Grade', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_type', name: 'Project Type', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_status', name: 'Project Status', indent: true, view: true, create: true, edit: true, delete: true },
                        ].map((row) => {
                          if (row.isHeader) {
                            return (
                              <tr key={row.key} className="bg-slate-50/70">
                                <td colSpan={5} className="py-2 px-4 font-bold text-slate-800">
                                  <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                    <span>{row.name}</span>
                                  </label>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4">
                                <label className={`inline-flex items-center gap-2 cursor-pointer ${row.indent ? 'pl-5' : ''}`}>
                                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                  <span className="text-slate-700">{row.name}</span>
                                </label>
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.view && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>View</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.create && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Create</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.edit && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Edit</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.delete && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Delete</span>
                                  </label>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsAddProfileModalOpen(false)}
                className="px-5 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Profile Modal */}
      {editingProfile && (
        <Modal
          isOpen={!!editingProfile}
          onClose={() => setEditingProfile(null)}
          title={`Edit Profile: ${editingProfile.name}`}
          description="Configure role module privileges, charts, additional privileges, and activities"
          icon={<Edit2 className="w-5 h-5 text-blue-600" />}
          maxWidth="6xl"
        >
          <form onSubmit={handleSaveEdit} className="space-y-6 text-xs text-slate-800">
            {/* Top Bar: Name Input */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <label className="font-bold text-slate-800 whitespace-nowrap text-xs">
                Name <span className="text-rose-600">*</span> :
              </label>
              <input
                type="text"
                required
                value={editProfileName}
                onChange={(e) => setEditProfileName(e.target.value)}
                placeholder="Enter profile / role title"
                className="w-full max-w-md bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* ===================== SECTION 1: SALES ===================== */}
            <div className="space-y-6 pt-2">
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest pb-1.5 border-b-2 border-slate-300 inline-block px-8">
                    SALES
                  </h3>
                </div>

                {/* Module Privileges Table */}
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Module Privileges</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 w-72">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                              <span>Module Name</span>
                            </label>
                          </th>
                          {['View All', 'Create All', 'Edit All', 'Delete All'].map((header) => (
                            <th key={header} className="py-2.5 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>{header}</span>
                              </label>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'dashboard', name: 'Dashboard / Calendar', view: true, create: true, edit: true, delete: true },
                          { key: 'task', name: 'Task', view: true, create: true, edit: true, delete: true },
                          { key: 'marketing_header', name: 'Marketing', isHeader: true },
                          { key: 'campaign', name: 'Campaign', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'lead', name: 'Lead', view: true, create: true, edit: true, delete: true },
                          { key: 'customer_header', name: 'Customer', isHeader: true },
                          { key: 'customer', name: 'Customer', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'contact', name: 'Contact', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'receipt', name: 'Set Receipt', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'delivery', name: 'Delivery Note', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'purchase_header', name: 'Purchase', isHeader: true },
                          { key: 'stock', name: 'Stock', indent: true, view: true, create: false, edit: true, delete: false },
                          { key: 'purchase_order', name: 'Purchase Order', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'purchase_invoice', name: 'Purchase Invoice', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'supplier_payment', name: 'Supplier Bill Payment', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'settings_header', name: 'Settings', isHeader: true },
                          { key: 'opp_settings', name: 'Opportunity Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'init_settings', name: 'Initial Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'camp_settings', name: 'Campaign Settings', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'order_settings', name: 'Order Settings', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'task_settings', name: 'Task Settings', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'biz_opp', name: 'Business Opportunity', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'target', name: 'Company Target', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'cost_job', name: 'Cost/Job Type', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'tags', name: 'Customers Tags', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'products', name: 'Products', indent: true, view: true, create: true, edit: true, delete: true },
                        ].map((row) => {
                          if (row.isHeader) {
                            return (
                              <tr key={row.key} className="bg-slate-50/70">
                                <td colSpan={5} className="py-2 px-4 font-bold text-slate-800">
                                  <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                    <span>{row.name}</span>
                                  </label>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4">
                                <label className={`inline-flex items-center gap-2 cursor-pointer ${row.indent ? 'pl-5' : ''}`}>
                                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                  <span className="text-slate-700">{row.name}</span>
                                </label>
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.view && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>View</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.create && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Create</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.edit && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Edit</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.delete && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Delete</span>
                                  </label>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chart Permissions Grid */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Chart</h4>
                  <div className="border border-slate-200 rounded p-3 bg-white space-y-2.5">
                    <div className="text-left">
                      <button type="button" className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                        Check All / Uncheck All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        'Company Overview', 'User Overview', 'Company Sales', 'User Sales',
                        'Opportunity Closed Lost (Company)', 'Opportunity Closed Lost (User)',
                        'Company Opportunity Stages', 'User Opportunity Stages',
                        'Opportunity Closing This Month (Company)', 'Opportunity Closing This Month (User)',
                        'Opportunity This Month (Company)', 'Opportunity This Month (User)',
                        'Lead This Month (Company)', 'Lead This Month (User)'
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                          <span className="truncate">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Additional Privileges Grid */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Additional Privileges</h4>
                  <div className="border border-slate-200 rounded p-3 bg-white space-y-2.5">
                    <div className="text-left">
                      <button type="button" className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                        Check All / Uncheck All
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        'Campaign Expense', 'Opportunity Closing Permission', 'Profit View',
                        'Report Export Privilege', 'Customer Overview Privilege', 'Customer Statement View Privilege',
                        'Purchase Rate', 'Sales Visit Settings', 'Staff Visit View',
                        'Staff Activity Summary', 'Staff Performance', 'Sales Report by Category',
                        'Credit Limit', 'Stock Requirement', 'Quotation Approval',
                        'Sales Cost', 'Raw Materials', 'Order Cancellation'
                      ].map((item) => (
                        <label key={item} className="flex items-center gap-2 cursor-pointer text-slate-700">
                          <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                          <span className="truncate">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Activities Table */}
                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Activities</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'note', name: 'Note' },
                          { key: 'file', name: 'File' },
                          { key: 'order_expense', name: 'Order Expense' },
                        ].map((row) => (
                          <tr key={row.key} className="hover:bg-slate-50/50">
                            <td className="py-2 px-4 w-72">
                              <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span className="text-slate-700">{row.name}</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>View</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Create</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Edit</span>
                              </label>
                            </td>
                            <td className="py-2 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>Delete</span>
                              </label>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* ===================== SECTION 2: PROJECT ===================== */}
              <div className="space-y-6 pt-4 border-t border-slate-200">
                <div className="text-center">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest pb-1.5 border-b-2 border-slate-300 inline-block px-8">
                    PROJECT
                  </h3>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-800 text-center text-xs">Module Privileges</h4>
                  <div className="overflow-x-auto border border-slate-200 rounded">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-slate-700 font-bold">
                        <tr>
                          <th className="py-2.5 px-4 w-72">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                              <span>Module Name</span>
                            </label>
                          </th>
                          {['View All', 'Create All', 'Edit All', 'Delete All'].map((header) => (
                            <th key={header} className="py-2.5 px-4 text-center w-32">
                              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                <span>{header}</span>
                              </label>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {[
                          { key: 'pm_dashboard', name: 'Dashboard', view: true, create: true, edit: true, delete: true },
                          { key: 'pm_task', name: 'Task', view: true, create: true, edit: true, delete: true },
                          { key: 'pm_project_header', name: 'Project', isHeader: true },
                          { key: 'pm_orders', name: 'Orders', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_report_header', name: 'Report', isHeader: true },
                          { key: 'pm_proj_rep', name: 'Project Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_time_rep', name: 'Timesheet Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_daily_rep', name: 'Daily Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_task_rep', name: 'Task Report', indent: true, view: true, create: false, edit: false, delete: false },
                          { key: 'pm_settings_header', name: 'Settings', isHeader: true },
                          { key: 'pm_grade', name: 'Grade', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_type', name: 'Project Type', indent: true, view: true, create: true, edit: true, delete: true },
                          { key: 'pm_status', name: 'Project Status', indent: true, view: true, create: true, edit: true, delete: true },
                        ].map((row) => {
                          if (row.isHeader) {
                            return (
                              <tr key={row.key} className="bg-slate-50/70">
                                <td colSpan={5} className="py-2 px-4 font-bold text-slate-800">
                                  <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300" />
                                    <span>{row.name}</span>
                                  </label>
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <tr key={row.key} className="hover:bg-slate-50/50">
                              <td className="py-2 px-4">
                                <label className={`inline-flex items-center gap-2 cursor-pointer ${row.indent ? 'pl-5' : ''}`}>
                                  <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                  <span className="text-slate-700">{row.name}</span>
                                </label>
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.view && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>View</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.create && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Create</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.edit && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Edit</span>
                                  </label>
                                )}
                              </td>
                              <td className="py-2 px-4 text-center">
                                {row.delete && (
                                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 cursor-pointer" />
                                    <span>Delete</span>
                                  </label>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="px-5 py-2 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer shadow-xs transition-colors"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && profileToDelete && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setProfileToDelete(null);
          }}
          title="Confirm Delete Profile"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5">
              <Trash2 className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  Are you sure you want to delete profile <strong className="text-rose-950">&ldquo;{profileToDelete.name}&rdquo;</strong>?
                </p>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  This role definition will be removed from future user creation selections. Existing users will retain their current settings.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setProfileToDelete(null);
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                className="px-4 py-2 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer transition-colors"
              >
                Delete Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Users Assigned to Profile Modal */}
      {selectedProfileForUsers && (
        <Modal
          isOpen={Boolean(selectedProfileForUsers)}
          onClose={() => {
            setSelectedProfileForUsers(null);
            setModalUserSearch('');
          }}
          title={`Users Assigned to: ${selectedProfileForUsers.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-gradient-to-r from-blue-50/80 to-slate-50 p-3 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-[13px]">{selectedProfileForUsers.name}</h3>
                  <span className="text-[11px] text-slate-500">
                    {getProfileUsers(selectedProfileForUsers.name).length}{' '}
                    {getProfileUsers(selectedProfileForUsers.name).length === 1 ? 'user account' : 'user accounts'} connected
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedProfileForUsers(null);
                  router.push('/settings?tab=users');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <span>Users Directory</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {getProfileUsers(selectedProfileForUsers.name).length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter users in this profile..."
                  value={modalUserSearch}
                  onChange={(e) => setModalUserSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            )}

            {getProfileUsers(selectedProfileForUsers.name).length === 0 ? (
              <div className="py-10 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">No Users Assigned</p>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
                  There are currently no team members assigned to the &ldquo;{selectedProfileForUsers.name}&rdquo; profile.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedProfileForUsers(null);
                    router.push('/settings?tab=users');
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Create User with this Profile
                </button>
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-2xs">
                {getProfileUsers(selectedProfileForUsers.name)
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(modalUserSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(modalUserSearch.toLowerCase()) ||
                      (u.username || '').toLowerCase().includes(modalUserSearch.toLowerCase())
                  )
                  .map((u) => {
                    const specificType = u.managerType || u.employeeType || u.designation || u.profileType;
                    return (
                      <div
                        key={String(u.id)}
                        className="p-3.5 flex items-center justify-between hover:bg-blue-50/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {u.avatarImage || u.avatarUrl ? (
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-2xs">
                              <img
                                src={u.avatarImage || u.avatarUrl || ''}
                                alt={u.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`w-9 h-9 rounded-full ${u.avatarBg || 'bg-gradient-to-tr from-blue-600 to-indigo-600'} text-white font-bold flex items-center justify-center text-xs shadow-2xs shrink-0`}>
                              {u.name ? u.name.slice(0, 2).toUpperCase() : 'U'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-[13px]">{u.name}</span>
                              {specificType && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {specificType}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2.5 mt-0.5">
                              <span>{u.email || u.username}</span>
                              {u.phone && <span>• {u.phone}</span>}
                              {u.managerId && (
                                <span className="text-blue-600 font-semibold">
                                  • Reporting Mgr: {u.managerId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {u.status || 'Active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfileForUsers(null);
                              router.push(`/settings?tab=users&userId=${u.id}`);
                            }}
                            className="px-3 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-[11px] font-bold transition-colors cursor-pointer border border-slate-200"
                          >
                            View / Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setSelectedProfileForUsers(null);
                  setModalUserSearch('');
                }}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Profile Modal - Exact Cezcon CRM User Profile Permissions Layout */}
      {viewingProfile && (
        <Modal
          isOpen={!!viewingProfile}
          onClose={() => setViewingProfile(null)}
          title="User Profile Permissions"
          icon={<ShieldCheck className="w-5 h-5 text-blue-600" />}
          maxWidth="6xl"
        >
          <div className="space-y-4 text-xs text-slate-800">
            {/* Top Profile Summary Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-2xs">
                  {viewingProfile.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{viewingProfile.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-blue-800">
                      Profile View
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{viewingProfile.description || 'System Role Profile'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Sales:</span>
                  <span className={`font-bold ${viewingProfile.sales ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {viewingProfile.sales ? '✔ Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Project:</span>
                  <span className={`font-bold ${viewingProfile.project ? 'text-cyan-600' : 'text-slate-400'}`}>
                    {viewingProfile.project ? '✔ Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">Created:</span>
                  <span className="font-semibold text-slate-700">{formatProfileDate(viewingProfile.date)}</span>
                </div>
              </div>
            </div>

            {/* Permissions Matrix Tables */}
            <div className="space-y-6">
              {/* Table 1: Module Privileges */}
              <div className="space-y-1">
                <div className="bg-[#F1F5F9] py-1.5 px-4 text-center font-bold text-slate-700 border border-slate-200 rounded-t text-xs">
                  Module Privileges
                </div>
                <div className="overflow-x-auto border border-t-0 border-slate-200 rounded-b bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {/* Module Rows matching screenshot */}
                      {[
                        { name: 'Dashboard / Calendar', isHeader: false, view: true, create: true, edit: true, delete: true },
                        { name: 'Task', isHeader: false, view: true, create: true, edit: true, delete: true },
                        { name: 'Marketing', isHeader: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Campaign', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Lead', isHeader: false, view: true, create: true, edit: true, delete: true },
                        { name: 'Customer', isHeader: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Customer', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Contact', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Sales', isHeader: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Opportunity', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Quotation', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Order', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Proforma Invoice', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Invoice', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Receipt', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Delivery Note', indent: true, view: true, create: true, edit: true, delete: true },
                        { name: 'Purchase', isHeader: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Stock', indent: true, view: false, create: undefined, edit: true, delete: undefined },
                        { name: 'Purchase Order', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Purchase Invoice', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Purchase Payment', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Stock In', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Supplier', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Products', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Store', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Manufacturing', indent: true, view: false, create: false, edit: false, delete: false },
                      ].map((row, idx) => (
                        <tr key={idx} className={row.isHeader ? 'bg-slate-50/70 font-bold' : 'hover:bg-slate-50/40'}>
                          <td className={`py-2 px-4 w-72 text-slate-800 ${row.indent ? 'pl-8' : ''} ${row.isHeader ? 'font-bold text-slate-900' : 'font-medium'}`}>
                            {row.name}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.view !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.view ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.view ? 'text-slate-800' : 'text-slate-400'}>View</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.create !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.create ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.create ? 'text-slate-800' : 'text-slate-400'}>Create</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.edit !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.edit ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.edit ? 'text-slate-800' : 'text-slate-400'}>Edit</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.delete !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.delete ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.delete ? 'text-slate-800' : 'text-slate-400'}>Delete</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}

                      {/* Report Row with Header and Grid */}
                      <tr className="bg-slate-50/70 font-bold">
                        <td className="py-2 px-4 text-slate-900 font-bold">Report</td>
                        <td className="py-2 px-4 text-center">
                          <span className="inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                            <span className="text-slate-800">View</span>
                          </span>
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                      <tr>
                        <td colSpan={5} className="p-4 bg-white">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2 gap-x-4 text-xs">
                            {[
                              { name: 'Opportunity Closing', allowed: true },
                              { name: 'Sales', allowed: true },
                              { name: 'Campaign', allowed: true },
                              { name: 'Salesman', allowed: true },
                              { name: 'Aging Report', allowed: true },
                              { name: 'Customer Statement', allowed: true },
                              { name: 'Invoice And Receipt Report', allowed: true },
                              { name: 'Unbilled Order', allowed: true },
                              { name: 'Payment / Pending Order', allowed: true },
                              { name: 'Inventory', allowed: true },
                              { name: 'WhatsApp Number', allowed: true },
                              { name: 'Sale By Salesperson', allowed: true },
                              { name: 'Invoice By Customer', allowed: true },
                              { name: 'Delivery Note', allowed: true },
                              { name: 'Sales By Item', allowed: true },
                              { name: 'Inventory Valuation Summary', allowed: true },
                              { name: 'Purchase Invoice And Payment Report', allowed: true },
                              { name: 'VAT Return Report', allowed: true },
                              { name: 'Monthly Customer Report', allowed: true },
                              { name: 'Document Expiry', allowed: true },
                              { name: 'Billed Order', allowed: true },
                              { name: 'Purchase Order Report', allowed: true },
                              { name: 'Contacts', allowed: true },
                              { name: 'Leads', allowed: true },
                              { name: 'Customers', allowed: true },
                              { name: 'Task', allowed: true },
                              { name: 'Quotation', allowed: true },
                              { name: 'Salesman GP', allowed: true },
                              { name: 'Opportunity Closing', allowed: true },
                              { name: 'Opportunities', allowed: true },
                              { name: 'Opportunity Closed Lost', allowed: true },
                              { name: 'Supplier', allowed: false },
                              { name: 'Customer Outstanding', allowed: false },
                              { name: 'Product', allowed: false },
                              { name: 'Services', allowed: false },
                            ].map((rep, rIdx) => (
                              <div key={rIdx} className="flex items-center gap-1.5 py-0.5">
                                {rep.allowed ? (
                                  <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3] shrink-0" />
                                ) : (
                                  <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3] shrink-0" />
                                )}
                                <span className={rep.allowed ? 'text-slate-800' : 'text-slate-400'}>{rep.name}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {/* Settings Section Header and Sub-rows */}
                      {[
                        { name: 'Settings', isHeader: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Opportunity Settings', indent: true, view: false },
                        { name: 'Initial Settings', indent: true, view: false },
                        { name: 'Campaign Settings', indent: true, view: false },
                        { name: 'Order Settings', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Task Settings', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Business Opportunity', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Company Target', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Cost/Job Type', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Business Tags', indent: true, view: false, create: false, edit: false, delete: false },
                        { name: 'Products', indent: true, view: false, create: false, edit: false, delete: false },
                      ].map((row, sIdx) => (
                        <tr key={`set-${sIdx}`} className={row.isHeader ? 'bg-slate-50/70 font-bold' : 'hover:bg-slate-50/40'}>
                          <td className={`py-2 px-4 w-72 text-slate-800 ${row.indent ? 'pl-8' : ''} ${row.isHeader ? 'font-bold text-slate-900' : 'font-medium'}`}>
                            {row.name}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.view !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.view ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.view ? 'text-slate-800' : 'text-slate-400'}>View</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.create !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.create ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.create ? 'text-slate-800' : 'text-slate-400'}>Create</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.edit !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.edit ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.edit ? 'text-slate-800' : 'text-slate-400'}>Edit</span>
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            {row.delete !== undefined && (
                              <span className="inline-flex items-center gap-1">
                                {row.delete ? <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" /> : <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3]" />}
                                <span className={row.delete ? 'text-slate-800' : 'text-slate-400'}>Delete</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Table 2: Chart */}
              <div className="space-y-1">
                <div className="bg-[#F1F5F9] py-1.5 px-4 text-center font-bold text-slate-700 border border-slate-200 rounded-t text-xs">
                  Chart
                </div>
                <div className="p-4 border border-t-0 border-slate-200 rounded-b bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2.5 gap-x-4 text-xs">
                    {[
                      { name: 'Company Overview', allowed: true },
                      { name: 'User Overview', allowed: true },
                      { name: 'Company Sale', allowed: true },
                      { name: 'User Sale', allowed: true },
                      { name: 'Opportunity Closed Lost (Company)', allowed: true },
                      { name: 'Opportunity Closed Lost (User)', allowed: true },
                      { name: 'Company Opportunity Stages', allowed: true },
                      { name: 'User Opportunity Stages', allowed: true },
                      { name: 'Opportunity Closing This Month (Company)', allowed: true },
                      { name: 'Opportunity Closing This Month (User)', allowed: true },
                      { name: 'Opportunity This Month (Company)', allowed: true },
                      { name: 'Opportunity This Month (User)', allowed: true },
                      { name: 'Lead This Month (Company)', allowed: true },
                      { name: 'Lead This Month (User)', allowed: true },
                    ].map((chart, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-1.5 py-0.5">
                        {chart.allowed ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3] shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3] shrink-0" />
                        )}
                        <span className={chart.allowed ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                          {chart.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table 3: Additional Privileges */}
              <div className="space-y-1">
                <div className="bg-[#F1F5F9] py-1.5 px-4 text-center font-bold text-slate-700 border border-slate-200 rounded-t text-xs">
                  Additional Privileges
                </div>
                <div className="p-4 border border-t-0 border-slate-200 rounded-b bg-white">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-2.5 gap-x-4 text-xs">
                    {[
                      { name: 'Campaign Expense', allowed: true },
                      { name: 'Opportunity Closing Permission', allowed: true },
                      { name: 'Profit View', allowed: true },
                      { name: 'Report Export Privilege', allowed: true },
                      { name: 'Customer Overview Privilege', allowed: true },
                      { name: 'Customer Statement View Privilege', allowed: true },
                      { name: 'Purchase Rate', allowed: true },
                      { name: 'Sales Visit Settings', allowed: false },
                      { name: 'Sales Visit View', allowed: true },
                      { name: 'Sales Activity Summary', allowed: true, ownAll: true },
                      { name: 'Sales Performance', allowed: true, ownAll: true },
                      { name: 'Sales Insight & Forecast', allowed: true },
                      { name: 'Credit Limit', allowed: true },
                      { name: 'Stock Adjustment', allowed: false },
                      { name: 'Quotation Approval', allowed: true },
                      { name: 'Sales Cost', allowed: true },
                      { name: 'Cost Estimation', allowed: true },
                      { name: 'Manpower', allowed: true },
                      { name: 'Raw Materials', allowed: true },
                      { name: 'Order Cancellation', allowed: false },
                    ].map((priv, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-1.5 py-0.5 flex-wrap">
                        {priv.allowed ? (
                          <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3] shrink-0" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#DC2626] stroke-[3] shrink-0" />
                        )}
                        <span className={priv.allowed ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                          {priv.name}
                        </span>
                        {priv.ownAll && (
                          <span className="inline-flex items-center gap-2 ml-1 text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                            <span className="inline-flex items-center gap-0.5">
                              <Check className="w-3 h-3 text-[#16A34A] stroke-[3]" /> Own
                            </span>
                            <span className="inline-flex items-center gap-0.5">
                              <Check className="w-3 h-3 text-[#16A34A] stroke-[3]" /> All
                            </span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table 4: Activities */}
              <div className="space-y-1">
                <div className="bg-[#F1F5F9] py-1.5 px-4 text-center font-bold text-slate-700 border border-slate-200 rounded-t text-xs">
                  Activities
                </div>
                <div className="overflow-x-auto border border-t-0 border-slate-200 rounded-b bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {[
                        { name: 'Note', view: true, create: true, edit: true, delete: true },
                        { name: 'File', view: true, create: true, edit: true, delete: true },
                        { name: 'Order Expense', view: true, create: true, edit: true, delete: true },
                      ].map((act, aIdx) => (
                        <tr key={aIdx} className="hover:bg-slate-50/40">
                          <td className="py-2 px-4 w-72 text-slate-800 font-medium">{act.name}</td>
                          <td className="py-2 px-4 text-center w-28">
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                              <span className="text-slate-800">View</span>
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                              <span className="text-slate-800">Create</span>
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                              <span className="text-slate-800">Edit</span>
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center w-28">
                            <span className="inline-flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 text-[#16A34A] stroke-[3]" />
                              <span className="text-slate-800">Delete</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer Buttons matching screenshot */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingProfile(null)}
                className="px-4 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const p = viewingProfile;
                  setViewingProfile(null);
                  handleStartEdit(p);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded bg-[#002D4A] hover:bg-[#001E33] text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}


