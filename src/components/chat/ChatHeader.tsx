'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Hash,
  Lock,
  Users,
  UserPlus,
  Info,
  Menu,
  ArrowLeft,
} from 'lucide-react';
import type { ChatConversation } from '@/types/chat';

interface ChatHeaderProps {
  conversation: ChatConversation | null;
  onOpenMembersModal: () => void;
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onDeleteConversation?: (conversationId: string) => void;
}

export function ChatHeader({
  conversation,
  onOpenMembersModal,
  onToggleSidebar,
  onDeleteConversation,
}: ChatHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/dashboard');
      }
    }
  };

  if (!conversation) {
    return (
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer mr-1"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          <span className="text-sm font-semibold text-slate-500">Select a conversation</span>
        </div>
      </header>
    );
  }

  const isChannel = conversation.type === 'channel';
  const isDirect = conversation.type === 'direct';
  const isGroup = conversation.type === 'group';

  const title = isDirect
    ? conversation.other_user?.name || conversation.title || 'Direct Message'
    : conversation.title || (conversation.slug ? `#${conversation.slug}` : 'Conversation');

  const subtitle = isDirect
    ? `${conversation.other_user?.role || 'Staff'}${
        conversation.other_user?.department ? ` • ${conversation.other_user.department}` : ''
      }`
    : conversation.description || (isChannel ? 'Company channel' : `${conversation.members_count || 0} members`);

  return (
    <>
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shadow-2xs z-10">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer shadow-2xs mr-1"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="md:hidden p-1.5 rounded-md hover:bg-slate-100 text-slate-600 flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-shrink-0">
              {isChannel ? (
                conversation.is_private ? (
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                )
              ) : isGroup ? (
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              ) : (
                <div className="relative">
                  {conversation.other_user?.avatar ? (
                    <img
                      src={conversation.other_user.avatar}
                      alt={title}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      {(title || 'U').slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute bottom-0 right-0 ring-2 ring-white" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 truncate">{title}</h1>
                {conversation.is_private && isChannel && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800">
                    Private
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(isChannel || isGroup) && (
            <button
              type="button"
              onClick={onOpenMembersModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              title="View & manage members"
            >
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">{conversation.members_count || conversation.members?.length || 1} members</span>
            </button>
          )}

          {(isChannel || isGroup) && (
            <button
              type="button"
              onClick={onOpenMembersModal}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-100 hover:text-blue-600 border border-slate-200 transition-colors cursor-pointer"
              title="Add members"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

        </div>
      </header>
    </>
  );
}

