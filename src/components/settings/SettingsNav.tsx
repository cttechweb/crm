'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  Users,
  ShieldCheck,
  Lock,
  Database,
  Sliders,
  Tag,
  Key,
  Megaphone,
  ShoppingCart,
  CheckSquare,
  Briefcase,
  Target,
  DollarSign,
  Box,
  Contact,
  BarChart3,
  Search,
  SlidersHorizontal,
  Wrench,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SettingsNavCategory {
  group: string;
  items: {
    id: string;
    label: string;
    path: string;
    icon: any;
    description: string;
    badge?: string;
  }[];
}

export const SETTINGS_NAV_CATEGORIES: SettingsNavCategory[] = [
  {
    group: 'User & Access Management',
    items: [
      { id: 'users', label: 'Users Directory', path: '/settings/users', icon: Users, description: 'Manage employee and admin accounts' },
      { id: 'profile', label: 'User Profiles & Roles', path: '/settings/profile', icon: Contact, description: 'Role definitions and access policies' },
      { id: 'user-target', label: 'User Targets', path: '/settings/user-target', icon: BarChart3, description: 'Individual sales targets and quotas' },
      { id: 'roles', label: 'Roles & Permissions', path: '/settings/roles', icon: ShieldCheck, description: 'RBAC and privilege matrix' },
    ],
  },
  {
    group: 'Sales & Pipeline Config',
    items: [
      { id: 'opportunity-stages', label: 'Opportunity Stages', path: '/settings/opportunity-stages', icon: Key, description: 'Pipeline stage stages & workflow' },
      { id: 'opportunity-lost-reason', label: 'Lost Reasons', path: '/settings/opportunity-lost-reason', icon: SlidersHorizontal, description: 'Lost deal tracking reasons' },
      { id: 'opportunity', label: 'Business Opportunity', path: '/settings/opportunity', icon: Briefcase, description: 'Scope and categories of works' },
      { id: 'target', label: 'Company Targets', path: '/settings/targets', icon: Target, description: 'Annual and quarterly business targets' },
    ],
  },
  {
    group: 'Operations & Workflow',
    items: [
      { id: 'initial', label: 'Initial Settings', path: '/settings/initial', icon: Sliders, description: 'Industry, source, print & field setups' },
      { id: 'campaign', label: 'Campaign Settings', path: '/settings/campaigns', icon: Megaphone, description: 'Marketing channels and budgets' },
      { id: 'order', label: 'Order Settings', path: '/settings/orders', icon: ShoppingCart, description: 'Order statuses, types and AMC' },
      { id: 'task', label: 'Task Settings', path: '/settings/tasks', icon: CheckSquare, description: 'Task types and standard templates' },
      { id: 'cost-job', label: 'Cost / Job Type', path: '/settings/cost-job', icon: DollarSign, description: 'Hourly billing and job costing' },
      { id: 'tags', label: 'Business Tags', path: '/settings/tags', icon: Tag, description: 'Categorization and service tags' },
      { id: 'products', label: 'Products Master', path: '/settings/products', icon: Box, description: 'Product catalog & categories' },
    ],
  },
  {
    group: 'System & Security',
    items: [
      { id: 'system', label: 'System Settings', path: '/settings/system', icon: Wrench, description: 'Company info, branding and locale' },
      { id: 'security', label: 'Security & Auth', path: '/settings/security', icon: Lock, description: 'Password policy, sessions & MFA' },
      { id: 'backup', label: 'Backup & Data', path: '/settings/backup', icon: Database, description: 'Data export, audit and restore' },
    ],
  },
];

export function SettingsNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get('tab');
  const [filterQuery, setFilterQuery] = useState('');

  const isItemActive = (path: string, id: string) => {
    if (pathname === path) return true;
    if (pathname === '/settings' && tabParam === id) return true;
    if (id === 'users' && (pathname === '/settings/users' || (pathname === '/settings' && !tabParam))) return true;
    if (id === 'roles' && (pathname === '/settings/roles' || pathname === '/settings/rbac' || tabParam === 'rbac')) return true;
    if (id === 'campaign' && (pathname === '/settings/campaigns' || pathname === '/settings/campaign' || tabParam === 'campaign')) return true;
    if (id === 'order' && (pathname === '/settings/orders' || pathname === '/settings/order' || tabParam === 'order')) return true;
    if (id === 'task' && (pathname === '/settings/tasks' || pathname === '/settings/task' || tabParam === 'task')) return true;
    if (id === 'target' && (pathname === '/settings/targets' || pathname === '/settings/target' || tabParam === 'target')) return true;
    if (id === 'opportunity-stages' && (pathname === '/settings/opportunity-stages' || pathname === '/settings/opportunity-settings' || tabParam === 'opportunity-settings')) return true;
    return false;
  };

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm h-fit">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-blue-600" />
          Settings Modules
        </h2>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select a dedicated module to manage
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter settings..."
          value={filterQuery}
          onChange={(e) => setFilterQuery(e.target.value)}
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-slate-200"
        />
      </div>

      <div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {SETTINGS_NAV_CATEGORIES.map((category) => {
          const filteredItems = category.items.filter(
            (item) =>
              item.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
              item.description.toLowerCase().includes(filterQuery.toLowerCase())
          );

          if (filteredItems.length === 0) return null;

          return (
            <div key={category.group} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
                {category.group}
              </div>
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path, item.id);
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      className={cn(
                        'flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group',
                        active
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/50 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            'p-1.5 rounded-md flex-shrink-0',
                            active
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-700'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="truncate font-medium">{item.label}</div>
                      </div>
                      <ChevronRight
                        className={cn(
                          'w-3.5 h-3.5 flex-shrink-0 transition-transform',
                          active
                            ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                            : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
                        )}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
