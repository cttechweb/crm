'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { X, MessageSquare } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { authMockService } from '@/services/authMockService';
import { getLiveUserAvatar } from '@/services/chatApiService';

function ToastContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeToast, setActiveToast] = useState<{
    id: string;
    conversationId: string;
    senderName: string;
    senderRole?: string;
    senderAvatar?: string;
    text: string;
    createdAt: string;
  } | null>(null);

  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Friendly soft chime notification
  const playChime = () => {
    try {
      if (typeof window === 'undefined') return;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const handleIncomingMessage = (msg: ChatMessage) => {
    if (!msg || msg.is_deleted) return;

    const currentUser = authMockService.getCurrentUser();
    const currentUserId = currentUser?.id || (currentUser as any)?.uid;
    const cleanCurrent = currentUserId ? String(currentUserId).replace('usr_', '').toLowerCase() : '';
    const cleanSender = String(msg.sender_id || '').replace('usr_', '').toLowerCase();

    // Do NOT notify if the message was sent by the current user
    if (cleanCurrent && cleanSender === cleanCurrent) return;

    // Do NOT notify if already on the /chat page viewing this conversation
    if (pathname === '/chat') {
      const activeParam = searchParams.get('c');
      if (activeParam === msg.conversation_id) return;
    }

    // Trigger WhatsApp notification toast
    const resolvedAvatar =
      (msg.sender_avatar && !msg.sender_avatar.includes('unsplash'))
        ? msg.sender_avatar
        : (getLiveUserAvatar(msg.sender_name, undefined, msg.sender_id) || msg.sender_avatar || undefined);

    setActiveToast({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderName: msg.sender_name || 'Colleague',
      senderRole: msg.sender_role || 'CRM Staff',
      senderAvatar: resolvedAvatar,
      text: msg.message_text,
      createdAt: msg.created_at,
    });

    playChime();

    if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    dismissTimerRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
  };

  useEffect(() => {
    const handleReceived = (e: any) => {
      if (e?.detail) handleIncomingMessage(e.detail);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cooltech_chat_cross_tab_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.message) handleIncomingMessage(parsed.message);
        } catch {}
      }
    };

    window.addEventListener('cooltech_chat_message_received', handleReceived);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('cooltech_chat_message_received', handleReceived);
      window.removeEventListener('storage', handleStorage);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, [pathname, searchParams]);

  if (!activeToast) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenChat = () => {
    const target = activeToast.conversationId;
    setActiveToast(null);
    router.push(`/chat?c=${encodeURIComponent(target)}`);
  };

  return (
    <div className="fixed top-5 right-5 z-[100] max-w-sm w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3.5 animate-in slide-in-from-top-4 fade-in duration-200 select-none print:hidden">
      <div className="flex items-start gap-3">
        {/* Profile Avatar with online green indicator */}
        <div className="relative flex-shrink-0">
          {activeToast.senderAvatar ? (
            <img
              src={activeToast.senderAvatar}
              alt={activeToast.senderName}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-500/80 shadow-xs"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              {getInitials(activeToast.senderName)}
            </div>
          )}
          <span className="w-3 h-3 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-white" />
        </div>

        {/* Sender info & message snippet */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="text-xs font-bold text-slate-900 truncate">
                {activeToast.senderName}
              </span>
              {activeToast.senderRole && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 truncate flex-shrink-0">
                  {activeToast.senderRole}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 flex-shrink-0">Just now</span>
          </div>

          <p className="text-xs text-slate-700 font-normal line-clamp-2 leading-relaxed mb-2">
            {activeToast.text}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenChat}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Reply in Chat</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveToast(null)}
              className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setActiveToast(null)}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export function ChatNotificationToast() {
  return (
    <Suspense fallback={null}>
      <ToastContent />
    </Suspense>
  );
}

