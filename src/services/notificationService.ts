'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/apiClient';
import { MockAuthUser } from './authMockService';

export interface CrmNotification {
  id: string;
  recipientId?: string | null;
  recipientRole?: string | null;
  title: string;
  message: string;
  type: 'msrf' | 'shortage' | 'po' | 'grn' | 'approval' | 'closure' | 'stock_available' | 'info' | 'chat';
  linkUrl?: string | null;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'cool_tech_crm_notifications_cache';

/**
 * Synchronizes chat unread messages with CRM notifications cache.
 */
export function syncChatNotifications(currentUser: MockAuthUser | null) {
  if (typeof window === 'undefined' || !currentUser) return;
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    let notifs: CrmNotification[] = cached ? JSON.parse(cached) : [];
    let changed = false;

    const convRaw =
      localStorage.getItem(`cooltech_chat_conversations_${currentUser.id}`) ||
      localStorage.getItem('cooltech_chat_conversations');
    const convs: any[] = convRaw ? JSON.parse(convRaw) : [];

    for (const conv of convs) {
      const convId = conv.id;
      const lastReadStr =
        localStorage.getItem(`cooltech_chat_last_read_${currentUser.id}_${convId}`) || '1970-01-01';
      const lastReadTime = new Date(lastReadStr).getTime();

      const msgsRaw = localStorage.getItem(`cooltech_chat_messages_${convId}`);
      if (!msgsRaw) continue;
      const msgs: any[] = JSON.parse(msgsRaw);
      if (!Array.isArray(msgs)) continue;

      for (const m of msgs) {
        if (m.is_deleted || m.sender_id === currentUser.id) continue;
        const msgTime = new Date(m.created_at).getTime();
        const notifId = `notif_chat_${m.id}`;
        const existingIdx = notifs.findIndex(
          (n) => n.id === notifId || (n.metadata?.messageId && n.metadata.messageId === m.id)
        );

        if (msgTime <= lastReadTime) {
          // Conversation message was read; clear / mark read
          if (existingIdx !== -1 && !notifs[existingIdx].isRead) {
            notifs[existingIdx] = { ...notifs[existingIdx], isRead: true };
            changed = true;
          }
        } else {
          // Unread message: ensure notification exists
          if (existingIdx === -1) {
            notifs.unshift({
              id: notifId,
              recipientId: currentUser.id,
              recipientRole: currentUser.role,
              title: `New message from ${m.sender_name || 'Colleague'}`,
              message: m.message_text,
              type: 'chat',
              linkUrl: `/chat?c=${convId}`,
              isRead: false,
              metadata: { conversationId: convId, messageId: m.id },
              createdAt: m.created_at,
            });
            changed = true;
          } else if (notifs[existingIdx].isRead) {
            notifs[existingIdx] = { ...notifs[existingIdx], isRead: false };
            changed = true;
          }
        }
      }
    }

    if (changed) {
      notifs.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifs));
    }
  } catch (err) {
    console.warn('Failed to sync chat notifications:', err);
  }
}

export const notificationService = {
  /**
   * Fetches live notifications targeted at the current authenticated user.
   */
  async getNotifications(user: MockAuthUser | null): Promise<{
    notifications: CrmNotification[];
    unreadCount: number;
  }> {
    syncChatNotifications(user);

    const userId = user?.id || '';
    const userName = user?.name || '';
    const role = user?.role || '';
    const department = user?.department || '';

    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (userName) params.append('userName', userName);
    if (role) params.append('role', role);
    if (department) params.append('department', department);

    try {
      const res = await apiClient.get<{
        success: boolean;
        notifications: any[];
        unreadCount: number;
      }>(`/api/notifications?${params.toString()}`, { requireAuth: false });

      if (res.success && Array.isArray(res.notifications)) {
        const mapped: CrmNotification[] = res.notifications.map((n) => ({
          id: n.id,
          recipientId: n.recipient_id,
          recipientRole: n.recipient_role,
          title: n.title,
          message: n.message,
          type: n.type || 'info',
          linkUrl: n.link_url,
          isRead: Boolean(n.is_read),
          metadata: n.metadata ? (typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata) : null,
          createdAt: n.created_at,
        }));

        let combined = [...mapped];
        if (typeof window !== 'undefined') {
          try {
            const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (cached) {
              const localList: CrmNotification[] = JSON.parse(cached);
              // Respect locally marked read notifications so fast UI actions are preserved
              combined = combined.map((c) => {
                const foundLocal = localList.find((loc) => loc.id === c.id);
                return foundLocal && foundLocal.isRead ? { ...c, isRead: true } : c;
              });
              const localUnsynced = localList.filter((loc) => !combined.some((c) => c.id === loc.id || (c.title === loc.title && c.recipientId === loc.recipientId)));
              combined = [...localUnsynced, ...combined];
            }
            // Always sort combined newest first before persisting
            combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined));
          } catch {}
        }

        const normalizedRole = role.toLowerCase();
        const normalizedDept = department.toLowerCase();
        const normalizedUserId = userId.toLowerCase();
        const normalizedUserName = userName.toLowerCase();
        const isAdmin = normalizedRole.includes('admin') || normalizedRole === 'super_admin';
        const isSalesManager =
          (normalizedRole.includes('manager') && (normalizedDept.includes('sales') || (user?.position || '').toLowerCase().includes('sales'))) ||
          normalizedRole === 'sales_manager' ||
          normalizedRole === 'manager' ||
          normalizedUserName === 'arafath';

        const filtered = combined.filter((n) => {
          const nRecId = (n.recipientId || '').toLowerCase();
          const nRecRole = (n.recipientRole || '').toLowerCase();

          const matchesUser =
            (normalizedUserId && (nRecId === normalizedUserId || nRecId.includes(normalizedUserId) || normalizedUserId.includes(nRecId))) ||
            (normalizedUserName && (nRecId === normalizedUserName || nRecId.includes(normalizedUserName) || normalizedUserName.includes(nRecId)));

          if (n.type === 'chat') {
            return Boolean(matchesUser || (!n.recipientId && isAdmin));
          }

          if (isAdmin) return true;
          if (!n.recipientId && !n.recipientRole) return true;

          const matchesRole =
            (normalizedRole && (nRecRole === normalizedRole || nRecRole.includes(normalizedRole) || normalizedRole.includes(nRecRole))) ||
            (normalizedDept && (nRecRole === normalizedDept || nRecRole.includes(normalizedDept) || normalizedDept.includes(nRecRole))) ||
            (isSalesManager && (nRecRole === 'sales_manager' || nRecRole === 'manager' || nRecRole.includes('sales')));

          return Boolean(matchesUser || matchesRole);
        });

        // Strict newest-first chronological sort
        filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return {
          notifications: filtered,
          unreadCount: filtered.filter((m) => !m.isRead).length,
        };
      }
    } catch (err) {
      console.warn('Backend notification fetch warning (using cache if available):', err);
    }

    // Fallback cache
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed: CrmNotification[] = JSON.parse(cached);
          const normalizedRole = role.toLowerCase();
          const normalizedDept = department.toLowerCase();
          const normalizedUserId = userId.toLowerCase();
          const normalizedUserName = userName.toLowerCase();
          const isAdmin = normalizedRole.includes('admin') || normalizedRole === 'super_admin';

          const isSalesManager =
            (normalizedRole.includes('manager') && (normalizedDept.includes('sales') || (user?.position || '').toLowerCase().includes('sales'))) ||
            normalizedRole === 'sales_manager' ||
            normalizedRole === 'manager' ||
            normalizedUserName === 'arafath';

          const filtered = parsed.filter((n) => {
            const nRecId = (n.recipientId || '').toLowerCase();
            const nRecRole = (n.recipientRole || '').toLowerCase();

            const matchesUser =
              (normalizedUserId && (nRecId === normalizedUserId || nRecId.includes(normalizedUserId) || normalizedUserId.includes(nRecId))) ||
              (normalizedUserName && (nRecId === normalizedUserName || nRecId.includes(normalizedUserName) || normalizedUserName.includes(nRecId)));

            if (n.type === 'chat') {
              return Boolean(matchesUser || (!n.recipientId && isAdmin));
            }

            if (isAdmin) return true;
            if (!n.recipientId && !n.recipientRole) return true;

            const matchesRole =
              (normalizedRole && (nRecRole === normalizedRole || nRecRole.includes(normalizedRole) || normalizedRole.includes(nRecRole))) ||
              (normalizedDept && (nRecRole === normalizedDept || nRecRole.includes(normalizedDept) || normalizedDept.includes(nRecRole))) ||
              (isSalesManager && (nRecRole === 'sales_manager' || nRecRole === 'manager' || nRecRole.includes('sales')));

            return Boolean(matchesUser || matchesRole);
          });

          // Strict newest-first chronological sort
          filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          return {
            notifications: filtered,
            unreadCount: filtered.filter((p) => !p.isRead).length,
          };
        }
      } catch {}
    }

    return { notifications: [], unreadCount: 0 };
  },

  /**
   * Marks a specific notification as read.
   */
  async markAsRead(id: string): Promise<boolean> {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`, {}, { requireAuth: false });
    } catch (err) {
      console.warn('Failed to mark notification read on backend:', err);
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed: CrmNotification[] = JSON.parse(cached);
          const updated = parsed.map((n) => (n.id === id ? { ...n, isRead: true } : n));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        window.dispatchEvent(new Event('crm_notification_updated'));
      } catch {}
    }

    return true;
  },

  /**
   * Marks all notifications as read for the active user.
   */
  async markAllAsRead(user: MockAuthUser | null, notificationIds?: string[]): Promise<boolean> {
    try {
      await apiClient.post('/api/notifications/mark-all-read', {
        userId: user?.id,
        userName: user?.name,
        role: user?.role,
        department: user?.department,
        notificationIds,
      }, { requireAuth: false });
    } catch (err) {
      console.warn('Failed to mark all notifications read on backend:', err);
    }

    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          const parsed: CrmNotification[] = JSON.parse(cached);
          const updated = parsed.map((n) => ({ ...n, isRead: true }));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
        window.dispatchEvent(new Event('crm_notification_updated'));
      } catch {}
    }

    return true;
  },

  /**
   * Adds a notification to the local client-side cache and broadcasts the update event.
   */
  addLocalNotification(notif: Omit<CrmNotification, 'id' | 'createdAt' | 'isRead'> & { id?: string; createdAt?: string; isRead?: boolean }) {
    if (typeof window === 'undefined') return;
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list: CrmNotification[] = cached ? JSON.parse(cached) : [];
      const newNotif: CrmNotification = {
        id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        recipientId: notif.recipientId || null,
        recipientRole: notif.recipientRole || null,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        linkUrl: notif.linkUrl || null,
        isRead: notif.isRead ?? false,
        metadata: notif.metadata || null,
        createdAt: notif.createdAt || new Date().toISOString(),
      };

      // Avoid duplicates
      const isDuplicate = list.some(
        (item) =>
          item.id === newNotif.id ||
          (newNotif.metadata?.messageId && item.metadata?.messageId === newNotif.metadata?.messageId) ||
          (item.recipientId === newNotif.recipientId &&
          item.title === newNotif.title &&
          ((item.metadata?.msrfId && item.metadata?.msrfId === newNotif.metadata?.msrfId) ||
           (item.metadata?.orderId && item.metadata?.orderId === newNotif.metadata?.orderId) ||
           (item.metadata?.orderNumber && item.metadata?.orderNumber === newNotif.metadata?.orderNumber)))
      );

      if (!isDuplicate) {
        list.unshift(newNotif);
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
        window.dispatchEvent(new Event('crm_notification_updated'));
      }

      // Asynchronously persist to backend database so cross-device and reload queries retain the alert (skip chat)
      if (newNotif.type !== 'chat') {
        apiClient.post('/api/notifications', {
          recipientId: newNotif.recipientId,
          recipientRole: newNotif.recipientRole,
          title: newNotif.title,
          message: newNotif.message,
          type: newNotif.type,
          linkUrl: newNotif.linkUrl,
          metadata: newNotif.metadata ? (typeof newNotif.metadata === 'string' ? newNotif.metadata : JSON.stringify(newNotif.metadata)) : undefined,
        }, { requireAuth: false }).catch((err) => {
          console.warn('[notificationService] Failed to persist notification to backend:', err);
        });
      }
    } catch (err) {
      console.warn('Failed to save local notification:', err);
    }
  },

  /**
   * Emits a client-side notification update event across components.
   */
  emitNotificationChange() {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('crm_notification_updated'));
    }
  },
};

/**
 * React hook for live navbar notifications with auto-sync and cross-tab reactive updates.
 */
export function useCrmNotifications(currentUser: MockAuthUser | null) {
  const [notifications, setNotifications] = useState<CrmNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const isMountedRef = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await notificationService.getNotifications(currentUser);
      if (isMountedRef.current) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.warn('Notification sync error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    isMountedRef.current = true;
    refresh();

    // Event listeners for cross-component triggers
    const handleUpdate = () => refresh();

    // Handle chat read event (when user views or reads chat)
    const handleChatRead = (e: Event) => {
      const convId = (e as CustomEvent)?.detail?.conversationId;
      setNotifications((prev) => {
        let changed = false;
        const updated = prev.map((n) => {
          if (
            !n.isRead &&
            (!convId || n.metadata?.conversationId === convId || (n.linkUrl && n.linkUrl.includes(convId)))
          ) {
            changed = true;
            return { ...n, isRead: true };
          }
          return n;
        });
        if (changed) {
          setUnreadCount(updated.filter((n) => !n.isRead).length);
          return updated;
        }
        return prev;
      });
    };

    // Handle chat incoming message event
    const handleChatMessage = (e: Event) => {
      const msg = (e as CustomEvent)?.detail;
      if (!msg || !currentUser) return;
      if (msg.sender_id === currentUser.id) return;

      if (typeof window !== 'undefined') {
        const isChatPage = window.location.pathname.startsWith('/chat');
        const urlParams = new URLSearchParams(window.location.search);
        const activeConv = urlParams.get('c');
        if (isChatPage && activeConv === msg.conversation_id) {
          return;
        }
      }

      notificationService.addLocalNotification({
        id: `notif_chat_${msg.id}`,
        recipientId: currentUser.id,
        recipientRole: currentUser.role,
        title: `New message from ${msg.sender_name || 'Colleague'}`,
        message: msg.message_text,
        type: 'chat',
        linkUrl: `/chat?c=${msg.conversation_id}`,
        isRead: false,
        metadata: { conversationId: msg.conversation_id, messageId: msg.id },
        createdAt: msg.created_at || new Date().toISOString(),
      });
    };

    window.addEventListener('crm_notification_updated', handleUpdate);
    window.addEventListener('crm_msrf_updated', handleUpdate);
    window.addEventListener('cooltech_chat_read_updated', handleChatRead);
    window.addEventListener('cooltech_chat_message_received', handleChatMessage);
    window.addEventListener('storage', handleUpdate);

    // Auto-poll every 25 seconds for incoming cross-department notifications
    const interval = setInterval(refresh, 25000);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('crm_notification_updated', handleUpdate);
      window.removeEventListener('crm_msrf_updated', handleUpdate);
      window.removeEventListener('cooltech_chat_read_updated', handleChatRead);
      window.removeEventListener('cooltech_chat_message_received', handleChatMessage);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [refresh]);

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    await notificationService.markAsRead(id);
  };

  const markAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await notificationService.markAllAsRead(currentUser, ids);
  };

  return {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}

