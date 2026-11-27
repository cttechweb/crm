-- Migration: 0012_live_chat_system.sql
-- Description: Schema for Slack-like Live Chat in Cool Technologies CRM
-- Target Database: cool-tech-crm-db (Cloudflare D1 / SQLite)
-- Safety: Dedicated additive migration. No existing CRM tables or records modified.

-- 1. Conversations Table (Direct messages, Groups, and Channels)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('direct', 'group', 'channel')),
    title TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    is_private INTEGER NOT NULL DEFAULT 0,
    created_by TEXT REFERENCES users(id),
    last_message_at TEXT,
    last_message_text TEXT,
    last_message_sender_id TEXT,
    last_message_sender_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Conversation Members
CREATE TABLE IF NOT EXISTS chat_members (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_read_at TEXT DEFAULT (datetime('now')),
    is_muted INTEGER NOT NULL DEFAULT 0,
    UNIQUE(conversation_id, user_id)
);

-- 3. Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id),
    sender_name TEXT NOT NULL,
    sender_role TEXT,
    sender_avatar TEXT,
    message_text TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'file', 'image')),
    attachments TEXT,
    is_edited INTEGER NOT NULL DEFAULT 0,
    edited_at TEXT,
    is_deleted INTEGER NOT NULL DEFAULT 0,
    deleted_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Message Read Receipts
CREATE TABLE IF NOT EXISTS chat_message_reads (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    read_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(conversation_id, message_id, user_id)
);

-- 5. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_type ON chat_conversations(type);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_slug ON chat_conversations(slug);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_msg ON chat_conversations(last_message_at);
CREATE INDEX IF NOT EXISTS idx_chat_members_user ON chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_members_conv ON chat_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv_created ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_reads_conv_user ON chat_message_reads(conversation_id, user_id);

-- 6. Default Public Channels Seed
INSERT OR IGNORE INTO chat_conversations (id, type, title, slug, description, is_private, created_at, updated_at)
VALUES 
('conv_general', 'channel', '#general', 'general', 'Company-wide announcements, team coordination, and general chatter.', 0, datetime('now'), datetime('now')),
('conv_sales', 'channel', '#sales', 'sales', 'Commercial deals, quotation updates, client requests, and pipeline tracking.', 0, datetime('now'), datetime('now')),
('conv_purchase', 'channel', '#purchase', 'purchase', 'Procurement requests, supplier quotes, material orders, and inventory.', 0, datetime('now'), datetime('now')),
('conv_operations', 'channel', '#operations', 'operations', 'Field technician dispatch, job orders, site installations, and maintenance.', 0, datetime('now'), datetime('now'));

