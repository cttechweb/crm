'use client';

import React, { useState, useMemo } from 'react';
import {
  Hash,
  Lock,
  Plus,
  Search,
  Users,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  X,
  ArrowLeft,
  Trash2,
} from 'lucide-react';
import type { ChatConversation, ChatUser } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  conversations: ChatConversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onOpenNewModal: (defaultTab?: 'direct' | 'channel') => void;
  onDeleteConversation?: (id: string) => void;
  currentUserId?: string;
  isLoading?: boolean;
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewModal,
  onDeleteConversation,
  currentUserId,
  isLoading = false,
}: ChatSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [directsOpen, setDirectsOpen] = useState(true);
  const [groupsOpen, setGroupsOpen] = useState(true);

  // Group conversations by type
  const { channels, directs, groups } = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const filtered = conversations.filter((c) => {
      if (!term) return true;
      const title = (c.title || '').toLowerCase();
      const slug = (c.slug || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const otherName = (c.other_user?.name || '').toLowerCase();
      const otherEmail = (c.other_user?.email || '').toLowerCase();
      return (
        title.includes(term) ||
        slug.includes(term) ||
        desc.includes(term) ||
        otherName.includes(term) ||
        otherEmail.includes(term)
      );
    });

    const activeDirects = filtered
      .filter((c) => c.type === 'direct')
      .filter((c) => {
        if (c.is_deleted_by_user) return false;
        // WhatsApp behavior: Only show direct chats with real messages, unread count, or currently open
        const hasMessages = Boolean(c.last_message_text);
        const hasUnread = (c.unread_count || 0) > 0;
        const isActive = c.id === activeConversationId;
        return hasMessages || hasUnread || isActive;
      })
      .sort((a, b) => {
        const timeA = new Date(a.last_message_at || a.updated_at || 0).getTime();
        const timeB = new Date(b.last_message_at || b.updated_at || 0).getTime();
        return timeB - timeA;
      });

    return {
      channels: filtered.filter((c) => c.type === 'channel'),
      directs: activeDirects,
      groups: filtered.filter((c) => c.type === 'group'),
    };
  }, [conversations, searchTerm, activeConversationId]);

  const getInitials = (name?: string | null) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatChatTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const now = new Date();
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      }
      const isYesterday =
        new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
      if (isYesterday) return 'Yesterday';

      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <aside className="w-72 md:w-80 flex-shrink-0 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-full select-none">
      {/* Top Header / Actions */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide leading-tight">
              CoolTech Chat
            </h2>
            <p className="text-[11px] text-slate-400">Team Collaboration</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/dashboard';
                }
              }
            }}
            title="Back to CRM Dashboard"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onOpenNewModal('direct')}
            title="New conversation"
            className="p-1.5 rounded-md bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 transition-colors cursor-pointer border border-slate-700/60"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/60">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search channels or colleagues..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-md pl-8 pr-7 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable Conversation Lists */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
        {isLoading && conversations.length === 0 ? (
          <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-800/80 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-800/80 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-slate-800/80 rounded animate-pulse w-5/6" />
          </div>
        ) : (
          <>
            {/* CHANNELS SECTION */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-slate-400 hover:text-slate-200">
                <button
                  type="button"
                  onClick={() => setChannelsOpen(!channelsOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
                >
                  {channelsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>Channels</span>
                  <span className="text-[10px] text-slate-500">({channels.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNewModal('channel')}
                  title="Add or browse channel"
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {channelsOpen && (
                <div className="mt-1 space-y-0.5">
                  {channels.length === 0 ? (
                    <p className="px-3 py-1.5 text-[11px] text-slate-500 italic">No channels found</p>
                  ) : (
                    channels.map((c) => {
                      const isActive = c.id === activeConversationId;
                      const hasUnread = (c.unread_count || 0) > 0;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectConversation(c.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer group',
                            isActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : hasUnread
                              ? 'text-white font-semibold bg-slate-800/80 hover:bg-slate-800'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {c.is_private ? (
                              <Lock className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                            ) : (
                              <Hash className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'text-white' : hasUnread ? 'text-[#25D366]' : 'text-slate-400')} />
                            )}
                            <span className={cn('truncate', hasUnread ? 'font-bold text-white' : '')}>
                              {c.title || c.slug || 'channel'}
                            </span>
                          </div>

                          {hasUnread && (
                            <span
                              className={cn(
                                'ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-black leading-none flex-shrink-0 min-w-[20px] text-center shadow-xs',
                                isActive ? 'bg-white text-blue-700' : 'bg-[#25D366] text-white animate-pulse'
                              )}
                            >
                              {c.unread_count}
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* DIRECT MESSAGES SECTION */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 text-slate-400 hover:text-slate-200">
                <button
                  type="button"
                  onClick={() => setDirectsOpen(!directsOpen)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
                >
                  {directsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                  <span>Direct Messages</span>
                  <span className="text-[10px] text-slate-500">({directs.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenNewModal('direct')}
                  title="Start direct message"
                  className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {directsOpen && (
                <div className="mt-1 space-y-1">
                  {directs.length === 0 ? (
                    <p className="px-3 py-1.5 text-[11px] text-slate-500 italic">No direct messages yet</p>
                  ) : (
                    directs.map((c) => {
                      const isActive = c.id === activeConversationId;
                      const hasUnread = (c.unread_count || 0) > 0;
                      const displayName = c.other_user?.name || c.title || 'Colleague';
                      const role = c.other_user?.role || 'Staff';
                      const timeStr = formatChatTime(c.last_message_at);
                      const snippet = c.last_message_text || role;

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectConversation(c.id)}
                          className={cn(
                            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer group relative',
                            isActive
                              ? 'bg-blue-600 text-white font-semibold shadow-xs'
                              : hasUnread
                              ? 'bg-slate-800/90 hover:bg-slate-800 text-white shadow-xs ring-1 ring-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          )}
                        >
                          {/* Avatar with online indicator */}
                          <div className="relative flex-shrink-0">
                            {c.other_user?.avatar ? (
                              <img
                                src={c.other_user.avatar}
                                alt={displayName}
                                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center text-[11px] font-bold ring-1 ring-slate-600">
                                {getInitials(displayName)}
                              </div>
                            )}
                            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-1.5 ring-slate-900" />
                          </div>

                          {/* Message sender & preview snippet */}
                          <div className="flex-1 min-w-0 pr-0.5">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span
                                className={cn(
                                  'text-xs truncate block',
                                  hasUnread || isActive ? 'font-bold text-white' : 'font-medium text-slate-200'
                                )}
                              >
                                {displayName}
                              </span>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {onDeleteConversation && (
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (window.confirm(`Delete chat with ${displayName}?`)) {
                                        onDeleteConversation(c.id);
                                      }
                                    }}
                                    title="Delete chat"
                                    className="opacity-70 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                {timeStr && (
                                  <span
                                    className={cn(
                                      'text-[10px] flex-shrink-0',
                                      isActive
                                        ? 'text-blue-200'
                                        : hasUnread
                                        ? 'text-emerald-400 font-semibold'
                                        : 'text-slate-400'
                                    )}
                                  >
                                    {timeStr}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <p
                                className={cn(
                                  'text-[11px] truncate leading-tight',
                                  isActive
                                    ? 'text-blue-100'
                                    : hasUnread
                                    ? 'text-slate-200 font-medium'
                                    : 'text-slate-400'
                                )}
                              >
                                {snippet}
                              </p>
                              {hasUnread && (
                                <span
                                  className={cn(
                                    'ml-1.5 px-2 py-0.5 rounded-full text-[11px] font-black leading-none flex-shrink-0 min-w-[20px] text-center shadow-xs',
                                    isActive
                                      ? 'bg-white text-blue-700'
                                      : 'bg-[#25D366] text-white animate-pulse'
                                  )}
                                >
                                  {c.unread_count}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* GROUP CONVERSATIONS SECTION */}
            {groups.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-2 py-1 text-slate-400 hover:text-slate-200">
                  <button
                    type="button"
                    onClick={() => setGroupsOpen(!groupsOpen)}
                    className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-white cursor-pointer"
                  >
                    {groupsOpen ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                    <span>Group Chats</span>
                    <span className="text-[10px] text-slate-500">({groups.length})</span>
                  </button>
                </div>

                {groupsOpen && (
                  <div className="mt-1 space-y-0.5">
                    {groups.map((c) => {
                      const isActive = c.id === activeConversationId;
                      const hasUnread = (c.unread_count || 0) > 0;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => onSelectConversation(c.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors cursor-pointer group',
                            isActive
                              ? 'bg-blue-600 text-white font-semibold'
                              : hasUnread
                              ? 'text-white font-semibold bg-slate-800/60 hover:bg-slate-800'
                              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Users className={cn('w-3.5 h-3.5 flex-shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                            <span className="truncate">{c.title || 'Group Chat'}</span>
                          </div>

                          {hasUnread && (
                            <span
                              className={cn(
                                'ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold leading-tight flex-shrink-0',
                                isActive ? 'bg-white text-blue-700' : 'bg-blue-500 text-white'
                              )}
                            >
                              {c.unread_count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Sidebar Footer: Quick status */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
          <span>Connected</span>
        </div>
        <span className="text-[10px] text-slate-500">Cloudflare Workers Real-Time</span>
      </div>
    </aside>
  );
}

