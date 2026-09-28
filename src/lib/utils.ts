import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function getStatusBadgeVariant(status: string) {
  switch (status.toLowerCase()) {
    case 'new':
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    case 'contacted':
      return 'bg-purple-50 text-purple-700 border border-purple-200';
    case 'qualified':
    case 'active':
    case 'closed won':
    case 'won':
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'unqualified':
    case 'closed lost':
    case 'overdue':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'converted':
    case 'proposal':
    case 'negotiation':
    case 'pending':
    case 'in progress':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'prospect':
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}

export function getPriorityBadgeVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case 'urgent':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    case 'high':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'medium':
      return 'bg-sky-50 text-sky-700 border border-sky-200';
    case 'low':
      return 'bg-slate-100 text-slate-700 border border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200';
  }
}
