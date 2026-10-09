'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
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
  Key,
  ThumbsUp,
  CreditCard,
  FileSpreadsheet,
  Receipt,
  Table,
  Contact,
  Boxes,
  FilePlus,
  FileCheck,
  Truck,
  Tag,
  Store,
  Factory,
  Sliders,
  Languages,
  Printer,
  Flag,
  ShoppingCart,
  Clock,
  Activity,
  Globe,
  Upload,
  ArrowDownToLine,
} from 'lucide-react';
import { ENTERPRISE_NAV_ITEMS, MANAGER_NAV_ITEMS, EnterpriseNavItem } from '@/config/enterprise-navigation';
import { NavDropdown } from '@/components/layout/NavDropdown';
import { authMockService } from '@/services/authMockService';
import { cn } from '@/lib/utils';

const renderHeaderIcon = (name?: string, active: boolean = false) => {
  const cls = cn('w-3.5 h-3.5 flex-shrink-0 transition-colors', active ? 'text-white' : 'text-[#2563EB]');

  switch (name) {
    case 'Home': return <Home className={cls} />;
    case 'CheckSquare': return <CheckSquare className={cls} />;
    case 'Radio': return <Radio className={cls} />;
    case 'Megaphone': return <Megaphone className={cls} />;
    case 'ListChecks': return <ListChecks className={cls} />;
    case 'Shield': return <Shield className={cls} />;
    case 'Hourglass': return <Hourglass className={cls} />;
    case 'Key': return <Key className={cls} />;
    case 'ThumbsUp': return <ThumbsUp className={cls} />;
    case 'CreditCard': return <CreditCard className={cls} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={cls} />;
    case 'Receipt': return <Receipt className={cls} />;
    case 'Table': return <Table className={cls} />;
    case 'Contact': return <Contact className={cls} />;
    case 'Package': return <Package className={cls} />;
    case 'FileText': return <FileText className={cls} />;
    case 'Wrench': return <Wrench className={cls} />;
    case 'Target': return <Target className={cls} />;
    case 'UserCheck': return <UserCheck className={cls} />;
    case 'Calendar': return <Calendar className={cls} />;
    case 'Briefcase': return <Briefcase className={cls} />;
    case 'Bell': return <Bell className={cls} />;
    case 'DollarSign': return <DollarSign className={cls} />;
    case 'Users': return <Users className={cls} />;
    case 'BarChart3': return <BarChart3 className={cls} />;
    case 'Boxes': return <Boxes className={cls} />;
    case 'FilePlus': return <FilePlus className={cls} />;
    case 'FileCheck': return <FileCheck className={cls} />;
    case 'Truck': return <Truck className={cls} />;
    case 'Tag': return <Tag className={cls} />;
    case 'Store': return <Store className={cls} />;
    case 'Factory': return <Factory className={cls} />;
    case 'Sliders': return <Sliders className={cls} />;
    case 'Languages': return <Languages className={cls} />;
    case 'Printer': return <Printer className={cls} />;
    case 'Flag': return <Flag className={cls} />;
    case 'ShoppingCart': return <ShoppingCart className={cls} />;
    case 'Clock': return <Clock className={cls} />;
    case 'Activity': return <Activity className={cls} />;
    case 'Globe': return <Globe className={cls} />;
    case 'Upload': return <Upload className={cls} />;
    case 'ArrowDownToLine': return <ArrowDownToLine className={cls} />;
    default: return <Hourglass className={cls} />;
  }
};

const SALES_EMPLOYEE_NAV_ITEMS: EnterpriseNavItem[] = [
  {
    id: 'employee-dashboard',
    label: 'Dashboard',
    path: '/employee/dashboard',
    iconName: 'Home',
  },
  {
    id: 'employee-tasks',
    label: 'Task',
    path: '/tasks',
    iconName: 'CheckSquare',
    children: [
      { label: 'My Tasks', href: '/tasks', iconName: 'CheckSquare' },
      { label: 'Task Calendar', href: '/employee/calendar', iconName: 'Calendar' },
      { label: "Today's Follow-ups", href: '/leads/followups', iconName: 'Clock' },
    ],
  },
  {
    id: 'employee-leads',
    label: 'Lead',
    path: '/leads',
    iconName: 'ListChecks',
    children: [
      { label: 'All Leads', href: '/leads', iconName: 'ListChecks' },
      { label: 'My Leads', href: '/leads', iconName: 'UserCheck' },
      { label: '+ Add Lead', href: '/leads', iconName: 'Plus' },
      { label: 'Convert Lead', href: '/leads', iconName: 'CornerUpRight' },
      { label: 'Lead Follow-ups', href: '/leads/followups', iconName: 'Clock' },
      { label: 'Lead Status', href: '/leads/status', iconName: 'Activity' },
    ],
  },
  {
    id: 'employee-customers',
    label: 'Customer',
    path: '/customers',
    iconName: 'Shield',
    children: [
      { label: 'All Customers', href: '/customers', iconName: 'Shield' },
      { label: 'My Customers', href: '/customers', iconName: 'UserCheck' },
      { label: 'Contacts', href: '/customers/contacts', iconName: 'Contact' },
      { label: 'Customer Activities', href: '/customers/activities', iconName: 'Activity' },
      { label: 'Follow-ups', href: '/customers/followups', iconName: 'Clock' },
    ],
  },
  {
    id: 'employee-sales',
    label: 'Sales',
    path: '/sales',
    iconName: 'Hourglass',
    children: [
      { label: 'Opportunities', href: '/sales?tab=opportunities', iconName: 'Key' },
      { label: 'Quotations', href: '/sales?tab=quotations', iconName: 'FileText' },
      { label: 'Orders', href: '/sales?tab=orders', iconName: 'ThumbsUp' },
      { label: 'Proforma Invoices', href: '/sales?tab=proforma', iconName: 'CreditCard' },
      { label: 'Invoices', href: '/sales?tab=invoice', iconName: 'FileSpreadsheet' },
      { label: 'Delivery Notes', href: '/sales?tab=delivery', iconName: 'Table' },
      { label: 'Receipts / Payments', href: '/sales?tab=receipt', iconName: 'Receipt' },
    ],
  },
  {
    id: 'employee-reports',
    label: 'Report',
    path: '/reports',
    iconName: 'FileText',
    children: [
      { label: 'Sales Reports', href: '/reports?type=sales', iconName: 'DollarSign' },
      { label: 'Lead Reports', href: '/leads/reports', iconName: 'ListChecks' },
      { label: 'My Targets & Performance', href: '/settings?tab=user-target', iconName: 'Target' },
    ],
  },
  {
    id: 'employee-settings',
    label: 'Settings',
    iconName: 'Wrench',
    children: [
      { label: 'My Profile', href: '/settings?tab=profile', iconName: 'Contact' },
      { label: 'User Target', href: '/settings?tab=user-target', iconName: 'BarChart3' },
    ],
  },
];

export function EnterpriseNavbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || searchParams.get('sub') || searchParams.get('type');

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const syncUser = () => {
      const user = authMockService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (user.role) {
          setUserRole(user.role.toLowerCase());
        }
      }
    };
    syncUser();
    const unsub = authMockService.onAuthStateChanged((u) => {
      if (u) {
        setCurrentUser(u);
        if (u.role) setUserRole(u.role.toLowerCase());
      }
    });
    window.addEventListener('storage', syncUser);
    window.addEventListener('crm_auth_updated', syncUser);
    return () => {
      unsub();
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('crm_auth_updated', syncUser);
    };
  }, []);

  const activeNavItems = useMemo(() => {
    const user = currentUser || (typeof window !== 'undefined' ? authMockService.getCurrentUser() : null);

    const role = (user?.role || '').toLowerCase();
    const isEmployee = role === 'employee' || role === 'worker';
    const isManager = role === 'manager';
    const userDashboardPath = isEmployee
      ? '/worker/dashboard'
      : isManager
        ? '/manager/dashboard'
        : '/dashboard';

    const baseNavItems = ENTERPRISE_NAV_ITEMS.map((item) => {
      if (item.id === 'dashboard') {
        return { ...item, path: userDashboardPath };
      }
      return item;
    });

    if (!user) return baseNavItems;

    const isSuper = role === 'super_admin' || role === 'super admin' || (user.profileType || '').toLowerCase().includes('super admin');
    const isAdmin = role === 'admin' || Boolean(user.isAdmin) || (user.profileType || '').toLowerCase().includes('admin');

    if (isSuper || isAdmin) {
      return baseNavItems;
    }

    const dept = (user.department || '').toLowerCase();
    const mgrType = (user.managerType || '').toLowerCase();
    const empType = (user.employeeType || '').toLowerCase();
    const desig = (user.designation || '').toLowerCase();
    const pos = (user.position || '').toLowerCase();
    const name = (user.name || '').toLowerCase();

    const isSales = dept === 'sales' || mgrType.includes('sales') || empType.includes('sales') || desig.includes('sales') || pos === 'cso' || name.includes('shibil') || name.includes('shaheer') || name.includes('adhil');
    const isPurchase = dept === 'purchase' || mgrType.includes('purchase') || empType.includes('purchase') || desig.includes('purchase') || pos === 'cpo' || name.includes('rashid') || name.includes('faisal');

    return baseNavItems.filter((item) => {
      // Sales personnel do not have Purchase access
      if (isSales && item.id === 'purchase') return false;

      // Purchase personnel do not have Sales / Lead / Customer access
      if (isPurchase && (item.id === 'sales' || item.id === 'leads' || item.id === 'customers')) return false;

      // Check explicit modulePermissions if present
      if (user.modulePermissions) {
        if (item.id === 'purchase' && user.modulePermissions.purchase === false) return false;
        if (item.id === 'sales' && user.modulePermissions.sales === false) return false;
        if (item.id === 'leads' && user.modulePermissions.leads === false) return false;
        if (item.id === 'customers' && user.modulePermissions.customers === false) return false;
      }

      return true;
    });
  }, [currentUser]);

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
  }, [pathname, currentTab]);

  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterNav = (itemId: string, hasChildren: boolean) => {
    if (!hasChildren) return;
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setActiveMenu(itemId);
  };

  const handleMouseLeaveNav = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    menuTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 180);
  };

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
      className="flex items-center relative flex-shrink-0 h-10 w-full overflow-visible"
    >
      <div className="flex items-center w-full justify-between lg:justify-start overflow-visible">
        {/* Desktop Horizontal Menu */}
        <div className="hidden lg:flex items-center gap-0.5 flex-nowrap h-10 overflow-visible">
          {activeNavItems.map((item) => {
            const hasChildren = !!(item.children && item.children.length > 0);
            const isMenuOpen = activeMenu === item.id;
            const isRouteActive =
              item.path === pathname ||
              (item.id !== 'dashboard' && pathname.startsWith(`/${item.id}`)) ||
              (item.id === 'dashboard' && (pathname === '/dashboard' || pathname === '/manager/dashboard' || pathname === '/worker/dashboard' || pathname === '/employee/dashboard'));
            const isHighlighted = isMenuOpen || isRouteActive;

            // Find active child matching current route / tab if item is active
            const activeChild = (() => {
              if (!isRouteActive || !item.children || item.children.length === 0) return null;

              if (currentTab) {
                const tabMatch = item.children.find(
                  (c) => c.href && (c.href.includes(`tab=${currentTab}`) || c.href.includes(`sub=${currentTab}`) || c.href.includes(`type=${currentTab}`))
                );
                if (tabMatch) return tabMatch;

                for (const c of item.children) {
                  if (c.children) {
                    const nestedMatch = c.children.find(
                      (nc) => nc.href && (nc.href.includes(`tab=${currentTab}`) || nc.href.includes(`sub=${currentTab}`) || nc.href.includes(`type=${currentTab}`))
                    );
                    if (nestedMatch) return nestedMatch;
                  }
                }
              }

              // Exact path match in children
              const pathMatch = item.children.find((c) => c.href === pathname);
              if (pathMatch) return pathMatch;

              // Default fallback for /sales if no tab param is present -> Opportunity
              if (item.id === 'sales' && pathname === '/sales') {
                return item.children.find((c) => c.href?.includes('opportunities')) || item.children[0];
              }

              // Default fallback for /purchase if no tab param is present -> Stock
              if (item.id === 'purchase' && pathname === '/purchase') {
                return item.children.find((c) => c.href?.includes('stock')) || item.children[0];
              }

              return null;
            })();

            const displayLabel = isRouteActive && activeChild ? activeChild.label : item.label;
            const displayIconName = isRouteActive && activeChild?.iconName ? activeChild.iconName : item.iconName;

            // Direct link for Dashboard / Report / Leads / Tasks
            if (!hasChildren && item.path) {
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  onMouseEnter={() => {
                    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current);
                    setActiveMenu(null);
                  }}
                  className={cn(
                    'h-10 flex items-center gap-1.5 px-3.5 text-xs font-bold transition-colors select-none whitespace-nowrap flex-shrink-0',
                    isRouteActive
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-800 hover:bg-blue-50 hover:text-[#2563EB]'
                  )}
                >
                  <span>{renderHeaderIcon(item.iconName, isRouteActive)}</span>
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
              <div
                key={item.id}
                className="relative h-10 flex items-center flex-shrink-0 overflow-visible"
                onMouseEnter={() => handleMouseEnterNav(item.id, hasChildren)}
                onMouseLeave={handleMouseLeaveNav}
              >
                <button
                  type="button"
                  onClick={() => handleMenuClick(item.id, hasChildren)}
                  onKeyDown={(e) => handleKeyDown(e, item.id, hasChildren)}
                  aria-expanded={isMenuOpen}
                  className={cn(
                    'h-10 flex items-center gap-1.5 px-3.5 text-xs font-bold cursor-pointer transition-colors select-none focus:outline-none whitespace-nowrap flex-shrink-0',
                    isMenuOpen
                      ? 'bg-[#002B49] text-white shadow-xs'
                      : isRouteActive
                        ? 'bg-[#002B49] text-white shadow-xs'
                        : 'text-slate-800 hover:bg-blue-50 hover:text-[#2563EB]'
                  )}
                >
                  <span>{renderHeaderIcon(displayIconName, isHighlighted)}</span>
                  <span>{displayLabel}</span>
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold leading-none shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                  <ChevronDown
                    className={cn(
                      'w-3 h-3 transition-transform duration-150',
                      isHighlighted ? 'text-white' : 'text-slate-400',
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

        {/* Mobile / Tablet Hamburger Toggle Button (< lg) */}
        <div className="flex lg:hidden items-center justify-between w-full h-10 py-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-800 truncate">
              {(() => {
                const activeItem = activeNavItems.find(
                  (i) => i.path === pathname || (i.id !== 'dashboard' && pathname.startsWith(`/${i.id}`))
                );
                if (!activeItem) return 'Navigation';
                if (currentTab && activeItem.children) {
                  const match = activeItem.children.find((c) => c.href && c.href.includes(`tab=${currentTab}`));
                  if (match) return match.label;
                }
                return activeItem.label;
              })()}
            </span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-md text-slate-700 hover:bg-slate-100 flex items-center gap-1 text-xs font-medium cursor-pointer border border-slate-200"
            aria-label="Open navigation menu"
          >
            <Menu className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[2000] lg:hidden animate-in fade-in duration-150">
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
                  (item.id !== 'dashboard' && pathname.startsWith(`/${item.id}`)) ||
                  (item.id === 'dashboard' && (pathname === '/dashboard' || pathname === '/manager/dashboard' || pathname === '/worker/dashboard' || pathname === '/employee/dashboard'));

                const activeChild = (() => {
                  if (!isRouteActive || !item.children || item.children.length === 0) return null;
                  if (currentTab) {
                    const tabMatch = item.children.find(
                      (c) => c.href && (c.href.includes(`tab=${currentTab}`) || c.href.includes(`sub=${currentTab}`))
                    );
                    if (tabMatch) return tabMatch;
                  }
                  return item.children.find((c) => c.href === pathname) ||
                    (item.id === 'sales' && pathname === '/sales' ? item.children[0] : null) ||
                    (item.id === 'purchase' && pathname === '/purchase' ? item.children[0] : null);
                })();

                const displayLabel = isRouteActive && activeChild ? activeChild.label : item.label;
                const displayIconName = isRouteActive && activeChild?.iconName ? activeChild.iconName : item.iconName;

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
                        {renderHeaderIcon(item.iconName, isRouteActive)}
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
                        {renderHeaderIcon(displayIconName, isRouteActive)}
                        <span>{displayLabel}</span>
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

