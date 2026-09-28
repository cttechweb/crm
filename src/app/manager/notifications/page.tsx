'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Clock, Info, ShieldCheck, Trash2 } from 'lucide-react';
import { ManagerShell } from '@/components/layout/ManagerShell';

const INITIAL_NOTIFICATIONS: Array<{ id: number; title: string; message: string; time: string; type: string; read: boolean }> = [];

export default function ManagerNotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <ManagerShell
      title="Manager Notifications & Alerts"
      subtitle="Critical operational alerts, technician capacity escalations, and lead distribution updates"
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Recent Alerts ({notifications.filter((n) => !n.read).length} Unread)</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2.5 py-1 rounded hover:bg-blue-50"
            >
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-2.5 py-1 rounded hover:bg-rose-50"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <p className="p-8 text-center text-xs text-slate-400">No notifications to display</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 transition-colors flex items-start gap-3.5 ${
                  !n.read ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="shrink-0 mt-0.5">
                  {n.type === 'urgent' ? (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  ) : n.type === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : n.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-xs font-bold ${!n.read ? 'text-slate-950' : 'text-slate-700'}`}>
                      {n.title}
                    </h3>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </ManagerShell>
  );
}
