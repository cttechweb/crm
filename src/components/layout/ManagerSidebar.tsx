'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Target,
  Briefcase,
  CheckSquare,
  PhoneCall,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Bell,
  Sliders,
  ChevronDown,
  ChevronRight,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
  ShieldAlert,
} from 'lucide-react';
import { MANAGER_NAVIGATION } from '@/config/manager-navigation';
import { cn } from '@/lib/utils';
import { authMockService } from '@/services/authMockService';

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  Briefcase: <Briefcase className="w-4 h-4" />,
  CheckSquare: <CheckSquare className="w-4 h-4" />,
  PhoneCall: <PhoneCall className="w-4 h-4" />,
  Calendar: <Calendar className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  TrendingUp: <TrendingUp className="w-4 h-4" />,
  BarChart3: <BarChart3 className="w-4 h-4" />,
  Bell: <Bell className="w-4 h-4" />,
  Sliders: <Sliders className="w-4 h-4" />,
};

export function ManagerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    Tasks: true,
    'Team Management': true,
    Sales: false,
    Leads: false,
  });

  const currentUser = authMockService.getCurrentUser() || {
    name: 'Alex Rivera',
    designation: 'Operations Manager',
    email: 'manager@cooltechuae.com',
  };

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
        <Link href="/manager/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-tight">COOL TECH CRM</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">
                Operations Manager
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
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
        {MANAGER_NAVIGATION.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && !collapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== '/manager/dashboard' && pathname.startsWith(item.href));
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isExpanded = expandedItems[item.title];

                return (
                  <div key={item.id}>
                    <div
                      className={cn(
                        'group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all duration-150',
                        isActive
                          ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold'
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
                            isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                          )}
                        >
                          {ICON_MAP[item.iconName] || <LayoutDashboard className="w-4 h-4" />}
                        </span>
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </Link>

                      {!collapsed && item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white',
                            item.badgeColor || 'bg-blue-600'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {!collapsed && hasSubItems && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            toggleExpand(item.title);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-100"
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
                                  ? 'text-blue-400 font-semibold bg-blue-950/40'
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-blue-500/30 flex-shrink-0 shadow-md">
            {currentUser.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-blue-400 truncate">{currentUser.designation || 'Operations Manager'}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
