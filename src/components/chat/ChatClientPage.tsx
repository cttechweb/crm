'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatMessageComposer } from '@/components/chat/ChatMessageComposer';
import { NewConversationModal } from '@/components/chat/NewConversationModal';
import { ConversationMembersModal } from '@/components/chat/ConversationMembersModal';
import { chatApiService } from '@/services/chatApiService';
import { authMockService } from '@/services/authMockService';
import type {
  ChatConversation,
  ChatMessage,
  ChatSocketEvent,
} from '@/types/chat';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('c');

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationParam);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Modals and mobile responsive sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalTab, setNewModalTab] = useState<'direct' | 'channel' | 'group'>('direct');
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  // Auth User
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const socketCleanupRef = useRef<(() => void) | null>(null);
  const typingTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Load conversations list
  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingConversations(true);
    try {
      const list = await chatApiService.getConversations();
      setConversations(list);

      // If active conversation is not selected yet, pick from query param or default to #general or first
      setActiveConversationId((prevActive) => {
        if (prevActive && list.some((c) => c.id === prevActive && !c.is_deleted_by_user)) {
          return prevActive;
        }
        if (conversationParam && list.some((c) => c.id === conversationParam && !c.is_deleted_by_user)) {
          return conversationParam;
        }
        const general = list.find((c) => c.slug === 'general');
        if (general) return general.id;
        return list[0]?.id || null;
      });
    } catch (err) {
      console.warn('Failed to load conversations', err);
    } finally {
      if (!silent) setIsLoadingConversations(false);
    }
  }, [conversationParam]);

  useEffect(() => {
    setIsMounted(true);
    const user = authMockService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    const handleAuthChanged = () => {
      const freshUser = authMockService.getCurrentUser();
      if (freshUser) {
        setCurrentUser(freshUser);
        loadConversations();
      }
    };

    window.addEventListener('crm_auth_updated', handleAuthChanged);
    return () => {
      window.removeEventListener('crm_auth_updated', handleAuthChanged);
    };
  }, [loadConversations]);

  const currentUserId = currentUser?.id || currentUser?.uid;
  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'super_admin' ||
    Boolean(currentUser?.isAdmin);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Sync active conversation object
  useEffect(() => {
    if (!activeConversationId) {
      setActiveConversation(null);
      return;
    }
    const found = conversations.find((c) => c.id === activeConversationId);
    if (found) {
      setActiveConversation(found);
    } else {
      chatApiService
        .getConversation(activeConversationId)
        .then((c) => {
          if (c) setActiveConversation(c);
        })
        .catch(() => {});
    }
  }, [activeConversationId, conversations]);

  // Load messages for active conversation
  const loadMessages = useCallback(
    async (conversationId: string) => {
      // 1. Instantly display locally stored messages (0ms delay)
      const cached = chatApiService.getLocalMessages(conversationId);
      if (cached && cached.length > 0) {
        setMessages(cached);
        setIsLoadingMessages(false);
      } else {
        setIsLoadingMessages(true);
      }

      try {
        const { messages: fetched, hasMore: more } = await chatApiService.getMessages(conversationId, {
          limit: 50,
        });
        if (fetched) {
          setMessages(fetched);
          setHasMore(more);
        }

        // Mark as read and clear unread badge in conversation state
        chatApiService.markRead(conversationId);
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
        );
      } catch (err) {
        console.warn('Failed to sync messages', err);
      } finally {
        setIsLoadingMessages(false);
      }
    },
    []
  );

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
      setTypingUsers([]);
    } else {
      setMessages([]);
    }
  }, [activeConversationId, loadMessages]);

  // Load older messages (pagination)
  const handleLoadMore = async () => {
    if (!activeConversationId || isLoadingMore || !hasMore || messages.length === 0) return;
    setIsLoadingMore(true);
    try {
      const earliestMessage = messages[0];
      const { messages: older, hasMore: more } = await chatApiService.getMessages(activeConversationId, {
        limit: 50,
        before: earliestMessage.created_at,
      });

      setMessages((prev) => [...older, ...prev]);
      setHasMore(more);
    } catch (err) {
      console.warn('Failed to load older messages', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle incoming socket events
  const handleSocketEvent = useCallback(
    (event: ChatSocketEvent) => {
      if (event.type === 'new_message' && event.message) {
        const msg = event.message;
        if (msg.conversation_id === activeConversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // Auto-mark read
          chatApiService.markRead(msg.conversation_id);
        } else {
          // Bump unread count on conversation
          setConversations((prev) =>
            prev.map((c) =>
              c.id === msg.conversation_id
                ? {
                    ...c,
                    unread_count: (c.unread_count || 0) + 1,
                    last_message_text: msg.message_text,
                    last_message_at: msg.created_at,
                  }
                : c
            )
          );
        }
      } else if (event.type === 'message_edited' && event.messageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === event.messageId
              ? {
                  ...m,
                  message_text: event.messageText || m.message_text,
                  is_edited: true,
                  edited_at: new Date().toISOString(),
                }
              : m
          )
        );
      } else if (event.type === 'message_deleted' && event.messageId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === event.messageId
              ? {
                  ...m,
                  is_deleted: true,
                  deleted_at: new Date().toISOString(),
                }
              : m
          )
        );
      } else if (event.type === 'typing' && event.conversationId === activeConversationId) {
        const userName = event.userName || 'Someone';
        const userId = event.userId || '';
        if (userId === currentUserId) return;

        if (event.isTyping) {
          setTypingUsers((prev) => (prev.includes(userName) ? prev : [...prev, userName]));

          if (typingTimerRef.current[userName]) {
            clearTimeout(typingTimerRef.current[userName]);
          }
          typingTimerRef.current[userName] = setTimeout(() => {
            setTypingUsers((prev) => prev.filter((u) => u !== userName));
          }, 3000);
        } else {
          setTypingUsers((prev) => prev.filter((u) => u !== userName));
        }
      }
    },
    [activeConversationId, currentUserId]
  );

  // Setup live WebSocket connection with active conversation
  useEffect(() => {
    if (socketCleanupRef.current) {
      socketCleanupRef.current();
      socketCleanupRef.current = null;
    }

    if (activeConversationId) {
      socketCleanupRef.current = chatApiService.connectWebSocket(
        activeConversationId,
        handleSocketEvent
      );
    }

    return () => {
      if (socketCleanupRef.current) {
        socketCleanupRef.current();
        socketCleanupRef.current = null;
      }
    };
  }, [activeConversationId, handleSocketEvent]);

  // Real-time inter-tab & broadcast message listener
  useEffect(() => {
    const handleReceived = (e: any) => {
      const msg: ChatMessage = e.detail;
      if (!msg) return;
      if (msg.conversation_id === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        chatApiService.markRead(msg.conversation_id);
      } else {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === msg.conversation_id
              ? {
                  ...c,
                  unread_count: (c.unread_count || 0) + 1,
                  last_message_text: msg.message_text,
                  last_message_at: msg.created_at,
                }
              : c
          )
        );
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'cooltech_chat_cross_tab_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.message) handleReceived({ detail: parsed.message });
        } catch {}
      }
    };

    window.addEventListener('cooltech_chat_message_received', handleReceived);
    window.addEventListener('storage', handleStorage);

    const handleReadUpdated = (e: any) => {
      const convId = e?.detail?.conversationId;
      if (convId) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
        );
      }
    };
    window.addEventListener('cooltech_chat_read_updated', handleReadUpdated);

    const handleConversationDeleted = (e: any) => {
      const convId = e?.detail?.conversationId;
      if (convId) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (activeConversationId === convId) {
          setMessages([]);
          setActiveConversationId('conv_channel_general');
        }
      }
    };
    window.addEventListener('cooltech_chat_conversation_deleted', handleConversationDeleted);

    return () => {
      window.removeEventListener('cooltech_chat_message_received', handleReceived);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cooltech_chat_read_updated', handleReadUpdated);
      window.removeEventListener('cooltech_chat_conversation_deleted', handleConversationDeleted);
    };
  }, [activeConversationId]);

  // Periodic poll fallback (4s) for high reliability across environments
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeConversationId) {
        chatApiService
          .getMessages(activeConversationId, { limit: 30 })
          .then(({ messages: latest }) => {
            if (!latest) return;
            setMessages((prev) => {
              const existingIds = new Set(prev.map((m) => m.id));
              const fresh = latest.filter((m) => !existingIds.has(m.id));
              if (fresh.length > 0) {
                return [...prev, ...fresh];
              }
              let updated = false;
              const merged = prev.map((oldMsg) => {
                const matched = latest.find((l) => l.id === oldMsg.id);
                if (
                  matched &&
                  (matched.is_edited !== oldMsg.is_edited ||
                    matched.is_deleted !== oldMsg.is_deleted ||
                    matched.message_text !== oldMsg.message_text)
                ) {
                  updated = true;
                  return matched;
                }
                return oldMsg;
              });
              return updated ? merged : prev;
            });
          })
          .catch(() => {});
      }
      loadConversations(true);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeConversationId, loadConversations]);

  // Switch conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setIsMobileSidebarOpen(false);
    try {
      window.history.replaceState(null, '', `/chat?c=${encodeURIComponent(id)}`);
    } catch {
      router.replace(`/chat?c=${encodeURIComponent(id)}`, { scroll: false });
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await chatApiService.deleteConversation(conversationId);
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (activeConversationId === conversationId) {
        setMessages([]);
        const general = conversations.find((c) => c.slug === 'general');
        const nextId = general ? general.id : 'conv_channel_general';
        setActiveConversationId(nextId);
        try {
          window.history.replaceState(null, '', `/chat?c=${encodeURIComponent(nextId)}`);
        } catch {
          router.replace(`/chat?c=${encodeURIComponent(nextId)}`, { scroll: false });
        }
      }
    } catch (err) {
      console.warn('Failed to delete conversation', err);
    }
  };

  // Send message
  const handleSendMessage = async (text: string) => {
    if (!activeConversationId) return;
    try {
      const sent = await chatApiService.sendMessage(activeConversationId, {
        message_text: text,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId
            ? {
                ...c,
                last_message_text: sent.message_text,
                last_message_at: sent.created_at,
              }
            : c
        )
      );
    } catch (err) {
      console.warn('Failed to send message', err);
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!activeConversationId) return;
    try {
      const edited = await chatApiService.editMessage(activeConversationId, messageId, newText);
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? edited : m))
      );
    } catch (err) {
      console.warn('Failed to edit message', err);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversationId) return;
    try {
      await chatApiService.deleteMessage(activeConversationId, messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_deleted: true, deleted_at: new Date().toISOString() } : m
        )
      );
    } catch (err) {
      console.warn('Failed to delete message', err);
    }
  };

  // Dispatch typing
  const handleSendTyping = (isTyping: boolean) => {
    if (!activeConversationId) return;
    chatApiService.sendTypingIndicator(activeConversationId, isTyping);
  };

  // Trigger modal
  const handleOpenNewModal = (defaultTab: 'direct' | 'channel' | 'group' = 'direct') => {
    setNewModalTab(defaultTab);
    setIsNewModalOpen(true);
  };

  // On conversation created from modal
  const handleConversationCreated = (conv: ChatConversation) => {
    setConversations((prev) => {
      if (prev.some((c) => c.id === conv.id)) return prev;
      return [conv, ...prev];
    });
    handleSelectConversation(conv.id);
  };

  if (!isMounted) {
    return (
      <div className="h-[calc(100vh-140px)] min-h-[500px] w-full rounded-xl bg-white border border-slate-200 p-8 flex items-center justify-center text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-xs font-semibold">Loading CoolTech Chat...</span>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] min-h-[500px] w-full rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-row relative">
      {/* Mobile Sidebar Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="md:hidden fixed inset-0 z-30 bg-black/40 backdrop-blur-2xs"
        />
      )}

      {/* Sidebar: Fixed on desktop, Drawer on mobile */}
      <div
        className={`fixed md:relative inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onOpenNewModal={handleOpenNewModal}
          onDeleteConversation={handleDeleteConversation}
          currentUserId={currentUserId}
          isLoading={isLoadingConversations}
        />
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <ChatHeader
          conversation={activeConversation}
          onOpenMembersModal={() => setIsMembersModalOpen(true)}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          isSidebarOpen={isMobileSidebarOpen}
          onDeleteConversation={handleDeleteConversation}
        />

        <ChatMessageList
          conversation={activeConversation}
          messages={messages}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isLoading={isLoadingMessages}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
        />

        {activeConversation && (
          <ChatMessageComposer
            conversationTitle={
              activeConversation.type === 'direct'
                ? activeConversation.other_user?.name || activeConversation.title || 'chat'
                : activeConversation.title || `#${activeConversation.slug || 'channel'}`
            }
            onSendMessage={handleSendMessage}
            onSendTyping={handleSendTyping}
            typingUsers={typingUsers}
          />
        )}
      </div>

      {/* Dialog Modals */}
      <NewConversationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onConversationCreated={handleConversationCreated}
        defaultTab={newModalTab}
        currentUserId={currentUserId}
      />

      <ConversationMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        conversation={activeConversation}
        currentUserId={currentUserId}
        onMemberChanged={() => {
          if (activeConversationId) {
            chatApiService
              .getConversation(activeConversationId)
              .then((c) => {
                if (c) setActiveConversation(c);
              })
              .catch(() => {});
            loadConversations(true);
          }
        }}
      />
    </div>
  );
}

export function ChatClientPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[calc(100vh-140px)] min-h-[500px] w-full rounded-xl bg-white border border-slate-200 p-8 flex items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-xs font-semibold">Loading CoolTech Chat...</span>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}

