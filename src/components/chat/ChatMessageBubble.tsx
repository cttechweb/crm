'use client';

import React, { useState } from 'react';
import {
  MoreHorizontal,
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
  isAdmin?: boolean;
  onEditMessage: (messageId: string, newText: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  isFirstInGroup?: boolean;
}

export function ChatMessageBubble({
  message,
  currentUserId,
  isAdmin = false,
  onEditMessage,
  onDeleteMessage,
  isFirstInGroup = true,
}: ChatMessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.message_text);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthor = Boolean(
    currentUserId &&
    (message.sender_id === currentUserId ||
      message.sender_id === `usr_${currentUserId}` ||
      `usr_${message.sender_id}` === currentUserId)
  );

  const canEdit = isAuthor && !message.is_deleted;
  const canDelete = !message.is_deleted;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.message_text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
    setMenuOpen(false);
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
    (liveAvatar && !liveAvatar.includes('unsplash') && !liveAvatar.includes('photo-'))
      ? liveAvatar
      : (message.sender_avatar || liveAvatar);

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-4 py-1.5 hover:bg-slate-50 transition-colors',
        isFirstInGroup ? 'mt-2' : 'mt-0.5'
      )}
    >
      {/* Avatar (only rendered on first in group) */}
      <div className="w-9 flex-shrink-0">
        {isFirstInGroup ? (
          effectiveAvatar ? (
            <img
              src={effectiveAvatar}
              alt={message.sender_name}
              className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {getInitials(message.sender_name)}
            </div>
          )
        ) : (
          <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pl-1">
            {formatTime(message.created_at)}
          </span>
        )}
      </div>

      {/* Message content */}
      <div className="flex-1 min-w-0">
        {isFirstInGroup && (
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-slate-900">
              {message.sender_name || 'CRM Staff'}
            </span>
            {message.sender_role && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                {message.sender_role}
              </span>
            )}
            <span className="text-[11px] text-slate-400">
              {formatTime(message.created_at)}
            </span>
          </div>
        )}

        {/* Message Body or Edit Field */}
        {isEditing ? (
          <div className="mt-1 space-y-2 max-w-2xl">
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
              rows={3}
              className="w-full text-xs text-slate-900 border border-blue-400 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setEditText(message.message_text);
                }}
                disabled={isSaving}
                className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <span className="text-[11px] text-slate-400 ml-1">
                Press Enter to save, Esc to cancel
              </span>
            </div>
          </div>
        ) : message.is_deleted ? (
          <p className="text-xs italic text-slate-400 select-none">
            This message was deleted
          </p>
        ) : (
          <div className="text-xs text-slate-800 leading-relaxed break-words whitespace-pre-wrap">
            {message.message_text}
            {message.is_edited && (
              <span className="text-[10px] text-slate-400 ml-1 select-none">
                (edited)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Menu on Hover */}
      {!message.is_deleted && !isEditing && (
        <div className="absolute right-4 -top-3 hidden group-hover:flex items-center gap-0.5 bg-white border border-slate-200 rounded-md shadow-xs px-1 py-0.5 z-10">
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied' : 'Copy message'}
            className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              title="Edit message"
              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete message"
              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

