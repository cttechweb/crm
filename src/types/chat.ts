/**
 * Type definitions for Live Chat & Team Collaboration (Cool Technologies CRM)
 */

export type ChatConversationType = 'direct' | 'group' | 'channel';
export type ChatMemberRole = 'owner' | 'admin' | 'member';
export type ChatMessageType = 'text' | 'system' | 'file' | 'image';

export interface ChatUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: string;
  department?: string;
  designation?: string;
  is_active?: boolean | number;
}

export interface ChatMember {
  id: string;
  conversation_id: string;
  user_id: string;
  role: ChatMemberRole;
  joined_at: string;
  last_read_at?: string | null;
  full_name?: string;
  email?: string;
  avatar_image?: string | null;
  designation?: string | null;
  role_name?: string | null;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role?: string | null;
  sender_avatar?: string | null;
  message_text: string;
  message_type: ChatMessageType;
  attachments?: ChatAttachment[];
  is_edited: boolean;
  edited_at?: string | null;
  is_deleted: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  type: ChatConversationType;
  title: string | null;
  slug?: string | null;
  description?: string | null;
  is_private: boolean;
  created_by?: string | null;
  last_message_at?: string | null;
  last_message_text?: string | null;
  last_message_sender_id?: string | null;
  last_message_sender_name?: string | null;
  created_at: string;
  updated_at: string;
  unread_count: number;
  members_count: number;
  members?: ChatMember[];
  other_user?: ChatUser | null;
  is_member?: boolean;
  my_role?: ChatMemberRole | null;
  is_deleted_by_user?: boolean;
}

export interface ChatSocketEvent {
  type: 'connected' | 'new_message' | 'message_edited' | 'message_deleted' | 'typing' | 'member_joined' | 'member_left' | 'pong';
  conversationId?: string;
  message?: ChatMessage;
  messageId?: string;
  messageText?: string;
  userId?: string;
  userName?: string;
  isTyping?: boolean;
  timestamp?: string | number;
}

