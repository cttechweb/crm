'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function BackButton({ href, label = 'Back', showLabel = false, className }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href) {
      router.push(href);
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 shadow-xs transition-all duration-150 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        showLabel && 'px-3 py-1.5 text-xs font-semibold',
        className
      )}
      title="Go Back"
    >
      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      {showLabel && <span>{label}</span>}
    </button>
  );
}
