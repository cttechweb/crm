'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Package,
  Wrench,
  Check,
  Trash2,
} from 'lucide-react';
import { WorkerShell } from '@/components/layout/WorkerShell';

interface NotificationItem {
  id: string;
  type: 'urgent' | 'info' | 'success' | 'material';
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export default function EmployeeNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <WorkerShell
      title="Notifications & Alerts"
      subtitle="Operational dispatches, inventory approvals, timesheet confirmations, and emergency SLA notices"
    >
      <div className="space-y-4">
        {/* Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900">
              {notifications.filter((n) => !n.read).length} Unread Notifications
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#2563EB] hover:bg-blue-50 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 sm:p-5 transition-colors flex items-start gap-3.5 ${
                  !notif.read ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notif.type === 'urgent'
                      ? 'bg-rose-50 text-rose-600'
                      : notif.type === 'material'
                      ? 'bg-blue-50 text-[#2563EB]'
                      : notif.type === 'success'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {notif.type === 'urgent' && <AlertTriangle className="w-4 h-4" />}
                  {notif.type === 'material' && <Package className="w-4 h-4" />}
                  {notif.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
                  {notif.type === 'info' && <Bell className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{notif.description}</p>
                  {notif.link && (
                    <Link
                      href={notif.link}
                      className="inline-block text-xs font-bold text-[#2563EB] hover:underline pt-1"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </WorkerShell>
  );
}
