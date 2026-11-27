'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  ShieldCheck,
  Target,
  UserCheck,
  Megaphone,
  Briefcase,
  Package,
  CheckSquare,
  Calendar,
  BarChart3,
  Bell,
  FileText,
  Sliders,
  Lock,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { SUPER_ADMIN_NAVIGATION } from '@/config/navigation';
import { cn } from '@/lib/utils';
import { useSuperAdmin } from '@/context/SuperAdminContext';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  UserCheck: <UserCheck className="w-4 h-4" />,
  Megaphone: <Megaphone className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  Package: <Package className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  FileText: <FileText className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
  Lock: <Lock className="w-4 h-4" />,
};

export interface SuperAdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function SuperAdminSidebar({ mobileOpen, onCloseMobile }: SuperAdminSidebarProps = {}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Organizations: true,
    Users: false,
  });

  const { notifications } = useSuperAdmin();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/40">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight">CRM PLATFORM</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                Super Admin
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {SUPER_ADMIN_NAVIGATION.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !collapsed && (
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-2">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems[item.title];
                const badgeValue = item.title === 'Notifications' ? unreadNotifs : item.badge;

                return (
                  <div key={item.title}>
                    <div
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      )}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 flex-1 overflow-hidden"
                        title={collapsed ? item.title : undefined}
                      >
                        <span
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        >
                          {ICON_MAP[item.iconName] || <LayoutDashboard className="w-4 h-4" />}
                        </span>
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </Link>

                      {!collapsed && badgeValue && Number(badgeValue) > 0 ? (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white',
                            item.badgeColor || 'bg-indigo-600'
                          )}
                        >
                          {badgeValue}
                        </span>
                      ) : null}

                      {!collapsed && hasSubItems && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(item.title);
                          }}
                          className="p-1 text-slate-300 hover:text-slate-100"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Submenu */}
                    {!collapsed && hasSubItems && isExpanded && (
                      <div className="ml-7 pl-2 my-1 space-y-0.5 border-l border-slate-800">
                        {item.subItems?.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              className={cn(
                                'block px-2.5 py-1.5 text-[11px] rounded-lg transition-colors',
                                isSubActive
                                  ? 'text-indigo-400 font-semibold bg-indigo-950/40'
                                  : 'text-slate-300 hover:text-slate-200 hover:bg-slate-800/40'
                              )}
                            >
                              {sub.title}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">Platform Root</p>
              <p className="text-[10px] text-slate-300 truncate">superadmin@crm.io</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
