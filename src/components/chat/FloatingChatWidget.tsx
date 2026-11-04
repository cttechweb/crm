'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { chatApiService } from '@/services/chatApiService';
import { authMockService } from '@/services/authMockService';

export function FloatingChatWidget() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Poll total unread messages periodically
  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      try {
        const count = await chatApiService.getUnreadCount();
        if (mounted) setUnreadCount(count);
      } catch {
        // silent
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 8000);

    const handleIncoming = (e: any) => {
      const msg = e?.detail;
      const currentUser = authMockService.getCurrentUser();
      if (msg && currentUser && msg.sender_id === currentUser.id) return;
      fetchUnread();
    };

    const handleRead = () => {
      fetchUnread();
    };

    window.addEventListener('cooltech_chat_message_received', handleIncoming);
    window.addEventListener('cooltech_chat_read_updated', handleRead);
    window.addEventListener('crm_notification_updated', handleRead);
    window.addEventListener('crm_auth_updated', handleRead);
    window.addEventListener('storage', handleRead);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('cooltech_chat_message_received', handleIncoming);
      window.removeEventListener('cooltech_chat_read_updated', handleRead);
      window.removeEventListener('crm_notification_updated', handleRead);
      window.removeEventListener('crm_auth_updated', handleRead);
      window.removeEventListener('storage', handleRead);
    };
  }, []);

  // When already on the full /chat page, do not render the floating launcher
  if (pathname === '/chat') {
    return null;
  }

  const hasUnread = unreadCount > 0;

  return (
    <div className="fixed bottom-5 left-5 z-50 font-sans select-none print:hidden">
      <Link
        href="/chat"
        prefetch={false}
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#002B49] hover:bg-blue-600 text-white shadow-xl hover:shadow-2xl transition-all duration-200 border border-slate-700/60 group cursor-pointer transform hover:scale-105 active:scale-95"
        aria-label="Open Live Chat"
      >
        <div className="flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold tracking-wide">Live Chat</span>
        {hasUnread && (
          <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-[#DC2626] text-white text-[10px] font-black shadow-sm flex items-center justify-center ml-0.5 animate-pulse ring-2 ring-white/20">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </div>
  );
}
