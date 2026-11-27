import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'completed', 'converted', 'in stock', 'qualified', 'hot', 'approved'].includes(normalized)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['pending', 'in progress', 'proposal sent', 'negotiation', 'warm', 'low stock'].includes(normalized)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['overdue', 'urgent', 'lost', 'out of stock', 'cold', 'inactive'].includes(normalized)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['new', 'upcoming', 'contacted', 'opportunity'].includes(normalized)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border tracking-wide uppercase',
        styles,
        className
      )}
    >
      {status}
    </span>
  );
}
