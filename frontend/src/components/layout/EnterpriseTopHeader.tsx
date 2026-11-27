'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  Plus,
  ChevronDown,
  LogOut,
  FileText,
  ShoppingBag,
  Truck,
  Lock,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { useEnterpriseCrm } from '@/context/EnterpriseCrmContext';
import { UserRole } from '@/types/enterprise-crm';
import { authMockService, MockAuthUser } from '@/services/authMockService';
import { useCrmNotifications } from '@/services/notificationService';

import { EnterpriseNavbar } from '@/components/layout/EnterpriseNavbar';

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return 'Just now';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    // If created within the last 3 minutes or negative due to minor clock offset, display "Just now"
    if (diffSeconds < 180) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Just now';
  }
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case 'msrf':
      return <FileText className="w-3.5 h-3.5 text-blue-600" />;
    case 'stock_available':
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    case 'shortage':
      return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
    case 'po':
      return <ShoppingBag className="w-3.5 h-3.5 text-purple-600" />;
    case 'grn':
      return <Truck className="w-3.5 h-3.5 text-emerald-600" />;
    case 'closure':
      return <Lock className="w-3.5 h-3.5 text-slate-600" />;
    case 'chat':
      return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
    default:
      return <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />;
  }
}

export function EnterpriseTopHeader() {
  const router = useRouter();
  const { currentRole, setCurrentRole, globalSearch, setGlobalSearch } = useEnterpriseCrm();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUser, setCurrentUser] = useState<MockAuthUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useCrmNotifications(currentUser);

  React.useEffect(() => {
    setAvatarError(false);
  }, [currentUser?.avatar, (currentUser as any)?.avatarImage]);

  React.useEffect(() => {
    const syncUser = () => {
      const user = authMockService.getCurrentUser();
      if (user) {
        if (!user.avatar) {
          try {
            const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
            if (storedUsersRaw) {
              const list = JSON.parse(storedUsersRaw);
              const matched = list.find((u: any) =>
                (u.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
                (u.id && (u.id === user.id || `usr_${u.id}` === user.id))
              );
              if (matched?.avatarImage || matched?.avatar) {
                user.avatar = matched.avatarImage || matched.avatar;
              }
            }
          } catch {}
        }
        setCurrentUser(user);
      }
    };

    syncUser();

    const unsubscribe = authMockService.onAuthStateChanged((user) => {
      if (user) {
        if (!user.avatar) {
          try {
            const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
            if (storedUsersRaw) {
              const list = JSON.parse(storedUsersRaw);
              const matched = list.find((u: any) =>
                (u.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
                (u.id && (u.id === user.id || `usr_${u.id}` === user.id))
              );
              if (matched?.avatarImage || matched?.avatar) {
                user.avatar = matched.avatarImage || matched.avatar;
              }
            }
          } catch {}
        }
        setCurrentUser(user);
      }
    });

    window.addEventListener('storage', syncUser);
    window.addEventListener('crm_auth_updated', syncUser);

    return () => {
      unsubscribe();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
    };
  }, []);

  const roles: UserRole[] = ['Super Admin', 'Admin', 'Manager', 'Employee'];

  const getDisplayRole = (role?: string, user?: MockAuthUser | null) => {
    if (user?.position) return user.position;

    if (!role) return 'COO';
    const r = role.toLowerCase();

    if (r === 'super_admin' || r.includes('super')) return 'CEO';
    if (r === 'admin') return 'COO';

    if (r === 'manager' || r.includes('manager')) {
      const specific =
        user?.managerType ||
        user?.designation ||
        user?.department ||
        '';
      const s = specific.toLowerCase();
      if (s.includes('sales')) return 'CSO';
      if (s.includes('purchase')) return 'CPO';
      if (specific && s !== 'manager') return specific;
      return 'CSO';
    }

    if (r === 'employee' || r === 'worker') {
      const specific =
        user?.employeeType ||
        user?.designation ||
        user?.department ||
        '';
      const s = specific.toLowerCase();
      if (s.includes('purchase')) return 'Purchase Employee';
      if (specific && s !== 'employee' && s !== 'sales employee') {
        return specific;
      }
      return 'Sales Executive';
    }

    return 'COO';
  };

  const isEmployeeUser = currentUser?.role === 'employee' || currentUser?.role === 'worker' || currentRole === 'Employee' || currentRole === 'Worker';
  const homeHref = isEmployeeUser
    ? '/worker/dashboard'
    : currentUser?.role === 'manager'
      ? '/manager/dashboard'
      : '/dashboard';

  return (
    <>
      <header className="w-full flex flex-col z-50 fixed top-0 left-0 right-0 bg-white shadow-xs">
        {/* ROW 1: Top Brand & Utility Header */}
        <div className="bg-white border-b border-[#E2E8F0] px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between text-slate-800 z-50 relative w-full gap-3 sm:gap-4">
          {/* Brand Logo — icon + text */}
          <div className="flex items-center min-w-0 flex-shrink-0">
            <Link href={homeHref} className="flex items-center gap-2.5 group select-none">
              {/* Cool Technologies C-wave SVG icon */}
              <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white border border-slate-200 shadow-xs flex items-center justify-center overflow-hidden group-hover:shadow-md transition-shadow">
                <svg viewBox="0 0 80 80" className="w-7 h-7 sm:w-8 sm:h-8" xmlns="http://www.w3.org/2000/svg">
                  {/* Top blue arcs */}
                  <path d="M58 12 A32 32 0 0 0 18 40" fill="none" stroke="#00AEEF" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M53 19 A24 24 0 0 0 22 40" fill="none" stroke="#00AEEF" strokeWidth="5" strokeLinecap="round" />
                  <path d="M48 26 A16 16 0 0 0 26 40" fill="none" stroke="#00AEEF" strokeWidth="4.5" strokeLinecap="round" />
                  {/* Bottom navy arcs */}
                  <path d="M18 40 A32 32 0 0 0 58 68" fill="none" stroke="#3D405B" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M22 40 A24 24 0 0 0 53 61" fill="none" stroke="#3D405B" strokeWidth="5" strokeLinecap="round" />
                  <path d="M26 40 A16 16 0 0 0 48 54" fill="none" stroke="#3D405B" strokeWidth="4.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Text block: COOL TECHNOLOGIES + CRM */}
              <div className="flex flex-col leading-none gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] sm:text-[14px] font-bold text-[#3D405B] tracking-wider uppercase leading-none whitespace-nowrap">
                    COOL TECHNOLOGIES
                  </span>
                  <span className="text-[15px] sm:text-[19px] font-black text-[#2563EB] tracking-tight leading-none flex-shrink-0">
                    CRM
                  </span>
                </div>
                <span className="text-[8px] sm:text-[9px] text-slate-400 font-semibold tracking-widest uppercase leading-none hidden sm:block">
                  the science of cooling
                </span>
              </div>
            </Link>
          </div>

          {/* Right Actions & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Search Box matching reference: [ ⓘ Search customer, contact & lead... | 🔍 ] */}
            <div className="relative hidden md:flex items-center w-60 lg:w-80">
              <div className="relative w-full flex items-center">
                <span className="absolute left-2.5 text-slate-400 text-xs select-none">ⓘ</span>
                <input
                  type="text"
                  placeholder="Search customer, contact & lead..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-300 rounded-l-md pl-7 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all h-8"
                />
                <button
                  type="button"
                  className="bg-[#002B49] hover:bg-[#2563EB] text-white px-2.5 h-8 rounded-r-md flex items-center justify-center transition-colors cursor-pointer"
                  title="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Add Button */}
            <div className="relative">
              <button
                onClick={() => setShowQuickAdd(!showQuickAdd)}
                className="p-1.5 sm:p-2 rounded-md text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                title="Quick Action"
              >
                <Plus className="w-4 h-4 text-[#2563EB]" />
              </button>

              {showQuickAdd && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowQuickAdd(false)} />
                  <div className="absolute right-0 mt-1.5 w-44 sm:w-48 bg-white border border-[#E2E8F0] rounded-md shadow-lg z-50 p-1.5 space-y-0.5 animate-in fade-in duration-150">
                    <Link
                      href="/leads?action=add"
                      onClick={() => setShowQuickAdd(false)}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-md transition-colors"
                    >
                      + Add New Lead
                    </Link>
                    <Link
                      href="/tasks?action=add"
                      onClick={() => setShowQuickAdd(false)}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-md transition-colors"
                    >
                      + Create New Task
                    </Link>
                    <Link
                      href="/customers?action=add"
                      onClick={() => setShowQuickAdd(false)}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-md transition-colors"
                    >
                      + Register Customer
                    </Link>
                    <Link
                      href="/sales?action=add"
                      onClick={() => setShowQuickAdd(false)}
                      className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2563EB] rounded-md transition-colors"
                    >
                      + Create Opportunity
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Notifications Icon */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 rounded-md text-slate-600 hover:text-[#2563EB] hover:bg-blue-50 transition-colors cursor-pointer"
                title="Notifications"
                aria-label="System Notifications"
              >
                <Bell className="w-4 h-4 text-[#2563EB]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#DC2626] text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in-50">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-1.5 w-80 sm:w-96 bg-white border border-[#E2E8F0] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                    <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead()}
                          className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="py-8 px-4 text-center text-slate-400">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                          <p className="text-xs font-semibold text-slate-600">No Notifications</p>
                          <p className="text-[11px] text-slate-400">All workflow requests are up to date</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              if (n.linkUrl) {
                                setShowNotifications(false);
                                router.push(n.linkUrl);
                              }
                            }}
                            className={`p-3 text-left transition-colors flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 ${
                              !n.isRead ? 'bg-blue-50/50' : 'bg-white'
                            }`}
                          >
                            <div className="mt-0.5 p-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs flex-shrink-0">
                              {getNotificationIcon(n.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                  {n.title}
                                </p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                                {n.message}
                              </p>
                              <div className="mt-1 flex items-center justify-between text-[10px]">
                                {formatRelativeTime(n.createdAt) === 'Just now' ? (
                                  <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1 border border-emerald-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Just now
                                  </span>
                                ) : (
                                  <span className="text-slate-400">{formatRelativeTime(n.createdAt)}</span>
                                )}
                                {n.linkUrl && (
                                  <span className="text-[#2563EB] font-semibold flex items-center gap-0.5">
                                    View &rarr;
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Profile & Logout Dropdown */}
            <div className="relative pl-2 border-l border-[#E2E8F0]">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2 p-1 rounded-md hover:bg-blue-50 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                  {(!avatarError && (currentUser?.avatar || (currentUser as any)?.avatarImage)) ? (
                    <img
                      src={currentUser?.avatar || (currentUser as any)?.avatarImage}
                      alt={currentUser?.name || 'User'}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    <span>
                      {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">
                    {currentUser?.name || 'Cool Admin'}
                  </span>
                  <span className="text-[10px] text-[#2563EB] font-bold leading-tight capitalize">
                    {getDisplayRole(currentUser?.role, currentUser)}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowRoleDropdown(false)} />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E2E8F0] rounded-md shadow-xl z-50 p-2 space-y-1 animate-in fade-in duration-150">
                    <div className="px-3 py-2 border-b border-slate-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
                        {(!avatarError && (currentUser?.avatar || (currentUser as any)?.avatarImage)) ? (
                          <img
                            src={currentUser?.avatar || (currentUser as any)?.avatarImage}
                            alt={currentUser?.name || 'User'}
                            className="w-full h-full object-cover"
                            onError={() => setAvatarError(true)}
                          />
                        ) : (
                          <span>
                            {currentUser?.name ? currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'AD'}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{currentUser?.name || 'Cool Admin'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email || 'cooladmin@gmail.com'}</p>
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                          {getDisplayRole(currentUser?.role, currentUser)}
                        </span>
                      </div>
                    </div>

                    {isEmployeeUser && (
                      <div className="pt-1 space-y-0.5">
                        <Link
                          href="/worker/dashboard"
                          onClick={() => setShowRoleDropdown(false)}
                          className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors font-medium"
                        >
                          Employee Dashboard
                        </Link>
                        <Link
                          href="/worker/profile"
                          onClick={() => setShowRoleDropdown(false)}
                          className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors font-medium"
                        >
                          Employee Profile & Van
                        </Link>
                        <Link
                          href="/worker/tasks"
                          onClick={() => setShowRoleDropdown(false)}
                          className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-md transition-colors font-medium"
                        >
                          My Tasks
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setShowRoleDropdown(false);
                          await authMockService.logout();
                          window.location.href = '/login';
                        }}
                        className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-semibold cursor-pointer"
                      >
                        <span>Sign Out</span>
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ROW 2: Horizontal Dedicated Enterprise Navigation Bar Strip */}
        <div className="bg-white border-b border-[#E2E8F0] px-2 sm:px-6 lg:px-8 h-10 flex items-center z-40 relative w-full overflow-visible shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <EnterpriseNavbar />
        </div>
      </header>
      {/* Layout Spacer so page content below fixed top header starts cleanly without being obscured */}
      <div className="h-[92px] sm:h-[96px] w-full flex-shrink-0 pointer-events-none select-none" aria-hidden="true" />
    </>
  );
}
