'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CheckSquare,
  Radio,
  Megaphone,
  ListChecks,
  Shield,
  Hourglass,
  Package,
  FileText,
  Wrench,
  ChevronDown,
  Menu,
  X,
  Target,
  UserCheck,
  Calendar,
  Briefcase,
  Bell,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';
import { ENTERPRISE_NAV_ITEMS, MANAGER_NAV_ITEMS, EnterpriseNavItem } from '@/config/enterprise-navigation';
import { NavDropdown } from '@/components/layout/NavDropdown';
import { authMockService } from '@/services/authMockService';
import { cn } from '@/lib/utils';

const HEADER_ICONS: Record<string, (isActive: boolean) => React.ReactNode> = {
  Home: (active) => <Home className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  CheckSquare: (active) => <CheckSquare className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Radio: (active) => <Radio className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Megaphone: (active) => <Megaphone className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  ListChecks: (active) => <ListChecks className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Shield: (active) => <Shield className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Hourglass: (active) => <Hourglass className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Package: (active) => <Package className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  FileText: (active) => <FileText className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Wrench: (active) => <Wrench className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Target: (active) => <Target className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  UserCheck: (active) => <UserCheck className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Calendar: (active) => <Calendar className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Briefcase: (active) => <Briefcase className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Bell: (active) => <Bell className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  DollarSign: (active) => <DollarSign className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  Users: (active) => <Users className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
  BarChart3: (active) => <BarChart3 className={cn('w-3.5 h-3.5 flex-shrink-0', active ? 'text-white' : 'text-[#2563EB]')} />,
};

const WORKER_NAV_ITEMS: EnterpriseNavItem[] = [
  {
    id: 'employee-dashboard',
    label: 'Dashboard',
    path: '/worker/dashboard',
    iconName: 'Home',
  },
  {
    id: 'employee-tasks',
    label: 'My Tasks',
    path: '/worker/tasks',
    iconName: 'CheckSquare',
    children: [
      { label: "Today's Schedule", href: '/worker/tasks', iconName: 'CheckSquare' },
      { label: 'Live Job Pad', href: '/worker/tasks/active', iconName: 'Hourglass' },
      { label: 'Pending Acceptance', href: '/worker/tasks?status=Pending', iconName: 'Hourglass' },
      { label: 'Completed History', href: '/worker/tasks?status=Completed', iconName: 'FileText' },
    ],
  },
  {
    id: 'employee-leads',
    label: 'My Leads',
    path: '/worker/leads',
    iconName: 'Target',
  },
  {
    id: 'employee-customers',
    label: 'My Customers',
    path: '/worker/customers',
    iconName: 'UserCheck',
  },
  {
    id: 'employee-activities',
    label: 'My Activities',
    path: '/worker/activities',
    iconName: 'ListChecks',
  },
  {
    id: 'employee-deals',
    label: 'My Deals',
    path: '/worker/deals',
    iconName: 'Briefcase',
  },
  {
    id: 'employee-calendar',
    label: 'Calendar',
    path: '/worker/calendar',
    iconName: 'Calendar',
  },
  {
    id: 'employee-materials',
    label: 'Materials',
    path: '/worker/materials',
    iconName: 'Package',
    children: [
      { label: 'My Requisitions', href: '/worker/materials', iconName: 'Package' },
      { label: '+ New Requisition', href: '/worker/materials?action=new', iconName: 'Package' },
    ],
  },
  {
    id: 'employee-timesheet',
    label: 'Timesheet',
    path: '/worker/timesheet',
    iconName: 'Hourglass',
  },
  {
    id: 'employee-reports',
    label: 'Reports',
    path: '/worker/reports',
    iconName: 'FileText',
  },
  {
    id: 'employee-profile',
    label: 'Profile',
    path: '/worker/profile',
    iconName: 'Shield',
  },
];

export function EnterpriseNavbar() {
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = authMockService.getCurrentUser();
    if (user?.role) {
      setUserRole(user.role.toLowerCase());
    }
  }, []);

  const isWorkerPath = pathname.startsWith('/worker');
  const isManagerPath = pathname.startsWith('/manager');

  const activeNavItems = isWorkerPath || userRole === 'employee' || userRole === 'worker'
    ? WORKER_NAV_ITEMS
    : isManagerPath || userRole === 'manager'
      ? MANAGER_NAV_ITEMS
      : ENTERPRISE_NAV_ITEMS;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleMenuClick = (itemId: string, hasChildren: boolean, path?: string) => {
    if (!hasChildren) {
      setActiveMenu(null);
      return;
    }
    setActiveMenu((prev) => (prev === itemId ? null : itemId));
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, hasChildren: boolean) => {
    if (e.key === 'Enter' || e.key === ' ') {
      if (hasChildren) {
        e.preventDefault();
        handleMenuClick(itemId, hasChildren);
      }
    } else if (e.key === 'Escape') {
      setActiveMenu(null);
    }
  };

  return (
    <nav
      ref={navContainerRef}
      className="bg-white border-b border-slate-200 px-3 sm:px-6 shadow-2xs sticky top-0 z-[1000] relative"
    >
      <div className="flex items-center justify-between h-10">
        {/* Desktop Horizontal Menu */}
        <div className="hidden md:flex items-center h-10 overflow-visible">
          {activeNavItems.map((item) => {
            const hasChildren = !!(item.children && item.children.length > 0);
            const isMenuOpen = activeMenu === item.id;
            const isRouteActive =
              item.path === pathname ||
              (item.id !== 'dashboard' && pathname.startsWith(`/${item.id}`));
            const isHighlighted = isRouteActive || isMenuOpen;

            // Direct link for Dashboard / Report / Leads / Tasks
            if (!hasChildren && item.path) {
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  className={cn(
                    'h-10 flex items-center gap-1.5 px-3 text-xs font-bold transition-all select-none',
                    isRouteActive
                      ? 'bg-[#002B49] text-white'
                      : 'text-slate-800 hover:bg-slate-100/80 hover:text-[#2563EB]'
                  )}
                >
                  <span>{HEADER_ICONS[item.iconName]?.(isRouteActive)}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold leading-none shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            // Dropdown items
            return (
              <div key={item.id} className="relative h-10 flex items-center">
                <button
                  type="button"
                  onClick={() => handleMenuClick(item.id, hasChildren)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, hasChildren)}
                  aria-expanded={isMenuOpen}
                  className={cn(
                    'h-10 flex items-center gap-1.5 px-3 text-xs font-bold cursor-pointer transition-all select-none focus:outline-none',
                    isHighlighted
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : 'text-slate-800 hover:bg-slate-100/80 hover:text-[#2563EB]'
                  )}
                >
                  <span>{HEADER_ICONS[item.iconName]?.(isHighlighted)}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold leading-none shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 transition-transform duration-150',
                      isHighlighted ? 'text-white' : 'text-[#2563EB]',
                      isMenuOpen ? 'rotate-180' : ''
                    )}
                  />
                </button>

                {/* Dropdown Menu Container */}
                {hasChildren && item.children && (
                  <NavDropdown
                    items={item.children}
                    isOpen={isMenuOpen}
                    onClose={() => setActiveMenu(null)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex md:hidden items-center justify-between w-full py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {activeNavItems.find(
                (i) => i.path === pathname || (i.id !== 'dashboard' && pathname.startsWith(`/${i.id}`))
              )?.label || 'Navigation'}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-medium cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] md:hidden animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Container */}
          <div className="fixed right-0 top-0 bottom-0 w-[300px] max-w-[85vw] bg-white shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="bg-[#002B49] text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase">Menu Navigation</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/50">
              {activeNavItems.map((item) => {
                const hasChildren = !!(item.children && item.children.length > 0);
                const isMenuOpen = activeMenu === item.id;
                const isRouteActive =
                  item.path === pathname ||
                  (item.id !== 'dashboard' && pathname.startsWith(`/${item.id}`));

                if (!hasChildren && item.path) {
                  return (
                    <Link
                      key={item.id}
                      href={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors',
                        isRouteActive
                          ? 'bg-[#002B49] text-white shadow-xs'
                          : 'text-slate-800 hover:bg-blue-50 hover:text-blue-600 bg-white border border-slate-200/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {HEADER_ICONS[item.iconName]?.(isRouteActive)}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold shadow-2xs">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                }

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setActiveMenu((prev) => (prev === item.id ? null : item.id))}
                      className={cn(
                        'w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                        isRouteActive
                          ? 'bg-[#002B49] text-white shadow-xs'
                          : 'text-slate-800 hover:bg-blue-50 hover:text-blue-600 bg-white border border-slate-200/60'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {HEADER_ICONS[item.iconName]?.(isRouteActive)}
                        <span>{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-3.5 h-3.5 transition-transform duration-150',
                          isRouteActive ? 'text-white' : 'text-blue-600',
                          isMenuOpen ? 'rotate-180' : ''
                        )}
                      />
                    </button>

                    {isMenuOpen && item.children && (
                      <div className="pl-3 pr-2 py-1.5 space-y-1 bg-white rounded-md border border-slate-200 shadow-2xs my-1">
                        {item.children.map((sub, idx) => (
                          <div key={idx} className="space-y-0.5">
                            {sub.children && sub.children.length > 0 ? (
                              <>
                                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  {sub.label}
                                </div>
                                <div className="pl-2 space-y-0.5 border-l-2 border-blue-300">
                                  {sub.children.map((nestedSub, nestedIdx) => (
                                    <Link
                                      key={nestedIdx}
                                      href={nestedSub.href || '#'}
                                      onClick={() => {
                                        setActiveMenu(null);
                                        setMobileMenuOpen(false);
                                      }}
                                      className="block px-2 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded font-medium"
                                    >
                                      {nestedSub.label}
                                    </Link>
                                  ))}
                                </div>
                              </>
                            ) : (
                              <Link
                                href={sub.href || '#'}
                                onClick={() => {
                                  setActiveMenu(null);
                                  setMobileMenuOpen(false);
                                }}
                                className="block px-2.5 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded font-medium"
                              >
                                {sub.label}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

