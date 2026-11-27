'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';

export interface DatePickerProps {
  label?: string;
  value: string; // Format: 'YYYY-MM-DD' or 'DD-MM-YYYY'
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: string; // 'YYYY-MM-DD'
  maxDate?: string; // 'YYYY-MM-DD'
  isDob?: boolean; // If true, defaults year view to adult working age (e.g., 1995)
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Helper to parse 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD/MM/YYYY', 'YYYY/MM/DD' to Date
function parseDateString(str: string): Date | null {
  if (!str) return null;
  const trimmed = String(str).trim();
  if (!trimmed) return null;

  // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime()) && date.getMonth() === m && date.getDate() === d) {
        return date;
      }
    }
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    if (m >= 0 && m <= 11 && d >= 1 && d <= 31) {
      const date = new Date(y, m, d);
      if (!isNaN(date.getTime()) && date.getMonth() === m && date.getDate() === d) {
        return date;
      }
    }
  }

  const date = new Date(trimmed);
  return isNaN(date.getTime()) ? null : date;
}

// Format Date object to 'DD-MM-YYYY' for display & input
function formatDateDisplay(d: Date | null): string {
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

// Format Date object to 'YYYY-MM-DD' for form storage
function formatDateIso(d: Date | null): string {
  if (!d) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'DD-MM-YYYY',
  minDate,
  maxDate,
  isDob = false,
  align = 'right',
  className = '',
  disabled = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'months' | 'years'>('calendar');
  const [inputText, setInputText] = useState('');
  const [openUpwards, setOpenUpwards] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const yearScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsedValue = useMemo(() => parseDateString(value), [value]);

  // Keep input text synchronized with external value
  useEffect(() => {
    if (parsedValue) {
      setInputText(formatDateDisplay(parsedValue));
    } else if (!value) {
      setInputText('');
    } else {
      setInputText(value);
    }
  }, [value, parsedValue]);

  // Determine starting calendar month & year
  const currentYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState<number>(() => {
    if (parsedValue) return parsedValue.getFullYear();
    if (isDob) return 1995;
    return currentYear;
  });
  const [viewMonth, setViewMonth] = useState<number>(() => {
    if (parsedValue) return parsedValue.getMonth();
    return new Date().getMonth();
  });

  // Update calendar view when parsedValue changes
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.getFullYear());
      setViewMonth(parsedValue.getMonth());
    }
  }, [parsedValue]);

  // Check vertical space on open to choose upwards or downwards
  const checkPosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 340 && rect.top > 340) {
        setOpenUpwards(true);
      } else {
        setOpenUpwards(false);
      }
    }
  }, []);

  const toggleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setViewMode('calendar');
        checkPosition();
      }
      return next;
    });
  }, [disabled, checkPosition]);

  const openPicker = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setViewMode('calendar');
    checkPosition();
  }, [disabled, checkPosition]);

  // Reset view mode when popover closes
  useEffect(() => {
    if (!isOpen) {
      setViewMode('calendar');
    }
  }, [isOpen]);

  // Auto-scroll to selected year when year picker opens
  useEffect(() => {
    if (viewMode === 'years' && yearScrollRef.current) {
      const selectedEl = yearScrollRef.current.querySelector('[data-selected="true"]');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [viewMode]);

  // Click outside listener to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Sensible, compact year list based on context
  const yearOptions = useMemo(() => {
    if (isDob) {
      // Adult birth year range: 2008 down to 1950
      const maxYear = maxDate ? new Date(maxDate).getFullYear() : Math.min(currentYear, 2008);
      const minYear = minDate ? new Date(minDate).getFullYear() : 1950;
      const years: number[] = [];
      for (let y = maxYear; y >= minYear; y--) {
        years.push(y);
      }
      return years;
    }

    const maxYear = maxDate ? new Date(maxDate).getFullYear() : currentYear + 10;
    const minYear = minDate ? new Date(minDate).getFullYear() : currentYear - 10;
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [isDob, minDate, maxDate, currentYear]);

  // Calendar Days Grid calculations
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      dayNumber: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      dateObj: Date;
      isDisabled: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minDateObj = minDate ? parseDateString(minDate) : null;
    const maxDateObj = maxDate ? parseDateString(maxDate) : null;
    if (minDateObj) minDateObj.setHours(0, 0, 0, 0);
    if (maxDateObj) maxDateObj.setHours(23, 59, 59, 999);

    // Prev Month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateObj = new Date(prevYear, prevMonth, d);
      const isSelected = parsedValue
        ? parsedValue.getDate() === d &&
          parsedValue.getMonth() === prevMonth &&
          parsedValue.getFullYear() === prevYear
        : false;
      const isToday =
        today.getDate() === d &&
        today.getMonth() === prevMonth &&
        today.getFullYear() === prevYear;

      const isDisabled =
        (minDateObj !== null && dateObj < minDateObj) ||
        (maxDateObj !== null && dateObj > maxDateObj);

      days.push({
        dayNumber: d,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        dateObj,
        isDisabled,
        isSelected,
        isToday,
      });
    }

    // Current Month days
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      const isSelected = parsedValue
        ? parsedValue.getDate() === d &&
          parsedValue.getMonth() === viewMonth &&
          parsedValue.getFullYear() === viewYear
        : false;
      const isToday =
        today.getDate() === d &&
        today.getMonth() === viewMonth &&
        today.getFullYear() === viewYear;

      const isDisabled =
        (minDateObj !== null && dateObj < minDateObj) ||
        (maxDateObj !== null && dateObj > maxDateObj);

      days.push({
        dayNumber: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        dateObj,
        isDisabled,
        isSelected,
        isToday,
      });
    }

    // Next Month filler days
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateObj = new Date(nextYear, nextMonth, d);
      const isSelected = parsedValue
        ? parsedValue.getDate() === d &&
          parsedValue.getMonth() === nextMonth &&
          parsedValue.getFullYear() === nextYear
        : false;
      const isToday =
        today.getDate() === d &&
        today.getMonth() === nextMonth &&
        today.getFullYear() === nextYear;

      const isDisabled =
        (minDateObj !== null && dateObj < minDateObj) ||
        (maxDateObj !== null && dateObj > maxDateObj);

      days.push({
        dayNumber: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        dateObj,
        isDisabled,
        isSelected,
        isToday,
      });
    }

    return days;
  }, [viewYear, viewMonth, parsedValue, minDate, maxDate]);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDate = (dateObj: Date) => {
    const isoString = formatDateIso(dateObj);
    onChange(isoString);
    setInputText(formatDateDisplay(dateObj));
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setInputText('');
    inputRef.current?.focus();
  };

  // Direct manual input typing handling
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    const parsed = parseDateString(text);
    if (parsed) {
      onChange(formatDateIso(parsed));
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    } else if (text === '') {
      onChange('');
    }
  };

  const handleInputBlur = () => {
    if (inputText.trim()) {
      const parsed = parseDateString(inputText);
      if (parsed) {
        setInputText(formatDateDisplay(parsed));
        onChange(formatDateIso(parsed));
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Interactive Input Trigger Container */}
      <div
        onClick={openPicker}
        className={`w-full bg-white border rounded px-2.5 py-1.5 text-xs flex items-center justify-between transition-all ${
          isOpen ? 'border-[#2196f3] ring-2 ring-[#2196f3]/15' : 'border-slate-300 hover:border-slate-400'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-text'}`}
      >
        <input
          ref={inputRef}
          type="text"
          disabled={disabled}
          value={inputText}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={openPicker}
          placeholder={placeholder}
          className="w-full bg-transparent text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none cursor-text select-text"
        />

        <div className="flex items-center gap-1.5 shrink-0 ml-1.5 select-none">
          {inputText && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="w-4 h-4 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              title="Clear date"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
            className="p-0.5 rounded hover:bg-slate-100 text-slate-500 hover:text-[#2196f3] transition-colors cursor-pointer"
            title="Open calendar"
          >
            <Calendar className="w-4 h-4 text-slate-500 hover:text-[#2196f3] transition-colors" />
          </button>
        </div>
      </div>

      {/* Interactive Calendar Popover (Right-Aligned, High Z-Index, Smart Elevation) */}
      {isOpen && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={`absolute ${
            align === 'left' ? 'left-0' : 'right-0'
          } ${
            openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } z-[99999] w-72 bg-white border border-slate-200 rounded-lg shadow-2xl p-3 text-xs select-none`}
        >
          {/* Calendar Header with Fast Month & Year Mode Toggles */}
          <div className="flex items-center justify-between gap-1 mb-2.5 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1">
              {/* Compact Month Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode(viewMode === 'months' ? 'calendar' : 'months');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'months'
                    ? 'bg-[#2196f3] text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <span>{MONTH_NAMES[viewMonth]}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {/* Compact Year Toggle Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode(viewMode === 'years' ? 'calendar' : 'years');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'years'
                    ? 'bg-[#2196f3] text-white shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <span>{viewYear}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* VIEW MODE 1: COMPACT MONTHS SELECTOR (3x4 Grid - No Scrolling) */}
          {viewMode === 'months' && (
            <div className="py-2 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Select Month
              </p>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {MONTHS_SHORT.map((mName, idx) => (
                  <button
                    key={mName}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMonth(idx);
                      setViewMode('calendar');
                    }}
                    className={`py-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                      viewMonth === idx
                        ? 'bg-[#2196f3] text-white font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600'
                    }`}
                  >
                    {mName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: COMPACT YEARS SELECTOR (3-Column Grid with Slim Height) */}
          {viewMode === 'years' && (
            <div className="py-2 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                Select Year
              </p>
              <div
                ref={yearScrollRef}
                className="grid grid-cols-3 gap-1.5 max-h-44 overflow-y-auto p-1 border border-slate-100 rounded-md bg-slate-50/50"
              >
                {yearOptions.map((y) => {
                  const isSelected = viewYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      data-selected={isSelected ? 'true' : 'false'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewYear(y);
                        setViewMode('calendar');
                      }}
                      className={`py-1.5 rounded text-xs font-semibold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#2196f3] text-white font-bold shadow-xs'
                          : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 border border-slate-200/80'
                      }`}
                    >
                      {y}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW MODE 3: STANDARD CALENDAR DAYS GRID */}
          {viewMode === 'calendar' && (
            <>
              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-400 mb-1">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="py-0.5">
                    {d}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((d, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={d.isDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectDate(d.dateObj);
                    }}
                    className={`w-8 h-8 mx-auto rounded-md flex items-center justify-center text-[11px] font-medium transition-all ${
                      d.isSelected
                        ? 'bg-[#2196f3] text-white font-bold shadow-xs'
                        : d.isToday
                        ? 'border border-[#2196f3] text-[#2196f3] font-bold'
                        : d.isCurrentMonth
                        ? 'text-slate-800 hover:bg-blue-50 hover:text-blue-600 cursor-pointer'
                        : 'text-slate-300 hover:bg-slate-50 cursor-pointer'
                    } ${d.isDisabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-300' : ''}`}
                  >
                    {d.dayNumber}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Quick Action Footer */}
          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px]">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                setInputText('');
                setIsOpen(false);
              }}
              className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Clear
            </button>

            {isDob ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewYear(1995);
                  setViewMonth(0);
                  setViewMode('calendar');
                }}
                className="text-[#2196f3] hover:underline font-semibold cursor-pointer text-[10px]"
              >
                Go to 1995 (18+)
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectDate(new Date());
                }}
                className="text-[#2196f3] hover:underline font-semibold cursor-pointer"
              >
                Today
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
