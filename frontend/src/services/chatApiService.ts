/**
 * Live Chat API Service (Cool Technologies CRM)
 * 
 * Handles all REST endpoints and live WebSocket connection to Cloudflare Worker API.
 * Uses existing apiClient, Firebase Auth session, and provides resilient automatic offline fallbacks
 * backed by the CRM staff directory (cezcon_crm_users_list) and local persistence.
 */

import { apiClient, validateAndGetBaseUrl } from '@/lib/apiClient';
import { auth } from '@/firebase/config';
import { getEmployeePhoto } from '@/data/mockEnterpriseData';
import type {
  ChatConversation,
  ChatMessage,
  ChatUser,
  ChatSocketEvent,
} from '@/types/chat';

let activeChatSocket: WebSocket | null = null;

const DEFAULT_CHANNELS: ChatConversation[] = [
  {
    id: 'conv_channel_general',
    type: 'channel',
    title: 'general',
    slug: 'general',
    description: 'Company-wide announcements and team discussions',
    is_private: false,
    unread_count: 0,
    members_count: 12,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'conv_channel_sales',
    type: 'channel',
    title: 'sales',
    slug: 'sales',
    description: 'Sales deals, customer quotations and revenue targets',
    is_private: false,
    unread_count: 0,
    members_count: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'conv_channel_purchase',
    type: 'channel',
    title: 'purchase',
    slug: 'purchase',
    description: 'Material requisitions, supplier quotes and orders',
    is_private: false,
    unread_count: 0,
    members_count: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'conv_channel_operations',
    type: 'channel',
    title: 'operations',
    slug: 'operations',
    description: 'Daily operational tasks, dispatch and field work',
    is_private: false,
    unread_count: 0,
    members_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DEFAULT_COLLEAGUES: ChatUser[] = [
  {
    id: 'usr_superadmin_001',
    name: 'shemin',
    email: 'cooltechuae@gmail.com',
    role: 'CEO',
    department: 'Executive',
    avatar: '/avatars/shemin.jpg',
    is_active: 1,
  },
  {
    id: 'usr_hamdan_fc',
    name: 'Hamdan',
    email: 'hamdan@cooltechuae.com',
    role: 'Finance Controller',
    department: 'Accounts & Finance',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1793801091972',
    name: 'murshid',
    email: 'murshid@cooltechuae.com',
    role: 'Operation Manager',
    department: 'Operations',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1792683751144',
    name: 'Muhammed shemin',
    email: 'shemin123@gmail.com',
    role: 'COO',
    department: 'Management',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_arafath_001',
    name: 'Arafath',
    email: 'arafath@cooltechuae.com',
    role: 'Sales Manager',
    department: 'Sales',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1792753099441',
    name: 'Tariq',
    email: 'tariq@cooltechuae.com',
    role: 'Sales Executive',
    department: 'Sales',
    avatar: '/avatars/tariq.jpg',
    is_active: 1,
  },
  {
    id: 'usr_1792733863086',
    name: 'Mustafa',
    email: 'im@cooltechuae.com',
    role: 'Purchase Officer',
    department: 'Purchase',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_nihal_001',
    name: 'Nihal',
    email: 'nihal@cooltechuae.com',
    role: 'Procurement Executive',
    department: 'Purchase',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_afsal_001',
    name: 'Afsal',
    email: 'afsal@gmail.com',
    role: 'Store & Inventory Manager',
    department: 'Operations',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1792753099442',
    name: 'Nishad',
    email: 'nishad@cooltechuae.com',
    role: 'Operations Executive',
    department: 'Operations',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_fahad_001',
    name: 'Fahad',
    email: 'fahad@cooltechuae.com',
    role: 'Technical Engineer',
    department: 'Technical',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_rashid_001',
    name: 'Rashid Ali',
    email: 'purchasemanager@gmail.com',
    role: 'Purchase Manager',
    department: 'Purchase',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1792054787769',
    name: 'Rithul',
    email: 'rithul@gmail.com',
    role: 'Sales Manager',
    department: 'Sales',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'usr_1792753099440',
    name: 'Muhammed arshad',
    email: 'arshad@gmail.com',
    role: 'Sales Officer',
    department: 'Sales',
    avatar: null,
    is_active: 1,
  },
  {
    id: 'mgr_1',
    name: 'Muhammed Shibil',
    email: 'shibil@gmail.com',
    role: 'Sales Manager',
    department: 'Sales',
    avatar: null,
    is_active: 1,
  },
];

/**
 * Retrieve all colleagues combining static defaults with the live CRM staff database (cezcon_crm_users_list)
 */
export function getAllCrmColleagues(): ChatUser[] {
  const colleaguesMap = new Map<string, ChatUser>();

  // 1. Seed with default known colleagues
  DEFAULT_COLLEAGUES.forEach((c) => {
    colleaguesMap.set(c.id, { ...c });
  });

  // 2. Hydrate from live CRM users catalog (cezcon_crm_users_list)
  if (typeof window !== 'undefined') {
    try {
      const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
      if (storedUsersRaw) {
        const parsed = JSON.parse(storedUsersRaw);
        if (Array.isArray(parsed)) {
          parsed.forEach((u: any) => {
            if (!u) return;
            // Respect inactive flag if explicitly marked inactive
            if (u.status === 'Inactive' || u.isActive === false) return;

            const rawId = String(u.id || '').trim();
            const id = rawId.startsWith('usr_') || rawId.startsWith('conv_') || rawId.startsWith('mgr_')
              ? rawId
              : `usr_${rawId || u.username || u.name}`;
            const name = String(u.name || u.username || 'Team Member').trim();
            const email = String(u.email || '').trim();
            const role = String(u.position || u.designation || u.role || u.profileType || 'Staff').trim();
            const department = String(u.department || 'General').trim();
            const rawAvatar = u.avatarImage || u.avatarUrl || u.avatar || null;
            const validAvatar = rawAvatar && !rawAvatar.includes('unsplash.com') && !rawAvatar.includes('photo-') ? rawAvatar : null;

            // Check if already in map by ID or email
            let existingKey: string | null = null;
            for (const [key, existing] of colleaguesMap.entries()) {
              const cleanExistingId = existing.id.replace(/^usr_/, '').toLowerCase();
              const cleanNewId = id.replace(/^usr_/, '').toLowerCase();
              if (
                cleanExistingId === cleanNewId ||
                (email && existing.email && existing.email.toLowerCase() === email.toLowerCase()) ||
                (name && existing.name && existing.name.toLowerCase() === name.toLowerCase())
              ) {
                existingKey = key;
                break;
              }
            }

            if (existingKey) {
              const prev = colleaguesMap.get(existingKey)!;
              colleaguesMap.set(existingKey, {
                ...prev,
                name: name || prev.name,
                email: email || prev.email,
                role: role || prev.role,
                department: department || prev.department,
                avatar: validAvatar || prev.avatar,
              });
            } else {
              colleaguesMap.set(id, {
                id,
                name,
                email,
                role,
                department,
                avatar: validAvatar,
                is_active: 1,
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Could not read cezcon_crm_users_list for chat:', e);
    }
  }

  return Array.from(colleaguesMap.values());
}

export function getDirectConversationId(userId1: string, userId2: string): string {
  const clean1 = String(userId1 || '').replace(/^usr_/, '');
  const clean2 = String(userId2 || '').replace(/^usr_/, '');
  const sorted = [clean1, clean2].sort();
  return `conv_dm_${sorted[0]}_${sorted[1]}`;
}

export function isExecutive(roleOrPos?: string, dept?: string): boolean {
  const r = (roleOrPos || '').toLowerCase();
  const d = (dept || '').toLowerCase();
  return (
    r.includes('ceo') ||
    r.includes('coo') ||
    r.includes('super_admin') ||
    r.includes('superadmin') ||
    r.includes('admin') ||
    d.includes('executive') ||
    d.includes('management')
  );
}

export function getScopedColleagues(currentUser: { id: string; name: string; role: string; department?: string; email?: string }): ChatUser[] {
  const cleanCurrentId = (currentUser.id || '').replace(/^usr_/, '').toLowerCase();
  const currentName = (currentUser.name || '').toLowerCase().trim();
  const currentEmail = (currentUser.email || '').toLowerCase().trim();

  const allColleagues = getAllCrmColleagues();

  const filtered = allColleagues.filter((c) => {
    const cleanCId = (c.id || '').replace(/^usr_/, '').toLowerCase();
    const cName = (c.name || '').toLowerCase().trim();
    const cEmail = (c.email || '').toLowerCase().trim();

    // 1. NEVER include self in colleagues list
    if (cleanCurrentId && cleanCId === cleanCurrentId) return false;
    if (currentEmail && cEmail && currentEmail === cEmail) return false;
    if (currentName && cName && currentName === cName) return false;

    // In production company chat, every team member can search and direct-message any colleague across the organization
    return true;
  });

  return filtered.map((c) => {
    const live = getLiveUserAvatar(c.name, c.email, c.id);
    const validPhoto = live && !live.includes('unsplash.com') && !live.includes('photo-') ? live : null;
    return {
      ...c,
      avatar: validPhoto || c.avatar,
    };
  });
}

export function getScopedChannels(currentUser: { id: string; name: string; role: string; department?: string }): ChatConversation[] {
  const isExec = isExecutive(currentUser.role, currentUser.department);
  const userDept = (currentUser.department || '').toLowerCase();

  return DEFAULT_CHANNELS.filter((ch) => {
    // #general is company-wide and accessible to everyone
    if (ch.slug === 'general') return true;

    // Executives see all channels
    if (isExec) return true;

    // Department-scoped channels
    if (ch.slug === 'sales' && userDept.includes('sales')) return true;
    if (ch.slug === 'purchase' && userDept.includes('purchase')) return true;
    if (ch.slug === 'operations' && userDept.includes('operation')) return true;

    return false;
  });
}

function getDeletedConversationsMap(userId?: string): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const uId = userId || getLocalCurrentUser().id;
    const raw =
      localStorage.getItem(`cooltech_chat_deleted_conversations_${uId}`) ||
      localStorage.getItem('cooltech_chat_deleted_conversations');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {};
}

function saveDeletedConversationsMap(map: Record<string, number>, userId?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const uId = userId || getLocalCurrentUser().id;
    localStorage.setItem(`cooltech_chat_deleted_conversations_${uId}`, JSON.stringify(map));
    localStorage.setItem('cooltech_chat_deleted_conversations', JSON.stringify(map));
  } catch {}
}

function recordConversationDeleted(conversationId: string, otherUserId?: string | null, otherUserName?: string | null): void {
  const map = getDeletedConversationsMap();
  const now = Date.now();
  map[conversationId] = now;
  if (otherUserId) {
    const cleanId = otherUserId.replace(/^usr_/, '');
    map[otherUserId] = now;
    map[`usr_${cleanId}`] = now;
    map[cleanId] = now;
  }
  if (otherUserName) {
    map[`name_${otherUserName.toLowerCase().trim()}`] = now;
  }
  saveDeletedConversationsMap(map);
}

function isConversationPermanentlyDeleted(
  conversationId: string,
  colleagueId?: string | null,
  colleagueName?: string | null,
  latestMessageTime?: number
): boolean {
  const map = getDeletedConversationsMap();
  const cleanCId = colleagueId ? colleagueId.replace(/^usr_/, '') : '';
  const deletedAt =
    map[conversationId] ||
    (colleagueId ? map[colleagueId] || map[`usr_${cleanCId}`] || map[cleanCId] : 0) ||
    (colleagueName ? map[`name_${colleagueName.toLowerCase().trim()}`] : 0) ||
    0;

  if (!deletedAt) return false;
  // If a brand new message was sent AFTER deletion time, un-delete it
  if (latestMessageTime && latestMessageTime > deletedAt) {
    return false;
  }
  return true;
}

function unmarkConversationDeleted(conversationId: string, otherUserId?: string | null): void {
  const map = getDeletedConversationsMap();
  let changed = false;
  if (map[conversationId]) {
    delete map[conversationId];
    changed = true;
  }
  if (otherUserId) {
    const cleanId = otherUserId.replace(/^usr_/, '');
    delete map[otherUserId];
    delete map[`usr_${cleanId}`];
    delete map[cleanId];
    changed = true;
  }
  if (changed) {
    saveDeletedConversationsMap(map);
  }
}

function getLocalStoredConversations(): ChatConversation[] {
  const currentUser = getLocalCurrentUser();
  const scopedChannels = getScopedChannels(currentUser);
  const scopedColleagues = getScopedColleagues(currentUser);

  // Compute channels with accurate per-user unread counts & latest message
  const channelsWithMetadata: ChatConversation[] = scopedChannels.map((ch) => {
    const msgs = getLocalStoredMessages(ch.id);
    const lastRead =
      (typeof window !== 'undefined' &&
        localStorage.getItem(`cooltech_chat_last_read_${currentUser.id}_${ch.id}`)) ||
      '1970-01-01';
    const lastReadTime = new Date(lastRead).getTime();
    const unreadMsgs = msgs.filter(
      (m) =>
        m.sender_id !== currentUser.id &&
        !m.is_deleted &&
        new Date(m.created_at).getTime() > lastReadTime
    );
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

    return {
      ...ch,
      unread_count: unreadMsgs.length,
      last_message_text: lastMsg ? lastMsg.message_text : ch.description,
      last_message_at: lastMsg ? lastMsg.created_at : ch.created_at,
    };
  });

  // Compute Direct Messages with deterministic symmetric conversation IDs
  const directsWithMetadata: ChatConversation[] = scopedColleagues.map((colleague) => {
    const dmId = getDirectConversationId(currentUser.id, colleague.id);
    let msgs = getLocalStoredMessages(dmId);

    const latestMsgTime = msgs.length > 0 ? new Date(msgs[msgs.length - 1].created_at).getTime() : 0;
    const isDeleted = isConversationPermanentlyDeleted(dmId, colleague.id, colleague.name, latestMsgTime);

    if (isDeleted) {
      return {
        id: dmId,
        type: 'direct',
        title: colleague.name,
        slug: null,
        description: colleague.role || 'Direct Message',
        is_private: true,
        created_by: currentUser.id,
        last_message_at: null,
        last_message_text: null,
        last_message_sender_id: null,
        last_message_sender_name: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        unread_count: 0,
        members_count: 2,
        other_user: colleague,
        is_member: true,
        my_role: 'member',
        is_deleted_by_user: true,
      };
    }

    const lastRead =
      (typeof window !== 'undefined' &&
        localStorage.getItem(`cooltech_chat_last_read_${currentUser.id}_${dmId}`)) ||
      '1970-01-01';
    const lastReadTime = new Date(lastRead).getTime();
    const unreadMsgs = msgs.filter(
      (m) =>
        m.sender_id !== currentUser.id &&
        !m.is_deleted &&
        new Date(m.created_at).getTime() > lastReadTime
    );
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const colleagueAvatar =
      getLiveUserAvatar(colleague.name, colleague.email, colleague.id) ||
      colleague.avatar;

    return {
      id: dmId,
      type: 'direct',
      title: colleague.name,
      slug: null,
      description: colleague.role || 'Direct Message',
      is_private: true,
      created_by: currentUser.id,
      last_message_at: lastMsg ? lastMsg.created_at : colleague.id,
      last_message_text: lastMsg ? lastMsg.message_text : null,
      last_message_sender_id: lastMsg ? lastMsg.sender_id : null,
      last_message_sender_name: lastMsg ? lastMsg.sender_name : null,
      created_at: new Date().toISOString(),
      updated_at: lastMsg ? lastMsg.created_at : new Date().toISOString(),
      unread_count: unreadMsgs.length,
      members_count: 2,
      other_user: {
        ...colleague,
        avatar: colleagueAvatar,
      },
      is_member: true,
      my_role: 'member',
      is_deleted_by_user: false,
    };
  });

  const fullList = [...channelsWithMetadata, ...directsWithMetadata];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`cooltech_chat_conversations_${currentUser.id}`, JSON.stringify(fullList));
      localStorage.setItem('cooltech_chat_conversations', JSON.stringify(fullList));
    } catch {}
  }
  return fullList;
}

function saveLocalConversations(list: ChatConversation[]): void {
  if (typeof window === 'undefined') return;
  try {
    const currentUser = getLocalCurrentUser();
    localStorage.setItem(`cooltech_chat_conversations_${currentUser.id}`, JSON.stringify(list));
    localStorage.setItem('cooltech_chat_conversations', JSON.stringify(list));
  } catch {}
}

export function getLiveUserAvatar(name?: string, email?: string, id?: string): string {
  if (typeof window === 'undefined') return '';
  const cleanName = (name || '').trim().toLowerCase();
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanId = (id || '').trim();

  // Known permanent authentic avatars
  if (
    cleanName === 'shemin' ||
    cleanName.includes('shemin') ||
    cleanEmail.includes('shemin') ||
    cleanId === 'usr_superadmin_001'
  ) {
    return '/avatars/shemin.jpg';
  }

  if (
    cleanName === 'tariq' ||
    cleanName.includes('tariq') ||
    cleanEmail.includes('tariq') ||
    cleanId === 'usr_1792753099441' ||
    cleanId === 'usr_1793271379515'
  ) {
    return '/avatars/tariq.jpg';
  }

  // 1. Check current authenticated user session
  try {
    const authRaw = localStorage.getItem('cool_crm_auth') || localStorage.getItem('crm_auth_user');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const u = parsed.user || parsed;
      if (
        (cleanName && (u.name?.toLowerCase().trim() === cleanName || u.username?.toLowerCase().trim() === cleanName)) ||
        (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail) ||
        (cleanId && (u.id === cleanId || u.uid === cleanId))
      ) {
        const av = u.avatar || u.avatarImage || u.avatarUrl;
        if (av && !av.includes('unsplash.com') && !av.includes('photo-')) return av;
      }
    }
  } catch {}

  // 2. Check stored users list
  try {
    const storedUsersRaw = localStorage.getItem('cezcon_crm_users_list');
    if (storedUsersRaw) {
      const list = JSON.parse(storedUsersRaw);
      if (Array.isArray(list)) {
        const matched = list.find((u: any) =>
          (cleanName && (u.name?.toLowerCase().trim() === cleanName || u.username?.toLowerCase().trim() === cleanName)) ||
          (cleanEmail && u.email?.toLowerCase().trim() === cleanEmail) ||
          (cleanId && (u.id === cleanId || u.uid === cleanId))
        );
        if (matched) {
          const av = matched.avatarImage || matched.avatarUrl || matched.avatar;
          if (av && !av.includes('unsplash.com') && !av.includes('photo-')) return av;
        }
      }
    }
  } catch {}

  // 3. Fallback to getEmployeePhoto
  try {
    const p = getEmployeePhoto(name);
    if (p && !p.includes('unsplash.com') && !p.includes('photo-')) return p;
  } catch {}

  return '';
}

function enrichMessageSender(msg: ChatMessage): ChatMessage {
  if (!msg) return msg;
  const sId = String(msg.sender_id || '').toLowerCase().replace(/^usr_/, '');
  const allColleagues = getAllCrmColleagues();
  const matched = allColleagues.find((c) => {
    const cleanCId = String(c.id || '').toLowerCase().replace(/^usr_/, '');
    return (
      cleanCId === sId ||
      c.id.toLowerCase() === String(msg.sender_id || '').toLowerCase() ||
      (msg.sender_name && c.name.toLowerCase() === msg.sender_name.toLowerCase()) ||
      (sId.includes('superadmin') && c.id.includes('superadmin')) ||
      (sId.includes('arafath') && c.id.includes('arafath')) ||
      (sId.includes('1792753099441') && c.id.includes('1792753099441')) ||
      (sId.includes('1793801091972') && c.id.includes('1793801091972'))
    );
  });
  const senderName = msg.sender_name || matched?.name || 'CRM Staff';
  const liveAvatar = getLiveUserAvatar(senderName, matched?.email, matched?.id);

  return {
    ...msg,
    sender_name: senderName,
    sender_avatar: (liveAvatar && !liveAvatar.includes('unsplash')) ? liveAvatar : (liveAvatar || msg.sender_avatar || matched?.avatar || null),
    sender_role:
      !msg.sender_role || msg.sender_role === 'Staff' || msg.sender_role === 'manager'
        ? (matched?.role || 'Staff')
        : msg.sender_role,
  };
}

// Purge legacy dummy seed messages and test chatter from general channel
if (typeof window !== 'undefined') {
  try {
    const isPurged = localStorage.getItem('cooltech_chat_clean_general_v4');
    if (!isPurged) {
      localStorage.removeItem('cooltech_chat_messages_conv_general');
      localStorage.removeItem('cooltech_chat_messages_general');
      Object.keys(localStorage).forEach((key) => {
        if (key.includes('conv_general') || key.includes('messages_general')) {
          const raw = localStorage.getItem(key);
          if (raw && (raw.includes('hlo') || raw.includes('"message_text":"hi"'))) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter(
                  (m: any) =>
                    m.message_text !== 'hlo' &&
                    m.message_text !== 'hi' &&
                    m.message_text !== 'hlo\n' &&
                    m.message_text !== 'hi\n'
                );
                localStorage.setItem(key, JSON.stringify(filtered));
              }
            } catch {}
          }
        }
        if (key.includes('conversations')) {
          const raw = localStorage.getItem(key);
          if (raw && (raw.includes('hlo') || raw.includes('"hi"'))) {
            try {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                const cleaned = list.map((c: any) => {
                  if (c.slug === 'general' || c.id === 'conv_general') {
                    return {
                      ...c,
                      last_message_text: 'Company-wide announcements and team discussions',
                      unread_count: 0,
                    };
                  }
                  return c;
                });
                localStorage.setItem(key, JSON.stringify(cleaned));
              }
            } catch {}
          }
        }
      });
      localStorage.setItem('cooltech_chat_clean_general_v4', 'true');
    }
  } catch {}
}

function getLocalStoredMessages(conversationId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`cooltech_chat_messages_${conversationId}`);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        // Clean up legacy seed messages and casual test chatter in general
        const cleaned = list.filter((m: any, idx: number) => {
          if (m.id && String(m.id).startsWith('msg_seed_')) return false;
          if (m.message_text === 'Hi\n\nYou completed the sales?' || (m.message_text === 'Yes' && m.sender_name === 'Tariq' && idx <= 1)) return false;
          if (
            (conversationId === 'conv_general' || conversationId === 'general') &&
            (m.message_text === 'hlo' || m.message_text === 'hi' || m.message_text === 'hlo\n' || m.message_text === 'hi\n')
          ) {
            return false;
          }
          if (idx === 0) return true;
          const prev = list[idx - 1];
          return !(m.sender_id === prev.sender_id && m.message_text === 'Yes' && prev.message_text === 'Yes');
        });
        if (cleaned.length !== list.length) {
          saveLocalMessages(conversationId, cleaned);
        }
        return cleaned.map(enrichMessageSender);
      }
    }
  } catch {}
  return [];
}

function saveLocalMessages(conversationId: string, messages: ChatMessage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`cooltech_chat_messages_${conversationId}`, JSON.stringify(messages));
  } catch {}
}

function getLocalCurrentUser(): {
  id: string;
  name: string;
  role: string;
  department?: string;
  position?: string;
  avatar?: string;
  email?: string;
} {
  if (typeof window !== 'undefined') {
    try {
      const authRaw = localStorage.getItem('cool_crm_auth') || localStorage.getItem('crm_auth_user');
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        const u = parsed.user || parsed;
        let av = u.avatar || u.avatarImage || u.avatarUrl || null;
        const uName = String(u.name || u.displayName || u.email || '').toLowerCase();
        const uEmail = String(u.email || '').toLowerCase();
        const uId = String(u.id || u.uid || '');

        const allColleagues = getAllCrmColleagues();
        const matched = allColleagues.find(
          (c) =>
            (uId && (c.id === uId || `usr_${c.id}` === uId || c.id === `usr_${uId}`)) ||
            (uEmail && c.email.toLowerCase() === uEmail) ||
            (c.name && (uName.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(uName)))
        );
        if (matched?.avatar && !av) av = matched.avatar;

        return {
          id: matched ? matched.id : String(u.id || u.uid || 'usr_current'),
          name: u.name || u.displayName || matched?.name || 'Team Member',
          role: u.position || u.designation || u.role || matched?.role || 'Staff',
          department: u.department || matched?.department || 'General',
          position: u.position || u.designation || matched?.role || 'Staff',
          email: u.email || matched?.email || '',
          avatar: av || undefined,
        };
      }
    } catch {}
  }
  return { id: 'usr_current', name: 'Team Member', role: 'Staff' };
}

export const chatApiService = {
  /**
   * List active CRM colleagues to chat with (scoped to current user's hierarchy)
   */
  async getAvailableUsers(): Promise<ChatUser[]> {
    const currentUser = getLocalCurrentUser();
    const scoped = getScopedColleagues(currentUser);
    return scoped;
  },

  /**
   * List all conversations accessible to the current user (with unread counts)
   */
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const res = await apiClient.get<{ success: boolean; conversations: ChatConversation[] }>('/api/chat/conversations');
      if (res && res.conversations && res.conversations.length > 0) {
        // Cache remotely fetched conversations
        saveLocalConversations(res.conversations);
      }
    } catch {
      // Backend not reached; fall through to local storage
    }

    return getLocalStoredConversations();
  },

  /**
   * Get single conversation details & member roster
   */
  async getConversation(id: string): Promise<ChatConversation | null> {
    try {
      const res = await apiClient.get<{ success: boolean; conversation: ChatConversation }>(`/api/chat/conversations/${encodeURIComponent(id)}`);
      if (res && res.conversation) return res.conversation;
    } catch {
      // Fallback to local
    }

    const localList = getLocalStoredConversations();
    return localList.find((c) => c.id === id) || null;
  },

  /**
   * Start a direct conversation, create a group, or create a channel
   */
  async createConversation(data: {
    type: 'direct' | 'group' | 'channel';
    target_user_id?: string;
    target_user_name?: string;
    target_user_role?: string;
    target_user_email?: string;
    title?: string;
    slug?: string;
    description?: string;
    is_private?: boolean | number;
    member_ids?: string[];
  }): Promise<{ conversation: ChatConversation; isExisting?: boolean }> {
    // Resolve target user details upfront if direct message
    let otherUser: ChatUser | null = null;
    if (data.type === 'direct' && data.target_user_id) {
      const allUsers = await this.getAvailableUsers();
      const cleanTarget = String(data.target_user_id).replace(/^usr_/, '');
      otherUser =
        allUsers.find(
          (u) => u.id === data.target_user_id || u.id.replace(/^usr_/, '') === cleanTarget
        ) || null;

      if (!otherUser && data.target_user_name) {
        otherUser = {
          id: data.target_user_id,
          name: data.target_user_name,
          role: data.target_user_role || 'Staff',
          email: data.target_user_email || `${cleanTarget}@cooltechuae.com`,
          avatar: null,
          is_active: 1,
        };
      }
    }

    const payload = {
      ...data,
      target_user_name: otherUser?.name || data.target_user_name,
      target_user_role: otherUser?.role || data.target_user_role,
      target_user_email: otherUser?.email || data.target_user_email,
    };

    try {
      const res = await apiClient.post<{
        success: boolean;
        conversation: ChatConversation;
        is_existing?: boolean;
      }>('/api/chat/conversations', payload);

      if (res && res.conversation) {
        const localList = getLocalStoredConversations();
        const convToSave = {
          ...res.conversation,
          other_user: res.conversation.other_user || otherUser,
        };
        const updated = [convToSave, ...localList.filter((c) => c.id !== convToSave.id)];
        saveLocalConversations(updated);
        return {
          conversation: convToSave,
          isExisting: res.is_existing,
        };
      }
    } catch {
      // Fall through to local conversation creation
    }

    const localList = getLocalStoredConversations();
    const currentUser = getLocalCurrentUser();

    // Prevent duplicate direct conversations locally
    if (data.type === 'direct' && data.target_user_id) {
      const targetId = data.target_user_id;
      const cleanTarget = String(targetId).replace(/^usr_/, '');
      const existing = localList.find(
        (c) =>
          c.type === 'direct' &&
          (c.other_user?.id === targetId ||
            c.other_user?.id?.replace(/^usr_/, '') === cleanTarget ||
            c.id === getDirectConversationId(currentUser.id, targetId))
      );
      if (existing) {
        return { conversation: existing, isExisting: true };
      }
    }

    const newId =
      data.type === 'direct' && data.target_user_id
        ? getDirectConversationId(currentUser.id, data.target_user_id)
        : `conv_${data.type}_${Date.now()}`;
    const newConv: ChatConversation = {
      id: newId,
      type: data.type,
      title: data.type === 'direct' ? otherUser?.name || 'Direct Message' : data.title || 'New Space',
      slug: data.slug,
      description: data.description,
      is_private: Boolean(data.is_private),
      created_by: currentUser.id,
      last_message_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      unread_count: 0,
      members_count: (data.member_ids?.length || 0) + 1,
      other_user: otherUser,
      is_member: true,
      my_role: 'owner',
    };

    const updated = [newConv, ...localList];
    saveLocalConversations(updated);

    return { conversation: newConv, isExisting: false };
  },

  /**
   * Add a colleague to a group or channel
   */
  async addMember(conversationId: string, userId: string): Promise<boolean> {
    try {
      const res = await apiClient.post<{ success: boolean }>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/members`,
        { user_id: userId }
      );
      if (res && res.success) return true;
    } catch {}

    // Local state fallback
    const localList = getLocalStoredConversations();
    const updated = localList.map((c) =>
      c.id === conversationId ? { ...c, members_count: (c.members_count || 1) + 1 } : c
    );
    saveLocalConversations(updated);
    return true;
  },

  /**
   * Remove a member from a group or channel (or leave)
   */
  async removeMember(conversationId: string, userId: string): Promise<boolean> {
    try {
      const res = await apiClient.delete<{ success: boolean }>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/members/${encodeURIComponent(userId)}`
      );
      if (res && res.success) return true;
    } catch {}

    const localList = getLocalStoredConversations();
    const updated = localList.map((c) =>
      c.id === conversationId ? { ...c, members_count: Math.max(1, (c.members_count || 2) - 1) } : c
    );
    saveLocalConversations(updated);
    return true;
  },

  /**
   * Quick synchronous read of locally cached messages for instant rendering
   */
  getLocalMessages(conversationId: string): ChatMessage[] {
    return getLocalStoredMessages(conversationId);
  },

  /**
   * Fetch paginated messages for a conversation
   */
  async getMessages(
    conversationId: string,
    params: { limit?: number; before?: string } = {}
  ): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
    try {
      const res = await apiClient.get<{
        success: boolean;
        messages: ChatMessage[];
        has_more: boolean;
      }>(`/api/chat/conversations/${encodeURIComponent(conversationId)}/messages`, {
        params: {
          limit: params.limit || 50,
          before: params.before,
        },
      });

      if (res && res.messages) {
        saveLocalMessages(conversationId, res.messages);
        return {
          messages: res.messages,
          hasMore: Boolean(res.has_more),
        };
      }
    } catch {}

    const localMsgs = getLocalStoredMessages(conversationId);
    return {
      messages: localMsgs,
      hasMore: false,
    };
  },

  /**
   * Send a new message in a conversation
   */
  async sendMessage(
    conversationId: string,
    payload: {
      message_text: string;
      attachments?: any[];
      message_type?: 'text' | 'file' | 'image';
    }
  ): Promise<ChatMessage> {
    // Unmark as deleted if it was previously deleted
    unmarkConversationDeleted(conversationId);

    try {
      const res = await apiClient.post<{ success: boolean; message: ChatMessage }>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages`,
        payload
      );
      if (res && res.message) {
        const current = getLocalStoredMessages(conversationId);
        saveLocalMessages(conversationId, [...current, res.message]);
        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('cooltech_chat_message_received', { detail: res.message }));
            localStorage.setItem('cooltech_chat_cross_tab_event', JSON.stringify({ message: res.message, ts: Date.now() }));
          } catch {}
        }
        return res.message;
      }
    } catch {}

    // Resilient local dispatch
    const currentUser = getLocalCurrentUser();
    const localMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      sender_avatar: currentUser.avatar || null,
      message_text: payload.message_text,
      message_type: payload.message_type || 'text',
      is_edited: false,
      is_deleted: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const current = getLocalStoredMessages(conversationId);
    saveLocalMessages(conversationId, [...current, localMsg]);

    // Mark as read immediately for the sender so sender has 0 unread
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cooltech_chat_last_read_${currentUser.id}_${conversationId}`, localMsg.created_at);
      } catch {}
    }

    // Update conversation snippet in local list
    const convList = getLocalStoredConversations();
    const updated = convList.map((c) =>
      c.id === conversationId
        ? {
            ...c,
            last_message_text: payload.message_text,
            last_message_at: localMsg.created_at,
          }
        : c
    );
    saveLocalConversations(updated);

    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(new CustomEvent('cooltech_chat_message_received', { detail: localMsg }));
        localStorage.setItem('cooltech_chat_cross_tab_event', JSON.stringify({ message: localMsg, ts: Date.now() }));
      } catch {}
    }

    return localMsg;
  },

  /**
   * Edit own message
   */
  async editMessage(conversationId: string, messageId: string, newText: string): Promise<ChatMessage> {
    try {
      const res = await apiClient.put<{ success: boolean; message: ChatMessage }>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`,
        { message_text: newText }
      );
      if (res && res.message) return res.message;
    } catch {}

    const msgs = getLocalStoredMessages(conversationId);
    let editedMsg: ChatMessage | null = null;
    const updated = msgs.map((m) => {
      if (m.id === messageId) {
        editedMsg = { ...m, message_text: newText, is_edited: true, edited_at: new Date().toISOString() };
        return editedMsg;
      }
      return m;
    });
    saveLocalMessages(conversationId, updated);
    return editedMsg || msgs[0];
  },

  /**
   * Delete own message (soft delete)
   */
  async deleteMessage(conversationId: string, messageId: string): Promise<boolean> {
    try {
      const res = await apiClient.delete<{ success: boolean }>(
        `/api/chat/conversations/${encodeURIComponent(conversationId)}/messages/${encodeURIComponent(messageId)}`
      );
      if (res && res.success) return true;
    } catch {}

    const msgs = getLocalStoredMessages(conversationId);
    const updated = msgs.map((m) =>
      m.id === messageId ? { ...m, is_deleted: true, deleted_at: new Date().toISOString() } : m
    );
    saveLocalMessages(conversationId, updated);
    return true;
  },

  /**
   * Mark conversation as read
   */
  async markRead(conversationId: string): Promise<boolean> {
    const currentUser = getLocalCurrentUser();
    const now = new Date().toISOString();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cooltech_chat_last_read_${currentUser.id}_${conversationId}`, now);
        window.dispatchEvent(
          new CustomEvent('cooltech_chat_read_updated', {
            detail: { conversationId, userId: currentUser.id },
          })
        );
        localStorage.setItem(
          'cooltech_chat_cross_tab_event',
          JSON.stringify({ type: 'read', conversationId, userId: currentUser.id, ts: Date.now() })
        );

        // Also instantly mark matching notifications as read in CRM notification cache
        const notifCacheRaw = localStorage.getItem('cool_tech_crm_notifications_cache');
        if (notifCacheRaw) {
          const parsedNotifs = JSON.parse(notifCacheRaw);
          if (Array.isArray(parsedNotifs)) {
            let changed = false;
            const updatedNotifs = parsedNotifs.map((n: any) => {
              if (
                !n.isRead &&
                (n.metadata?.conversationId === conversationId || (n.linkUrl && n.linkUrl.includes(conversationId)))
              ) {
                changed = true;
                return { ...n, isRead: true };
              }
              return n;
            });
            if (changed) {
              localStorage.setItem('cool_tech_crm_notifications_cache', JSON.stringify(updatedNotifs));
              window.dispatchEvent(new Event('crm_notification_updated'));
            }
          }
        }
      } catch {}
    }

    try {
      await apiClient.post(`/api/chat/conversations/${encodeURIComponent(conversationId)}/read`, {});
    } catch {}

    const convList = getLocalStoredConversations();
    const updated = convList.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c));
    saveLocalConversations(updated);
    return true;
  },

  /**
   * Delete or clear a conversation and its message history permanently
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const currentUser = getLocalCurrentUser();
    const convList = getLocalStoredConversations();
    const targetConv = convList.find((c) => c.id === conversationId);
    const otherId = targetConv?.other_user?.id;
    const otherName = targetConv?.other_user?.name || targetConv?.title;

    try {
      await apiClient.delete(`/api/chat/conversations/${encodeURIComponent(conversationId)}`);
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        // 1. Permanently record deletion in user blacklist
        recordConversationDeleted(conversationId, otherId, otherName);

        // 2. Remove primary messages key
        localStorage.removeItem(`cooltech_chat_messages_${conversationId}`);

        // 3. Purge all related / legacy message keys for this conversation or colleague
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('cooltech_chat_messages_')) {
            if (
              k.includes(conversationId) ||
              (otherId && k.includes(otherId.replace(/^usr_/, ''))) ||
              (otherName && k.toLowerCase().includes(otherName.toLowerCase()))
            ) {
              keysToRemove.push(k);
            }
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));

        // 4. Mark last_read timestamp to NOW so it NEVER has an unread badge
        localStorage.setItem(`cooltech_chat_last_read_${currentUser.id}_${conversationId}`, new Date().toISOString());

        // 5. Clean out of cached conversation lists
        const cleanList = (list: any[]) =>
          list.filter(
            (c) =>
              c.id !== conversationId &&
              (!otherId || c.other_user?.id !== otherId) &&
              (!otherName || c.title?.toLowerCase() !== otherName.toLowerCase())
          );

        try {
          const raw = localStorage.getItem('cooltech_chat_conversations');
          if (raw) {
            localStorage.setItem('cooltech_chat_conversations', JSON.stringify(cleanList(JSON.parse(raw))));
          }
          const userRaw = localStorage.getItem(`cooltech_chat_conversations_${currentUser.id}`);
          if (userRaw) {
            localStorage.setItem(`cooltech_chat_conversations_${currentUser.id}`, JSON.stringify(cleanList(JSON.parse(userRaw))));
          }
        } catch {}

        window.dispatchEvent(
          new CustomEvent('cooltech_chat_conversation_deleted', {
            detail: { conversationId, userId: currentUser.id },
          })
        );
        localStorage.setItem(
          'cooltech_chat_cross_tab_event',
          JSON.stringify({ type: 'conversation_deleted', conversationId, ts: Date.now() })
        );
      } catch {}
    }

    return true;
  },

  /**
   * Get total unread count for navbar badge
   */
  async getUnreadCount(): Promise<number> {
    const convList = getLocalStoredConversations();
    const localCount = convList.reduce((acc, c) => acc + (c.unread_count || 0), 0);

    try {
      const res = await apiClient.get<{ success: boolean; unread_count: number }>('/api/chat/unread');
      if (res && res.unread_count !== undefined) {
        return Math.max(localCount, Number(res.unread_count || 0));
      }
    } catch {}

    return localCount;
  },

  /**
   * Connect to real-time WebSocket room
   * Handles ping/pong heartbeat, automatic reconnect, and event dispatch
   */
  connectWebSocket(
    conversationId: string,
    onEvent: (event: ChatSocketEvent) => void
  ): () => void {
    let ws: WebSocket | null = null;
    let pingTimer: any = null;
    let isCancelled = false;

    const startConnection = async () => {
      if (isCancelled) return;

      try {
        const baseUrl = validateAndGetBaseUrl();
        const wsProto = baseUrl.startsWith('https') ? 'wss:' : 'ws:';
        const host = baseUrl.replace(/^https?:\/\//, '');

        let token = '';
        if (auth?.currentUser) {
          try {
            token = await auth.currentUser.getIdToken();
          } catch {
            // Ignore
          }
        }

        if (!token && typeof window !== 'undefined') {
          const stored = localStorage.getItem('crm_auth_user');
          if (stored) {
            token = 'dev_token_chat';
          }
        }

        const wsUrl = `${wsProto}//${host}/api/chat/ws?conversationId=${encodeURIComponent(
          conversationId
        )}&token=${encodeURIComponent(token)}`;

        ws = new WebSocket(wsUrl);
        activeChatSocket = ws;

        ws.onopen = () => {
          pingTimer = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping' }));
            }
          }, 20000);
        };

        ws.onmessage = (event) => {
          try {
            const data: ChatSocketEvent = JSON.parse(event.data);
            onEvent(data);
            if (typeof window !== 'undefined' && data.type === 'new_message' && data.message) {
              window.dispatchEvent(
                new CustomEvent('cooltech_chat_message_received', { detail: data.message })
              );
            }
          } catch {
            // Ignore malformed frames
          }
        };

        ws.onclose = () => {
          clearInterval(pingTimer);
          if (!isCancelled) {
            setTimeout(startConnection, 5000);
          }
        };

        ws.onerror = () => {
          try {
            ws?.close();
          } catch {}
        };
      } catch {
        // Fallback silently
      }
    };

    startConnection();

    return () => {
      isCancelled = true;
      clearInterval(pingTimer);
      if (ws) {
        if (activeChatSocket === ws) activeChatSocket = null;
        try {
          ws.close();
        } catch {}
      }
    };
  },

  /**
   * Broadcast typing indicator to conversation room members
   */
  sendTypingIndicator(conversationId: string, isTyping: boolean): void {
    if (activeChatSocket && activeChatSocket.readyState === WebSocket.OPEN) {
      try {
        activeChatSocket.send(
          JSON.stringify({
            type: 'typing',
            isTyping,
            conversationId,
          })
        );
      } catch {
        // Ignore socket write errors
      }
    }
  },
};
