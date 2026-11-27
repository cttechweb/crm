'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserPlus,
  ShieldCheck,
  UserMinus,
  LogOut,
  Loader2,
  Check,
} from 'lucide-react';
import { chatApiService } from '@/services/chatApiService';
import type { ChatConversation, ChatMember, ChatUser } from '@/types/chat';
import { cn } from '@/lib/utils';

interface ConversationMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: ChatConversation | null;
  currentUserId?: string;
  onMemberChanged: () => void;
}

export function ConversationMembersModal({
  isOpen,
  onClose,
  conversation,
  currentUserId,
  onMemberChanged,
}: ConversationMembersModalProps) {
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDirect = conversation?.type === 'direct';

  const myMembership = members.find(
    (m) =>
      m.user_id === currentUserId ||
      `usr_${m.user_id}` === currentUserId ||
      m.user_id === (currentUserId || '').replace('usr_', '')
  );

  const canManage =
    myMembership?.role === 'owner' ||
    myMembership?.role === 'admin' ||
    conversation?.created_by === currentUserId;

  useEffect(() => {
    if (!isOpen || !conversation) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        // Refresh conversation details to get current members
        const fresh = await chatApiService.getConversation(conversation.id);
        const currentMemberList = fresh?.members || conversation.members || [];
        setMembers(currentMemberList);

        // Load available users to add
        const allUsers = await chatApiService.getAvailableUsers();
        const existingMemberUserIds = new Set(
          currentMemberList.map((m) => m.user_id.replace('usr_', ''))
        );
        const notMembers = allUsers.filter(
          (u) => !existingMemberUserIds.has(u.id.replace('usr_', ''))
        );
        setAvailableUsers(notMembers);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load members');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, conversation]);

  const handleAddMember = async () => {
    if (!conversation || !selectedUserId) return;
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await chatApiService.addMember(conversation.id, selectedUserId);
      setSelectedUserId('');
      onMemberChanged();
      // Reload
      const fresh = await chatApiService.getConversation(conversation.id);
      if (fresh?.members) setMembers(fresh.members);
      setAvailableUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!conversation) return;
    if (!window.confirm('Remove this member from the conversation?')) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await chatApiService.removeMember(conversation.id, userId);
      onMemberChanged();
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeaveConversation = async () => {
    if (!conversation || !currentUserId) return;
    if (!window.confirm('Are you sure you want to leave this conversation?')) return;

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await chatApiService.removeMember(conversation.id, currentUserId);
      onMemberChanged();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to leave conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {conversation.title || 'Conversation'} Members
              </h3>
              <p className="text-[11px] text-slate-500">
                {members.length} {members.length === 1 ? 'person' : 'people'} in this conversation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-4 mt-3 p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Add Member form (if authorized and not a direct chat) */}
        {!isDirect && canManage && (
          <div className="p-3 border-b border-slate-100 bg-blue-50/40">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Add colleague to channel
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded-md text-xs text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="">Select a teammate...</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddMember}
                disabled={!selectedUserId || isSubmitting}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}

        {/* Member Roster List */}
        <div className="p-3 flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 mb-2" />
              <span className="text-xs">Loading members...</span>
            </div>
          ) : (
            members.map((member) => {
              const displayName = member.full_name || member.email || 'Member';
              const isSelf =
                member.user_id === currentUserId ||
                `usr_${member.user_id}` === currentUserId;

              return (
                <div
                  key={member.id || member.user_id}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 rounded-lg group"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {member.avatar_image ? (
                      <img
                        src={member.avatar_image}
                        alt={displayName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold">
                        {getInitials(displayName)}
                      </div>
                    )}

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {displayName}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] text-slate-400 font-normal">
                            (You)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {member.designation || member.role_name || 'Staff'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                        member.role === 'owner'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : member.role === 'admin'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      )}
                    >
                      {member.role}
                    </span>

                    {!isDirect && canManage && !isSelf && member.role !== 'owner' && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.user_id)}
                        disabled={isSubmitting}
                        title="Remove member"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Actions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {!isDirect && (
            <button
              type="button"
              onClick={handleLeaveConversation}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Leave channel</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

