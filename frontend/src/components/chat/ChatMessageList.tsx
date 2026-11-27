'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  ArrowDown,
  MessageSquare,
  Lock,
  Hash,
  Users,
  Loader2,
} from 'lucide-react';
import { ChatMessageBubble } from '@/components/chat/ChatMessageBubble';
import type { ChatMessage, ChatConversation } from '@/types/chat';

interface ChatMessageListProps {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  currentUserId?: string;
  currentUserName?: string;
  isAdmin?: boolean;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onEditMessage: (messageId: string, newText: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function ChatMessageList({
  conversation,
  messages,
  currentUserId,
  currentUserName,
  isAdmin = false,
  isLoading = false,
  isLoadingMore = false,
  hasMore = false,
  onLoadMore,
  onEditMessage,
  onDeleteMessage,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const prevMessagesLengthRef = useRef(messages.length);

  // Group messages by calendar day
  const groupedByDay = useMemo(() => {
    const groups: { dateLabel: string; items: ChatMessage[] }[] = [];
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    messages.forEach((msg) => {
      let dStr = 'Recent';
      try {
        const msgDate = new Date(msg.created_at);
        const dayStr = msgDate.toDateString();
        if (dayStr === todayStr) {
          dStr = 'Today';
        } else if (dayStr === yesterdayStr) {
          dStr = 'Yesterday';
        } else {
          dStr = msgDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
            year: msgDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          });
        }
      } catch {
        dStr = 'Recent';
      }

      const existingGroup = groups.find((g) => g.dateLabel === dStr);
      if (existingGroup) {
        existingGroup.items.push(msg);
      } else {
        groups.push({ dateLabel: dStr, items: [msg] });
      }
    });

    return groups;
  }, [messages]);

  // Handle scroll detection
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 150);
  };

  const scrollToBottom = (smooth = true) => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Scroll to bottom when new messages arrive or on conversation switch
  useEffect(() => {
    if (messages.length > prevMessagesLengthRef.current) {
      const el = scrollContainerRef.current;
      if (el) {
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom < 200) {
          scrollToBottom(true);
        }
      }
    } else if (prevMessagesLengthRef.current === 0 && messages.length > 0) {
      scrollToBottom(false);
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    scrollToBottom(false);
  }, [conversation?.id]);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
        <p className="text-xs font-medium">Loading conversation messages...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Your Messages</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Select a channel or direct message from the sidebar to start collaborating with your team.
        </p>
      </div>
    );
  }

  const isChannel = conversation.type === 'channel';
  const isDirect = conversation.type === 'direct';
  const title = isDirect
    ? conversation.other_user?.name || conversation.title || 'Colleague'
    : conversation.title || (conversation.slug ? `#${conversation.slug}` : 'Channel');

  return (
    <div className="relative flex-1 flex flex-col min-h-0 bg-white">
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-1 py-4 scrollbar-thin scrollbar-thumb-slate-300"
      >
        {/* Load Earlier Messages Button */}
        {hasMore && (
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  <span>Loading history...</span>
                </>
              ) : (
                <span>Load earlier messages</span>
              )}
            </button>
          </div>
        )}

        {/* Conversation Header Welcome Banner inside scroll view */}
        <div className="px-5 py-6 mb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-3 shadow-2xs">
            {isChannel ? (
              conversation.is_private ? (
                <Lock className="w-6 h-6 text-amber-600" />
              ) : (
                <Hash className="w-6 h-6 text-blue-600" />
              )
            ) : isDirect ? (
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                {(title || 'U').slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <Users className="w-6 h-6 text-purple-600" />
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            {isDirect ? `Chat with ${title}` : `Welcome to ${title}`}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-lg">
            {isDirect
              ? `This is the beginning of your direct message history with ${title}. Messages here are private to the two of you.`
              : conversation.description ||
                `This is the start of the ${title} conversation. Everyone in this channel can send and view messages.`}
          </p>
        </div>

        {/* Empty state if zero messages */}
        {messages.length === 0 && (
          <div className="px-5 py-8 text-center text-slate-400">
            <p className="text-xs">No messages yet. Send the first message to get the conversation started!</p>
          </div>
        )}

        {/* Message groups by day */}
        {groupedByDay.map((group) => (
          <div key={group.dateLabel} className="space-y-0.5">
            {/* Day Divider */}
            <div className="relative my-4 text-center">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative inline-flex justify-center">
                <span className="px-3 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-2xs">
                  {group.dateLabel}
                </span>
              </div>
            </div>

            {/* Messages in this day */}
            {group.items.map((msg, index) => {
              const prevMsg = group.items[index - 1];
              // Group if same sender and sent within 5 minutes
              const isSameSender = prevMsg && prevMsg.sender_id === msg.sender_id;
              let isWithinFiveMinutes = false;
              if (isSameSender) {
                try {
                  const diff = Math.abs(
                    new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()
                  );
                  isWithinFiveMinutes = diff < 5 * 60 * 1000;
                } catch {
                  isWithinFiveMinutes = false;
                }
              }

              const isFirstInGroup = !isSameSender || !isWithinFiveMinutes;

              return (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  currentUserId={currentUserId}
                  currentUserName={currentUserName}
                  isAdmin={isAdmin}
                  isFirstInGroup={isFirstInGroup}
                  onEditMessage={onEditMessage}
                  onDeleteMessage={onDeleteMessage}
                />
              );
            })}
          </div>
        ))}

        <div ref={bottomAnchorRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute right-6 bottom-4 p-2 rounded-full bg-slate-900 text-white shadow-md hover:bg-blue-600 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer z-10"
          title="Scroll to latest"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span className="text-[11px] pr-1">Latest messages</span>
        </button>
      )}
    </div>
  );
}

