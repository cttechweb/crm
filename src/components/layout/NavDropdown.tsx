'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Home,
  CheckSquare,
  Megaphone,
  ListChecks,
  Shield,
  Hourglass,
  Package,
  FileText,
  Wrench,
  Clock,
  AlertCircle,
  PlayCircle,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Video,
  Radio,
  Users,
  UserPlus,
  UserCheck,
  Globe,
  Activity,
  UserCog,
  Copy,
  Upload,
  Building2,
  FolderTree,
  Key,
  ShoppingCart,
  FileSpreadsheet,
  Receipt,
  CreditCard,
  Truck,
  Boxes,
  FilePlus,
  FileCheck,
  DollarSign,
  ArrowDownToLine,
  Tag,
  Store,
  Factory,
  TrendingUp,
  BarChart3,
  Sliders,
  ShieldCheck,
  Briefcase,
  Target,
  Box,
  Lock,
  Database,
  ThumbsUp,
  Table,
  Contact,
  ChevronRight,
  Languages,
  Printer,
  Flag,
  Ban,
  Mail,
  MessageSquare,
  Smartphone,
} from 'lucide-react';
import { usePathname, useSearchParams } from 'next/navigation';
import { NavDropdownItem } from '@/config/enterprise-navigation';
import { cn } from '@/lib/utils';

// Helper to render icon with proper active/normal color
const renderDropdownIcon = (name?: string, isHighlighted: boolean = false) => {
  const iconClass = cn('w-3.5 h-3.5 flex-shrink-0 transition-colors', isHighlighted ? 'text-white' : 'text-[#2563EB]');

  switch (name) {
    case 'Home': return <Home className={iconClass} />;
    case 'CheckSquare': return <CheckSquare className={iconClass} />;
    case 'Megaphone': return <Megaphone className={iconClass} />;
    case 'ListChecks': return <ListChecks className={iconClass} />;
    case 'Shield': return <Shield className={iconClass} />;
    case 'Hourglass': return <Hourglass className={iconClass} />;
    case 'Package': return <Package className={iconClass} />;
    case 'FileText': return <FileText className={iconClass} />;
    case 'Wrench': return <Wrench className={iconClass} />;
    case 'Clock': return <Clock className={iconClass} />;
    case 'AlertCircle': return <AlertCircle className={iconClass} />;
    case 'PlayCircle': return <PlayCircle className={iconClass} />;
    case 'AlertTriangle': return <AlertTriangle className={iconClass} />;
    case 'Calendar': return <Calendar className={iconClass} />;
    case 'CheckCircle2': return <CheckCircle2 className={iconClass} />;
    case 'Video': return <Video className={iconClass} />;
    case 'Radio': return <Radio className={iconClass} />;
    case 'Users': return <Users className={iconClass} />;
    case 'UserPlus': return <UserPlus className={iconClass} />;
    case 'UserCheck': return <UserCheck className={iconClass} />;
    case 'Globe': return <Globe className={iconClass} />;
    case 'Languages': return <Languages className={iconClass} />;
    case 'Activity': return <Activity className={iconClass} />;
    case 'UserCog': return <UserCog className={iconClass} />;
    case 'Copy': return <Copy className={iconClass} />;
    case 'Upload': return <Upload className={iconClass} />;
    case 'Building2': return <Building2 className={iconClass} />;
    case 'FolderTree': return <FolderTree className={iconClass} />;
    case 'Key': return <Key className={iconClass} />;
    case 'ShoppingCart': return <ShoppingCart className={iconClass} />;
    case 'FileSpreadsheet': return <FileSpreadsheet className={iconClass} />;
    case 'Receipt': return <Receipt className={iconClass} />;
    case 'CreditCard': return <CreditCard className={iconClass} />;
    case 'Contact': return <Contact className={iconClass} />;
    case 'Table': return <Table className={iconClass} />;
    case 'Truck': return <Truck className={iconClass} />;
    case 'Boxes': return <Boxes className={iconClass} />;
    case 'FilePlus': return <FilePlus className={iconClass} />;
    case 'FileCheck': return <FileCheck className={iconClass} />;
    case 'DollarSign': return <DollarSign className={iconClass} />;
    case 'ArrowDownToLine': return <ArrowDownToLine className={iconClass} />;
    case 'Tag': return <Tag className={iconClass} />;
    case 'Store': return <Store className={iconClass} />;
    case 'Factory': return <Factory className={iconClass} />;
    case 'Printer': return <Printer className={iconClass} />;
    case 'Flag': return <Flag className={iconClass} />;
    case 'Ban': return <Ban className={iconClass} />;
    case 'Mail': return <Mail className={iconClass} />;
    case 'MessageSquare': return <MessageSquare className={iconClass} />;
    case 'Smartphone': return <Smartphone className={iconClass} />;
    case 'TrendingUp': return <TrendingUp className={iconClass} />;
    case 'BarChart3': return <BarChart3 className={iconClass} />;
    case 'Sliders': return <Sliders className={iconClass} />;
    case 'ShieldCheck': return <ShieldCheck className={iconClass} />;
    case 'Briefcase': return <Briefcase className={iconClass} />;
    case 'Target': return <Target className={iconClass} />;
    case 'Box': return <Box className={iconClass} />;
    case 'Lock': return <Lock className={iconClass} />;
    case 'Database': return <Database className={iconClass} />;
    case 'ThumbsUp': return <ThumbsUp className={iconClass} />;
    default: return <FileText className={iconClass} />;
  }
};

interface NavDropdownProps {
  items: NavDropdownItem[];
  isOpen: boolean;
  onClose: () => void;
}

export function NavDropdown({ items, isOpen, onClose }: NavDropdownProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname;

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredSubIndex, setHoveredSubIndex] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset hovered index when menu closes
  useEffect(() => {
    if (!isOpen) {
      setHoveredIndex(null);
      setHoveredSubIndex(null);
    }
  }, [isOpen]);

  const handleMouseEnterItem = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setHoveredIndex(index);
  };

  const handleMouseLeaveItem = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setHoveredIndex(null);
      setHoveredSubIndex(null);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 top-full mt-0.5 w-[220px] bg-white border border-[#E2E8F0] rounded-sm shadow-xl p-1 z-[1100] animate-in fade-in duration-100"
      style={{
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
      }}
    >
      <div className="space-y-0.5">
        {items.map((item, idx) => {
          const hasChildren = !!(item.children && item.children.length > 0);
          const isCurrentRoute = item.href === currentUrl || (item.href === pathname && !searchParams.toString());
          const isHighlighted = hoveredIndex === idx || (hoveredIndex === null && isCurrentRoute);

          return (
            <div
              key={idx}
              className="relative"
              onMouseEnter={() => handleMouseEnterItem(idx)}
              onMouseLeave={handleMouseLeaveItem}
            >
              {hasChildren ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (item.href) {
                      onClose();
                    }
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-sm transition-colors select-none cursor-pointer',
                    isHighlighted
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-800 hover:bg-[#2563EB] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">
                      {renderDropdownIcon(item.iconName, isHighlighted)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 flex-shrink-0 ml-1.5 transition-transform duration-150',
                      isHighlighted ? 'text-white translate-x-0.5' : 'text-slate-400'
                    )}
                  />
                </div>
              ) : (
                <Link
                  href={item.href || '#'}
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.dispatchEvent(new CustomEvent('crm-reset-settings-view'));
                    }
                    onClose();
                  }}
                  className={cn(
                    'flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold rounded-sm transition-colors select-none',
                    isHighlighted
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'text-slate-800 hover:bg-[#2563EB] hover:text-white'
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex-shrink-0">
                      {renderDropdownIcon(item.iconName, isHighlighted)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-bold',
                      isHighlighted ? 'bg-white text-[#2563EB]' : 'bg-blue-100 text-blue-700'
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}

              {/* Nested Flyout Submenu to the Right */}
              {hasChildren && hoveredIndex === idx && item.children && (
                <div
                  className="absolute left-[calc(100%+2px)] top-0 w-[210px] bg-white border border-[#E2E8F0] rounded-sm shadow-xl p-1 z-[1200] animate-in fade-in duration-100"
                  style={{
                    boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.18), 0 8px 12px -6px rgba(15, 23, 42, 0.1)',
                  }}
                  onMouseEnter={() => handleMouseEnterItem(idx)}
                  onMouseLeave={handleMouseLeaveItem}
                >
                  <div className="space-y-0.5">
                    {item.children.map((subItem, subIdx) => {
                      const isSubRoute = subItem.href === currentUrl || (subItem.href === pathname && !searchParams.toString());
                      const isSubHighlighted = hoveredSubIndex === subIdx || (hoveredSubIndex === null && isSubRoute);

                      return (
                        <Link
                          key={subIdx}
                          href={subItem.href || '#'}
                          onClick={() => {
                            if (typeof window !== 'undefined') {
                              window.dispatchEvent(new CustomEvent('crm-reset-settings-view'));
                            }
                            onClose();
                          }}
                          onMouseEnter={() => setHoveredSubIndex(subIdx)}
                          onMouseLeave={() => setHoveredSubIndex(null)}
                          className={cn(
                            'flex items-center gap-2 px-2.5 py-1.5 text-xs font-semibold rounded-sm transition-colors select-none',
                            isSubHighlighted
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'text-slate-800 hover:bg-[#2563EB] hover:text-white'
                          )}
                        >
                          <span className="flex-shrink-0">
                            {renderDropdownIcon(subItem.iconName, isSubHighlighted)}
                          </span>
                          <span className="truncate">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

