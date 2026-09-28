import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5 font-semibold',
    md: 'px-4 py-2.5 text-xs sm:text-sm rounded-xl gap-2 font-bold',
    lg: 'px-5 py-3 text-sm sm:text-base rounded-xl gap-2.5 font-bold',
  };

  const variantStyles = {
    primary:
      'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 active:scale-[0.98] border border-blue-500/30',
    gradient:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-md shadow-indigo-500/25 active:scale-[0.98]',
    secondary:
      'bg-slate-100/90 text-slate-800 hover:bg-slate-200 active:bg-slate-300 shadow-2xs active:scale-[0.98]',
    outline:
      'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 shadow-2xs active:scale-[0.98]',
    ghost:
      'text-slate-600 hover:bg-slate-100/80 active:bg-slate-200 hover:text-slate-900 active:scale-[0.98]',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md shadow-rose-500/20 active:scale-[0.98]',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 active:scale-[0.98]',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
