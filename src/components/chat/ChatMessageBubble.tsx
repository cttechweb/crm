'use client';

import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  Copy,
  Check,
  CheckCheck,
} from 'lucide-react';
import type { ChatMessage } from '@/types/chat';
import { cn } from '@/lib/utils';
import { getLiveUserAvatar } from '@/services/chatApiService';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  currentUserId?: string;
  currentUserName?: string;
  isAdmin?: boolean;
  onEditMessage: (messageId: string, newText: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  isFirstInGroup?: boolean;
}

export function ChatMessageBubble({
  message,
  currentUserId,
  currentUserName,
  isAdmin = false,
  onEditMessage,
  onDeleteMessage,
  isFirstInGroup = true,
}: ChatMessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message_text);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine if this message was sent by the current viewer
  const isAuthor = Boolean(
    (currentUserId &&
      (message.sender_id === currentUserId ||
        message.sender_id === `usr_${currentUserId}` ||
        `usr_${message.sender_id}` === currentUserId ||
        (currentUserId.replace(/^usr_/, '') !== '' &&
          currentUserId.replace(/^usr_/, '') === (message.sender_id || '').replace(/^usr_/, '')))) ||
    (currentUserName &&
      message.sender_name &&
      currentUserName.trim().toLowerCase() === message.sender_name.trim().toLowerCase())
  );

  const canEdit = isAuthor && !message.is_deleted;
  const canDelete = !message.is_deleted && (isAuthor || isAdmin);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveEdit = async () => {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === message.message_text) {
      setIsEditing(false);
      return;
    }

    try {
      setIsSaving(true);
      await onEditMessage(message.id, trimmed);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to edit message', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await onDeleteMessage(message.id);
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const liveAvatar = getLiveUserAvatar(message.sender_name, undefined, message.sender_id);
  const effectiveAvatar =
    liveAvatar && !liveAvatar.includes('unsplash') && !liveAvatar.includes('photo-')
      ? liveAvatar
      : message.sender_avatar || liveAvatar;

  // ==========================================
  // CASE 1: OUTGOING MESSAGE (SENT BY CURRENT USER)
  // WhatsApp Style: Right-aligned, Soft Green Bubble, NO avatar, NO name badge!
  // ==========================================
  if (isAuthor) {
    return (
      <div
        className={cn(
          'group relative flex justify-end px-3 sm:px-5 py-0.5',
          isFirstInGroup ? 'mt-2' : 'mt-0.5'
        )}
      >
        <div className="relative max-w-[82%] sm:max-w-[70%] min-w-[90px]">
          {/* Outgoing Message Bubble (WhatsApp Web green palette) */}
          <div
            className={cn(
              'relative px-3 py-2 rounded-2xl rounded-tr-xs shadow-2xs transition-shadow',
              message.is_deleted
                ? 'bg-slate-100 border border-slate-200 text-slate-500'
                : 'bg-[#DCF8C6] dark:bg-[#005c4b] border border-[#c4eeb0] dark:border-[#005c4b] text-slate-900 dark:text-slate-100'
            )}
          >
            {isEditing ? (
              <div className="space-y-2 min-w-[240px]">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    } else if (e.key === 'Escape') {
                      setIsEditing(false);
                      setEditText(message.message_text);
                    }
                  }}
                  rows={2}
                  className="w-full text-xs text-slate-900 bg-white border border-emerald-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.message_text);
                    }}
                    disabled={isSaving}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                    className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : message.is_deleted ? (
              <p className="text-xs italic text-slate-400 select-none">
                This message was deleted
              </p>
            ) : (
              <div className="flex flex-col gap-0.5">
                <div className="text-xs leading-relaxed break-words whitespace-pre-wrap pr-1">
                  {message.message_text}
                  {message.is_edited && (
                    <span className="text-[10px] text-slate-500 ml-1 select-none">
                      (edited)
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-500 select-none self-end mt-0.5">
                  <span>{formatTime(message.created_at)}</span>
                  <CheckCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            )}
          </div>

          {/* Floating Actions on Hover (Outgoing) */}
          {!message.is_deleted && !isEditing && (
            <div className="absolute -top-3 left-0 -translate-x-1/2 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-xs px-1 py-0.5 z-10">
              <button
                type="button"
                onClick={handleCopy}
                title={copied ? 'Copied' : 'Copy'}
                className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              </button>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit"
                  className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  title="Delete"
                  className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // CASE 2: INCOMING MESSAGE (COLLEAGUE, E.G. TARIQ)
  // WhatsApp Style: Left-aligned, Colleague's Avatar, Name & Role Badge, White Card Bubble
  // ==========================================
  return (
    <div
      className={cn(
        'group relative flex items-start gap-2.5 px-3 sm:px-5 py-0.5 justify-start',
        isFirstInGroup ? 'mt-2' : 'mt-0.5'
      )}
    >
      {/* Colleague's Profile Photo */}
      <div className="w-8 flex-shrink-0">
        {isFirstInGroup ? (
          effectiveAvatar ? (
            <img
              src={effectiveAvatar}
              alt={message.sender_name}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {getInitials(message.sender_name)}
            </div>
          )
        ) : (
          <div className="w-8 h-8" />
        )}
      </div>

      {/* Message content */}
      <div className="relative max-w-[82%] sm:max-w-[70%] min-w-[90px]">
        {/* Colleague's Name and Designation Badge (only on first in group) */}
        {isFirstInGroup && (
          <div className="flex items-center gap-1.5 mb-1 px-0.5">
            <span className="text-xs font-bold text-slate-900">
              {message.sender_name || 'CRM Staff'}
            </span>
            {message.sender_role && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                {message.sender_role}
              </span>
            )}
          </div>
        )}

        {/* Incoming Bubble (White card) */}
        <div
          className={cn(
            'relative px-3 py-2 rounded-2xl rounded-tl-xs shadow-2xs transition-shadow',
            message.is_deleted
              ? 'bg-slate-100 border border-slate-200 text-slate-500'
              : 'bg-white border border-slate-200/90 text-slate-900'
          )}
        >
          {message.is_deleted ? (
            <p className="text-xs italic text-slate-400 select-none">
              This message was deleted
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              <div className="text-xs leading-relaxed break-words whitespace-pre-wrap text-slate-800 pr-1">
                {message.message_text}
                {message.is_edited && (
                  <span className="text-[10px] text-slate-400 ml-1 select-none">
                    (edited)
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 select-none self-end mt-0.5">
                <span>{formatTime(message.created_at)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Floating Actions on Hover (Incoming) */}
        {!message.is_deleted && (
          <div className="absolute -top-3 right-0 translate-x-1/2 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-xs px-1 py-0.5 z-10">
            <button
              type="button"
              onClick={handleCopy}
              title={copied ? 'Copied' : 'Copy'}
              className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            </button>
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                title="Delete"
                className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
