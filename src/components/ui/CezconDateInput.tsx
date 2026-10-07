'use client';

import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CezconDateInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

export function CezconDateInput({
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  required = false,
  className = '',
  disabled = false,
}: CezconDateInputProps) {
  const datePickerRef = useRef<HTMLInputElement>(null);

  // Convert DD-MM-YYYY or any format to ISO YYYY-MM-DD for native <input type="date">
  const getIsoDate = (val: string) => {
    if (!val) return '';
    const trimmed = val.trim();
    if (trimmed.includes('-')) {
      const parts = trimmed.split('-');
      if (parts[0].length === 4) return trimmed; // already YYYY-MM-DD
      if (parts.length === 3 && parts[2]?.length === 4) {
        // DD-MM-YYYY -> YYYY-MM-DD
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
    return '';
  };

  // Convert ISO YYYY-MM-DD back to DD-MM-YYYY
  const formatToDdMmYyyy = (iso: string) => {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return iso;
  };

  const handleOpenPicker = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      if (datePickerRef.current) {
        if (typeof datePickerRef.current.showPicker === 'function') {
          datePickerRef.current.showPicker();
        } else {
          datePickerRef.current.focus();
        }
      }
    } catch {
      datePickerRef.current?.focus();
    }
  };

  return (
    <div className="relative w-full flex items-center">
      <input
        type="text"
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 pr-9 bg-white',
          className
        )}
      />
      
      {/* Visual Calendar Icon */}
      <button
        type="button"
        tabIndex={-1}
        onClick={handleOpenPicker}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer pointer-events-none z-10"
      >
        <Calendar className="w-3.5 h-3.5" />
      </button>

      {/* Interactive Native Datepicker overlaid on the calendar icon area */}
      <input
        ref={datePickerRef}
        type="date"
        disabled={disabled}
        value={getIsoDate(value)}
        onChange={(e) => {
          if (e.target.value) {
            onChange(formatToDdMmYyyy(e.target.value));
          }
        }}
        className="absolute right-0 top-0 bottom-0 w-8 opacity-0 cursor-pointer z-20"
        title="Select date"
      />
    </div>
  );
}
