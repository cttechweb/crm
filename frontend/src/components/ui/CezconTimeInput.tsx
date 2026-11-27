'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CezconTimeInputProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  disabled?: boolean;
}

export function CezconTimeInput({
  value,
  onChange,
  className = '',
  disabled = false,
}: CezconTimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const nativeTimeInputRef = useRef<HTMLInputElement>(null);

  // Parse time string e.g. "01:01 PM" or "13:01"
  const parseTime = (val: string) => {
    let hour = '01';
    let minute = '00';
    let period = 'PM';

    if (val && typeof val === 'string') {
      const trimmed = val.trim();
      const match = trimmed.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
      if (match) {
        let h = parseInt(match[1], 10);
        const m = match[2];
        const p = match[3] ? match[3].toUpperCase() : null;

        if (p) {
          hour = h.toString().padStart(2, '0');
          minute = m;
          period = p;
        } else {
          // 24-hr format
          if (h >= 12) {
            period = 'PM';
            if (h > 12) h -= 12;
          } else {
            period = 'AM';
            if (h === 0) h = 12;
          }
          hour = h.toString().padStart(2, '0');
          minute = m;
        }
      }
    }
    return { hour, minute, period };
  };

  const { hour: currentHour, minute: currentMinute, period: currentPeriod } = parseTime(value);

  // Convert 12hr to 24hr string for native time input
  const get24HourValue = () => {
    let h = parseInt(currentHour, 10);
    if (currentPeriod === 'PM' && h < 12) h += 12;
    if (currentPeriod === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${currentMinute}`;
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelectTime = (h: string, m: string, p: string) => {
    const formatted = `${h.padStart(2, '0')}:${m.padStart(2, '0')} ${p}`;
    onChange(formatted);
  };

  const handleSetCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes} ${period}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const hoursList = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  const minutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onClick={() => !disabled && setIsOpen(true)}
          className={cn(
            'w-full bg-white border border-slate-300 rounded px-2.5 pr-8 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer',
            className
          )}
          placeholder="hh:mm AM/PM"
        />

        {/* Clock trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition p-0.5 cursor-pointer z-10"
          title="Select Time"
        >
          <Clock className="w-3.5 h-3.5" />
        </button>

        {/* Native time input overlay as alternative trigger */}
        <input
          ref={nativeTimeInputRef}
          type="time"
          disabled={disabled}
          value={get24HourValue()}
          onChange={(e) => {
            if (e.target.value) {
              const [h24, m] = e.target.value.split(':');
              let h = parseInt(h24, 10);
              const p = h >= 12 ? 'PM' : 'AM';
              h = h % 12;
              h = h ? h : 12;
              onChange(`${h.toString().padStart(2, '0')}:${m} ${p}`);
            }
          }}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      {/* Cezcon CRM Time Picker Popover */}
      {isOpen && (
        <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-md shadow-xl z-50 p-3 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
          {/* Header with Currently Selected Time and AM/PM */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-1">
              <span className="font-bold text-slate-800 text-sm">
                {currentHour}:{currentMinute}
              </span>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {currentPeriod}
              </span>
            </div>
            {/* AM / PM Toggle buttons */}
            <div className="flex items-center border border-slate-200 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => handleSelectTime(currentHour, currentMinute, 'AM')}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-bold transition cursor-pointer',
                  currentPeriod === 'AM'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                )}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => handleSelectTime(currentHour, currentMinute, 'PM')}
                className={cn(
                  'px-2 py-0.5 text-[10px] font-bold transition cursor-pointer',
                  currentPeriod === 'PM'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                )}
              >
                PM
              </button>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1 mb-2.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handleSetCurrentTime}
              className="flex-1 py-1 px-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] text-center transition cursor-pointer"
            >
              Now
            </button>
            {['09:00 AM', '12:00 PM', '02:00 PM', '05:00 PM'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  onChange(preset);
                  setIsOpen(false);
                }}
                className="py-1 px-1.5 rounded hover:bg-slate-100 text-slate-600 text-[10px] transition cursor-pointer"
              >
                {preset.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Hours & Minutes Dual Selector */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            {/* Hours Column */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Hour</p>
              <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto pr-0.5">
                {hoursList.map((h) => {
                  const isSelected = h === currentHour;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleSelectTime(h, currentMinute, currentPeriod)}
                      className={cn(
                        'py-1 rounded text-center text-xs font-medium transition cursor-pointer',
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      )}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minutes Column */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Minute</p>
              <div className="grid grid-cols-3 gap-1 max-h-28 overflow-y-auto pr-0.5">
                {minutesList.map((m) => {
                  const isSelected = m === currentMinute;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleSelectTime(currentHour, m, currentPeriod)}
                      className={cn(
                        'py-1 rounded text-center text-xs font-medium transition cursor-pointer',
                        isSelected
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-50 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                      )}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={() => {
                if (nativeTimeInputRef.current) {
                  try {
                    if (typeof nativeTimeInputRef.current.showPicker === 'function') {
                      nativeTimeInputRef.current.showPicker();
                    } else {
                      nativeTimeInputRef.current.focus();
                    }
                  } catch {
                    nativeTimeInputRef.current.focus();
                  }
                }
              }}
              className="text-slate-500 hover:text-slate-700 underline text-[10px] cursor-pointer"
            >
              System Clock
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <Check className="w-3 h-3" />
              <span>Done</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
