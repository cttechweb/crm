'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Hash,
  Lock,
  Users,
  MessageSquare,
  Check,
  Loader2,
} from 'lucide-react';
import { chatApiService } from '@/services/chatApiService';
import type { ChatUser, ChatConversation } from '@/types/chat';
import { cn } from '@/lib/utils';

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversation: ChatConversation) => void;
  defaultTab?: 'direct' | 'channel' | 'group';
  currentUserId?: string;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
  defaultTab = 'direct',
  currentUserId,
}: NewConversationModalProps) {
  const [activeTab, setActiveTab] = useState<'direct' | 'channel' | 'group'>(defaultTab);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Channel form state
  const [channelTitle, setChannelTitle] = useState('');
  const [channelSlug, setChannelSlug] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Group form state
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedGroupMemberIds, setSelectedGroupMemberIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!isOpen) {
      setUserSearch('');
      setChannelTitle('');
      setChannelSlug('');
      setChannelDescription('');
      setIsPrivate(false);
      setSelectedMemberIds([]);
      setGroupTitle('');
      setSelectedGroupMemberIds([]);
      setErrorMsg(null);
      return;
    }

    const loadUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const data = await chatApiService.getAvailableUsers();
        // Filter out self
        const filtered = data.filter((u) => {
          if (!currentUserId) return true;
          const cleanCur = String(currentUserId).toLowerCase().replace('usr_', '');
          const cleanU = String(u.id).toLowerCase().replace('usr_', '');
          return cleanCur !== cleanU;
        });
        setUsers(filtered);
      } catch (err) {
        console.error('Failed to load colleagues', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    loadUsers();
  }, [isOpen, currentUserId]);

  // Auto-generate slug when channel title changes
  const handleTitleChange = (val: string) => {
    setChannelTitle(val);
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setChannelSlug(slugified);
  };

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        (u.department && u.department.toLowerCase().includes(term)) ||
        (u.role && u.role.toLowerCase().includes(term))
    );
  }, [users, userSearch]);

  const handleStartDirect = async (user: ChatUser) => {
    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await chatApiService.createConversation({
        type: 'direct',
        target_user_id: user.id,
        target_user_name: user.name,
        target_user_role: user.role,
        target_user_email: user.email,
      });
      onConversationCreated(res.conversation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start direct conversation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelTitle.trim()) {
      setErrorMsg('Please enter a channel name');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await chatApiService.createConversation({
        type: 'channel',
        title: channelTitle.trim(),
        slug: channelSlug.trim() || undefined,
        description: channelDescription.trim() || undefined,
        is_private: isPrivate,
        member_ids: selectedMemberIds,
      });
      onConversationCreated(res.conversation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupTitle.trim()) {
      setErrorMsg('Please enter a group title');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      const res = await chatApiService.createConversation({
        type: 'group',
        title: groupTitle.trim(),
        member_ids: selectedGroupMemberIds,
      });
      onConversationCreated(res.conversation);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (id: string, isGroupChat = false) => {
    if (isGroupChat) {
      setSelectedGroupMemberIds((prev) =>
        prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
      );
    } else {
      setSelectedMemberIds((prev) =>
        prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
      );
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-2xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900">New Conversation</h3>
            <p className="text-xs text-slate-500">
              Connect with teammates or create collaborative spaces
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => {
              setActiveTab('direct');
              setErrorMsg(null);
            }}
            className={cn(
              'flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer',
              activeTab === 'direct'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Direct Message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('channel');
              setErrorMsg(null);
            }}
            className={cn(
              'flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer',
              activeTab === 'channel'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Create Channel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('group');
              setErrorMsg(null);
            }}
            className={cn(
              'flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer',
              activeTab === 'group'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            )}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Group Chat</span>
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-y-auto min-h-[300px]">
          {/* TAB 1: DIRECT MESSAGE */}
          {activeTab === 'direct' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Find colleague by name or department..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {isLoadingUsers ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs">Loading employees...</span>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No active colleagues match your search.
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredUsers.map((user) => {
                    const hasValidPhoto = user.avatar && !user.avatar.includes('unsplash.com') && !user.avatar.includes('photo-');
                    const badgeColor =
                      user.name.toLowerCase().includes('arafath') ? 'bg-emerald-600' :
                      user.name.toLowerCase().includes('tariq') ? 'bg-blue-600' :
                      user.name.toLowerCase().includes('mustafa') ? 'bg-amber-600' :
                      user.name.toLowerCase().includes('rithul') ? 'bg-purple-600' :
                      user.name.toLowerCase().includes('arshad') ? 'bg-indigo-600' :
                      user.name.toLowerCase().includes('nishad') ? 'bg-teal-600' :
                      'bg-slate-700';

                    return (
                      <button
                        key={user.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleStartDirect(user)}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-blue-50/80 transition-colors text-left cursor-pointer border border-transparent hover:border-blue-100 group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {hasValidPhoto ? (
                            <img
                              src={user.avatar!}
                              alt={user.name}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className={cn("w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold shadow-2xs", badgeColor)}>
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                              {user.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {user.role} {user.department ? `• ${user.department}` : ''}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Chat →
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREATE CHANNEL */}
          {activeTab === 'channel' && (
            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Channel Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={channelTitle}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. sales-ops or general"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                {channelSlug && (
                  <p className="text-[11px] text-slate-400 mt-1">
                    Slug: <span className="font-mono text-slate-600">#{channelSlug}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Topic (optional)
                </label>
                <input
                  type="text"
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isPrivate ? (
                      <Lock className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Hash className="w-4 h-4 text-blue-600" />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {isPrivate ? 'Private Channel' : 'Public Channel'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {isPrivate
                          ? 'Only invited members can view messages and join'
                          : 'Anyone in Cool Technologies can view and join this channel'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={cn(
                      'relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                      isPrivate ? 'bg-amber-600' : 'bg-slate-300'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out',
                        isPrivate ? 'translate-x-4' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Invite Members ({selectedMemberIds.length} selected)
                </label>
                <div className="border border-slate-200 rounded-lg max-h-36 overflow-y-auto divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleMemberSelection(u.id, false)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <span className="font-medium text-slate-800 truncate">{u.name} ({u.role})</span>
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !channelTitle.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREATE GROUP */}
          {activeTab === 'group' && (
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Group Title <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Users className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                    placeholder="e.g. Operations Standup or Dubai Project"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Participants ({selectedGroupMemberIds.length} selected)
                </label>
                <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                  {users.map((u) => {
                    const isSelected = selectedGroupMemberIds.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleMemberSelection(u.id, true)}
                        className="w-full flex items-center justify-between p-2 text-left hover:bg-slate-50 cursor-pointer text-xs"
                      >
                        <span className="font-medium text-slate-800 truncate">{u.name} ({u.role})</span>
                        <div
                          className={cn(
                            'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-300 bg-white'
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !groupTitle.trim()}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

