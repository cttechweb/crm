/**
 * Live Chat & Team Collaboration Endpoints for cool-tech-crm-api
 * 
 * Implements Slack-like real-time messaging for Cool Technologies CRM:
 * - Direct Messaging between employees with duplicate prevention
 * - Public & Private Channels (#general, #sales, #purchase, #operations)
 * - Group Conversations
 * - Paginated message history, edit/delete permissions, read tracking
 * - Real-time WebSocket broadcasting via ChatRoom Durable Object
 * - Enforces strict Firebase token auth & CRM user verification
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  ChatConversationRow,
  ChatMemberRow,
  ChatMessageRow,
} from './types.ts';
import { authMiddleware, verifyFirebaseToken } from './auth.ts';

const chatApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// ----------------------------------------------------------------------------
// Helper: Broadcast live event via Durable Object (Safe & Non-blocking)
// ----------------------------------------------------------------------------
async function broadcastToRoom(env: Env, conversationId: string, payload: unknown): Promise<void> {
  if (!env.CHAT_ROOM) return;
  try {
    const id = env.CHAT_ROOM.idFromName(conversationId);
    const room = env.CHAT_ROOM.get(id);
    await room.fetch('https://chat-room/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // Non-fatal if Durable Object is unavailable
  }
}

// ----------------------------------------------------------------------------
// 1. WebSocket Upgrade Endpoint: /api/chat/ws
// Connect with: ws://.../api/chat/ws?token=FIREBASE_TOKEN&conversationId=XYZ
// ----------------------------------------------------------------------------
chatApp.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
    return c.text('Expected WebSocket connection', 426);
  }

  const token = c.req.query('token') || c.req.header('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return c.text('Unauthorized: Token required', 401);
  }

  const projectId = c.env.FIREBASE_PROJECT_ID || 'cool-tech-crm';
  const verification = await verifyFirebaseToken(token, projectId);
  if (!verification.valid || !verification.uid) {
    return c.text('Unauthorized: Invalid or expired token', 401);
  }

  // Look up user in D1
  const user = await c.env.DB.prepare(
    'SELECT id, full_name, email, is_active FROM users WHERE firebase_uid = ? LIMIT 1'
  )
    .bind(verification.uid)
    .first<{ id: string; full_name: string; email: string; is_active: number }>();

  if (!user || user.is_active === 0) {
    return c.text('Forbidden: Inactive or unregistered user', 403);
  }

  const conversationId = c.req.query('conversationId') || 'general';

  // Forward to Durable Object if bound
  if (c.env.CHAT_ROOM) {
    const id = c.env.CHAT_ROOM.idFromName(conversationId);
    const room = c.env.CHAT_ROOM.get(id);

    const wsUrl = new URL(c.req.url);
    wsUrl.searchParams.set('userId', user.id);
    wsUrl.searchParams.set('userName', user.full_name || user.email);
    wsUrl.searchParams.set('conversationId', conversationId);

    return room.fetch(new Request(wsUrl.toString(), c.req.raw));
  }

  // Fallback: Pair WebSocket directly if Durable Object binding is not present
  const pair = new WebSocketPair();
  const [client, server] = Object.values(pair);
  server.accept();
  server.send(JSON.stringify({ type: 'connected', userId: user.id, conversationId }));

  return new Response(null, { status: 101, webSocket: client });
});

// Protect all remaining REST chat endpoints with standard authMiddleware
chatApp.use('*', authMiddleware);

// ----------------------------------------------------------------------------
// 2. GET /api/chat/users - List available CRM users to chat with
// ----------------------------------------------------------------------------
chatApp.get('/users', async (c) => {
  const currentUser = c.get('user');

  try {
    const query = await c.env.DB.prepare(`
      SELECT id, email, full_name, role, department, designation, avatar_image, phone, is_active
      FROM users
      WHERE is_active = 1 AND id != ?
      ORDER BY full_name ASC
    `)
      .bind(currentUser.id)
      .all();

    return c.json({
      success: true,
      users: query.results || [],
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------------------------------
// 3. GET /api/chat/unread - Total unread messages count across all conversations
// ----------------------------------------------------------------------------
chatApp.get('/unread', async (c) => {
  const currentUser = c.get('user');

  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(m.id) as unread_count
      FROM chat_messages m
      JOIN chat_members mem ON m.conversation_id = mem.conversation_id AND mem.user_id = ?
      WHERE m.sender_id != ?
        AND m.is_deleted = 0
        AND datetime(m.created_at) > datetime(COALESCE(mem.last_read_at, '1970-01-01'))
    `)
      .bind(currentUser.id, currentUser.id)
      .first<{ unread_count: number }>();

    return c.json({
      success: true,
      unread_count: Number(result?.unread_count || 0),
    });
  } catch (err: any) {
    return c.json({ success: false, unread_count: 0, message: err.message }, 500);
  }
});

// ----------------------------------------------------------------------------
// 4. GET /api/chat/conversations - List conversations accessible to user
// ----------------------------------------------------------------------------
chatApp.get('/conversations', async (c) => {
  const currentUser = c.get('user');

  const cleanUserId = currentUser.id.replace(/^usr_/, '');
  const userVariants = [currentUser.id, cleanUserId, `usr_${cleanUserId}`];
  const userPattern1 = `%_${cleanUserId}_%`;
  const userPattern2 = `%_${cleanUserId}`;

  try {
    // 1. Fetch conversations where user is a member OR public channels OR user's direct messages
    const query = await c.env.DB.prepare(`
      SELECT DISTINCT
        c.id, c.type, c.title, c.slug, c.description, c.is_private, c.created_by,
        c.last_message_at, c.last_message_text, c.last_message_sender_id, c.last_message_sender_name,
        c.created_at, c.updated_at,
        mem.role as my_role, mem.last_read_at as my_last_read_at, mem.is_muted as my_is_muted
      FROM chat_conversations c
      LEFT JOIN chat_members mem ON c.id = mem.conversation_id AND (mem.user_id = ? OR mem.user_id = ? OR mem.user_id = ?)
      WHERE mem.user_id IS NOT NULL 
         OR (c.type = 'channel' AND c.is_private = 0)
         OR (c.type = 'direct' AND (c.id LIKE ? OR c.id LIKE ?))
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `)
      .bind(userVariants[0], userVariants[1], userVariants[2], userPattern1, userPattern2)
      .all<ChatConversationRow & { my_role?: string; my_last_read_at?: string; my_is_muted?: number }>();

    const conversations = query.results || [];

    // 2. Enrich conversations with member metadata, unread counts, and direct user info
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        // Calculate unread count for this conversation
        const unreadRes = await c.env.DB.prepare(`
          SELECT COUNT(m.id) as unread_count
          FROM chat_messages m
          WHERE m.conversation_id = ?
            AND m.sender_id != ?
            AND m.is_deleted = 0
            AND datetime(m.created_at) > datetime(?)
        `)
          .bind(conv.id, currentUser.id, conv.my_last_read_at || '1970-01-01')
          .first<{ unread_count: number }>();

        const unreadCount = Number(unreadRes?.unread_count || 0);

        // Fetch members of this conversation
        const membersRes = await c.env.DB.prepare(`
          SELECT mem.id, mem.conversation_id, mem.user_id, mem.role, mem.joined_at,
                 COALESCE(u.full_name, mem.user_id) as full_name,
                 u.email, u.avatar_image, u.designation, u.role as role_name
          FROM chat_members mem
          LEFT JOIN users u ON mem.user_id = u.id OR ('usr_' || mem.user_id) = u.id OR mem.user_id = ('usr_' || u.id)
          WHERE mem.conversation_id = ?
        `)
          .bind(conv.id)
          .all<ChatMemberRow>();

        const members = membersRes.results || [];

        // For direct chats, extract the other party
        let otherUser = null;
        if (conv.type === 'direct') {
          const rawIds = conv.id.startsWith('conv_dm_') ? conv.id.replace('conv_dm_', '').split('_') : [];
          const cleanCur = currentUser.id.replace(/^usr_/, '');
          const otherIdFromSlug = rawIds.find((id) => id !== cleanCur) || rawIds[0];

          const otherMember = members.find((m) => {
            const mClean = (m.user_id || '').replace(/^usr_/, '');
            return mClean !== cleanCur;
          }) || members[0];

          const effectiveId = otherMember?.user_id || otherIdFromSlug || 'unknown';
          const effectiveClean = effectiveId.replace(/^usr_/, '');

          let resolvedName = otherMember?.full_name;
          let resolvedRole = otherMember?.designation || otherMember?.role_name;

          if (!resolvedName || resolvedName === effectiveId || resolvedName === effectiveClean) {
            if (effectiveClean.includes('hamdan')) {
              resolvedName = 'Hamdan';
              resolvedRole = 'Finance Controller';
            } else if (effectiveClean === '1792753099441' || effectiveClean.includes('tariq')) {
              resolvedName = 'Tariq';
              resolvedRole = 'Sales Executive';
            } else if (effectiveClean === '1793801091972' || effectiveClean.includes('murshid')) {
              resolvedName = 'murshid';
              resolvedRole = 'Operation Manager';
            } else if (effectiveClean === '1792733863086' || effectiveClean.includes('mustafa')) {
              resolvedName = 'Mustafa';
              resolvedRole = 'Purchase Officer';
            } else if (effectiveClean === '1792683751142' || effectiveClean.includes('shamnad')) {
              resolvedName = 'Shamnad';
              resolvedRole = 'Managing Director / CEO';
            } else if (effectiveClean === '1792683751144' || effectiveClean.includes('shemin')) {
              resolvedName = 'Muhammed shemin';
              resolvedRole = 'COO';
            }
          }

          otherUser = {
            id: effectiveId,
            name: resolvedName || 'Colleague',
            email: otherMember?.email || `${effectiveClean}@cooltechuae.com`,
            avatar: otherMember?.avatar_image || null,
            role: resolvedRole || 'Staff',
          };
        }

        return {
          ...conv,
          is_private: Boolean(conv.is_private),
          unread_count: unreadCount,
          members_count: members.length,
          members,
          other_user: otherUser,
          is_member: Boolean(conv.my_role),
        };
      })
    );

    return c.json({
      success: true,
      conversations: enriched,
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------------------------------
// 5. POST /api/chat/conversations - Create Direct Message, Group, or Channel
// ----------------------------------------------------------------------------
chatApp.post('/conversations', async (c) => {
  const currentUser = c.get('user');
  let body: any;

  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON request payload' }, 400);
  }

  const { type, target_user_id, title, slug, description, is_private, member_ids } = body;

  if (!type || !['direct', 'group', 'channel'].includes(type)) {
    return c.json({ success: false, message: 'Conversation type must be direct, group, or channel' }, 400);
  }

  // --------------------------------------------------------------------------
  // A. DIRECT MESSAGE (with strict duplicate prevention)
  // --------------------------------------------------------------------------
  if (type === 'direct') {
    if (!target_user_id || typeof target_user_id !== 'string') {
      return c.json({ success: false, message: 'target_user_id is required for direct messaging' }, 400);
    }

    if (target_user_id === currentUser.id) {
      return c.json({ success: false, message: 'Cannot start a direct message with yourself' }, 400);
    }

    const cleanCur = String(currentUser.id || '').replace(/^usr_/, '');
    const cleanTgt = String(target_user_id || '').replace(/^usr_/, '');
    const sortedIds = [cleanCur, cleanTgt].sort();
    const deterministicConvId = `conv_dm_${sortedIds[0]}_${sortedIds[1]}`;

    // Verify target user exists and is active; if not yet in D1, auto-upsert
    let targetUser = await c.env.DB.prepare(
      'SELECT id, full_name, email, avatar_image, designation, role FROM users WHERE (id = ? OR id = ? OR id = ?) AND is_active = 1 LIMIT 1'
    )
      .bind(target_user_id, `usr_${cleanTgt}`, cleanTgt)
      .first<{ id: string; full_name: string; email: string; avatar_image?: string; designation?: string; role?: string }>();

    if (!targetUser) {
      const fallbackName = body.target_user_name || body.target_name || (cleanTgt.includes('hamdan') ? 'Hamdan' : 'Team Member');
      const fallbackRole = body.target_user_role || body.target_role || (cleanTgt.includes('hamdan') ? 'Finance Controller' : 'Staff');
      const fallbackEmail = body.target_user_email || `${cleanTgt}@cooltechuae.com`;

      try {
        await c.env.DB.prepare(`
          INSERT INTO users (id, full_name, email, role, designation, is_active, created_at, updated_at)
          VALUES (?, ?, ?, 'employee', ?, 1, datetime('now'), datetime('now'))
          ON CONFLICT(id) DO UPDATE SET is_active = 1
        `).bind(target_user_id, fallbackName, fallbackEmail, fallbackRole).run();
      } catch (upsertErr) {
        console.warn('Could not auto-upsert target user to D1:', upsertErr);
      }

      targetUser = {
        id: target_user_id,
        full_name: fallbackName,
        email: fallbackEmail,
        designation: fallbackRole,
        role: fallbackRole,
      };
    }

    // Check for existing direct conversation between currentUser and targetUser (by deterministic ID or membership)
    const existing = await c.env.DB.prepare(`
      SELECT c.id, c.type, c.title, c.slug, c.description, c.is_private, c.created_by,
             c.last_message_at, c.last_message_text, c.created_at, c.updated_at
      FROM chat_conversations c
      WHERE c.id = ? OR (
        c.type = 'direct' AND EXISTS (
          SELECT 1 FROM chat_members m1 WHERE m1.conversation_id = c.id AND (m1.user_id = ? OR m1.user_id = ? OR m1.user_id = ?)
        ) AND EXISTS (
          SELECT 1 FROM chat_members m2 WHERE m2.conversation_id = c.id AND (m2.user_id = ? OR m2.user_id = ? OR m2.user_id = ?)
        )
      )
      LIMIT 1
    `)
      .bind(
        deterministicConvId,
        currentUser.id, `usr_${cleanCur}`, cleanCur,
        target_user_id, `usr_${cleanTgt}`, cleanTgt
      )
      .first<ChatConversationRow>();

    if (existing) {
      // Ensure current user and target user are members of this conversation
      try {
        await c.env.DB.prepare(`
          INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
          VALUES (?, ?, ?, 'member', datetime('now'), datetime('now')),
                 (?, ?, ?, 'member', datetime('now'), datetime('now'))
          ON CONFLICT(conversation_id, user_id) DO NOTHING
        `).bind(
          `mem_${existing.id}_${cleanCur}`, existing.id, currentUser.id,
          `mem_${existing.id}_${cleanTgt}`, existing.id, target_user_id
        ).run();
      } catch {}

      return c.json({
        success: true,
        is_existing: true,
        conversation: {
          ...existing,
          is_private: true,
          other_user: {
            id: targetUser.id,
            name: targetUser.full_name,
            email: targetUser.email,
            avatar: targetUser.avatar_image,
            role: targetUser.designation || targetUser.role,
          },
        },
      });
    }

    // Create new direct conversation using deterministic room ID
    await c.env.DB.prepare(`
      INSERT INTO chat_conversations (id, type, title, is_private, created_by, created_at, updated_at)
      VALUES (?, 'direct', ?, 1, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO UPDATE SET updated_at = datetime('now')
    `)
      .bind(deterministicConvId, `${currentUser.full_name} & ${targetUser.full_name}`, currentUser.id)
      .run();

    // Add both members (supporting both raw and usr_ formats for universal matching)
    await c.env.DB.prepare(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
      VALUES (?, ?, ?, 'member', datetime('now'), datetime('now')),
             (?, ?, ?, 'member', datetime('now'), datetime('now'))
      ON CONFLICT(conversation_id, user_id) DO UPDATE SET last_read_at = datetime('now')
    `)
      .bind(
        `mem_${deterministicConvId}_${cleanCur}`, deterministicConvId, currentUser.id,
        `mem_${deterministicConvId}_${cleanTgt}`, deterministicConvId, target_user_id
      )
      .run();

    try {
      await c.env.DB.prepare(`
        INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
        VALUES (?, ?, ?, 'member', datetime('now'), datetime('now')),
               (?, ?, ?, 'member', datetime('now'), datetime('now'))
        ON CONFLICT(conversation_id, user_id) DO NOTHING
      `)
        .bind(
          `mem_${deterministicConvId}_raw1`, deterministicConvId, cleanCur,
          `mem_${deterministicConvId}_raw2`, deterministicConvId, cleanTgt
        )
        .run();
    } catch {}

    return c.json(
      {
        success: true,
        is_existing: false,
        conversation: {
          id: deterministicConvId,
          type: 'direct',
          title: `${currentUser.full_name} & ${targetUser.full_name}`,
          is_private: true,
          other_user: {
            id: targetUser.id,
            name: targetUser.full_name,
            email: targetUser.email,
            avatar: targetUser.avatar_image,
            role: targetUser.designation || targetUser.role,
          },
          members_count: 2,
        },
      },
      201
    );
  }

  // --------------------------------------------------------------------------
  // B. CHANNEL (Public or Private)
  // --------------------------------------------------------------------------
  if (type === 'channel') {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return c.json({ success: false, message: 'Channel title is required' }, 400);
    }

    const cleanTitle = title.trim().startsWith('#') ? title.trim() : `#${title.trim()}`;
    const cleanSlug = (slug || cleanTitle.replace(/^#/, ''))
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-');

    // Check slug uniqueness
    const existingSlug = await c.env.DB.prepare('SELECT id FROM chat_conversations WHERE slug = ? LIMIT 1')
      .bind(cleanSlug)
      .first<{ id: string }>();

    if (existingSlug) {
      return c.json({ success: false, message: `Channel with slug "${cleanSlug}" already exists` }, 409);
    }

    const newConvId = `conv_${cleanSlug}_${Date.now().toString(36)}`;
    const isPriv = is_private ? 1 : 0;

    await c.env.DB.prepare(`
      INSERT INTO chat_conversations (id, type, title, slug, description, is_private, created_by, created_at, updated_at)
      VALUES (?, 'channel', ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `)
      .bind(newConvId, cleanTitle, cleanSlug, description?.trim() || null, isPriv, currentUser.id)
      .run();

    // Add creator as owner
    await c.env.DB.prepare(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
      VALUES (?, ?, ?, 'owner', datetime('now'), datetime('now'))
    `)
      .bind(`mem_${newConvId}_owner`, newConvId, currentUser.id)
      .run();

    // Add optional initial members
    if (Array.isArray(member_ids) && member_ids.length > 0) {
      for (const mId of member_ids) {
        if (mId !== currentUser.id) {
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
            VALUES (?, ?, ?, 'member', datetime('now'), datetime('now'))
          `)
            .bind(`mem_${newConvId}_${mId}`, newConvId, mId)
            .run();
        }
      }
    }

    return c.json(
      {
        success: true,
        conversation: {
          id: newConvId,
          type: 'channel',
          title: cleanTitle,
          slug: cleanSlug,
          description: description?.trim() || null,
          is_private: Boolean(isPriv),
          created_by: currentUser.id,
        },
      },
      201
    );
  }

  // --------------------------------------------------------------------------
  // C. GROUP CHAT
  // --------------------------------------------------------------------------
  if (type === 'group') {
    if (!title || typeof title !== 'string' || !title.trim()) {
      return c.json({ success: false, message: 'Group title is required' }, 400);
    }

    const newConvId = `conv_grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await c.env.DB.prepare(`
      INSERT INTO chat_conversations (id, type, title, description, is_private, created_by, created_at, updated_at)
      VALUES (?, 'group', ?, ?, 1, ?, datetime('now'), datetime('now'))
    `)
      .bind(newConvId, title.trim(), description?.trim() || null, currentUser.id)
      .run();

    // Add creator as owner
    await c.env.DB.prepare(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
      VALUES (?, ?, ?, 'owner', datetime('now'), datetime('now'))
    `)
      .bind(`mem_${newConvId}_owner`, newConvId, currentUser.id)
      .run();

    // Add group members
    if (Array.isArray(member_ids) && member_ids.length > 0) {
      for (const mId of member_ids) {
        if (mId !== currentUser.id) {
          await c.env.DB.prepare(`
            INSERT OR IGNORE INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
            VALUES (?, ?, ?, 'member', datetime('now'), datetime('now'))
          `)
            .bind(`mem_${newConvId}_${mId}`, newConvId, mId)
            .run();
        }
      }
    }

    return c.json(
      {
        success: true,
        conversation: {
          id: newConvId,
          type: 'group',
          title: title.trim(),
          description: description?.trim() || null,
          is_private: true,
          created_by: currentUser.id,
        },
      },
      201
    );
  }

  return c.json({ success: false, message: 'Unhandled conversation type' }, 400);
});

// ----------------------------------------------------------------------------
// 6. GET /api/chat/conversations/:id - Conversation details and members
// ----------------------------------------------------------------------------
chatApp.get('/conversations/:id', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');

  const conv = await c.env.DB.prepare('SELECT * FROM chat_conversations WHERE id = ? LIMIT 1')
    .bind(convId)
    .first<ChatConversationRow>();

  if (!conv) {
    return c.json({ success: false, message: 'Conversation not found' }, 404);
  }

  const membership = await c.env.DB.prepare(
    'SELECT * FROM chat_members WHERE conversation_id = ? AND user_id = ? LIMIT 1'
  )
    .bind(convId, currentUser.id)
    .first<ChatMemberRow>();

  // If private and not a member and not Super Admin, block access
  if (conv.is_private && !membership && currentUser.role !== 'SUPER_ADMIN') {
    return c.json({ success: false, message: 'Access denied to this private conversation' }, 403);
  }

  // Fetch all members
  const membersRes = await c.env.DB.prepare(`
    SELECT mem.id, mem.conversation_id, mem.user_id, mem.role, mem.joined_at,
           u.full_name, u.email, u.avatar_image, u.designation, u.role as role_name
    FROM chat_members mem
    JOIN users u ON mem.user_id = u.id
    WHERE mem.conversation_id = ?
    ORDER BY u.full_name ASC
  `)
    .bind(convId)
    .all<ChatMemberRow>();

  return c.json({
    success: true,
    conversation: {
      ...conv,
      is_private: Boolean(conv.is_private),
      my_role: membership?.role || null,
      is_member: Boolean(membership),
      members: membersRes.results || [],
    },
  });
});

// ----------------------------------------------------------------------------
// 7. POST /api/chat/conversations/:id/members - Add member or join channel
// ----------------------------------------------------------------------------
chatApp.post('/conversations/:id/members', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');

  let body: any = {};
  try {
    body = await c.req.json();
  } catch {
    // Empty body is acceptable for self-join
  }

  const targetUserId = body.user_id || currentUser.id;

  const conv = await c.env.DB.prepare('SELECT * FROM chat_conversations WHERE id = ? LIMIT 1')
    .bind(convId)
    .first<ChatConversationRow>();

  if (!conv) {
    return c.json({ success: false, message: 'Conversation not found' }, 404);
  }

  // Check permissions:
  // If self-joining: allowed if public channel, otherwise forbidden unless added by owner/admin
  if (targetUserId === currentUser.id) {
    if (conv.is_private && currentUser.role !== 'SUPER_ADMIN') {
      return c.json({ success: false, message: 'Cannot self-join private conversation' }, 403);
    }
  } else {
    // Adding someone else: check if currentUser is owner, channel admin, or Super Admin
    const myMembership = await c.env.DB.prepare(
      'SELECT role FROM chat_members WHERE conversation_id = ? AND user_id = ? LIMIT 1'
    )
      .bind(convId, currentUser.id)
      .first<{ role: string }>();

    const canAdd =
      currentUser.role === 'SUPER_ADMIN' ||
      currentUser.role === 'ADMIN' ||
      myMembership?.role === 'owner' ||
      myMembership?.role === 'admin';

    if (!canAdd) {
      return c.json({ success: false, message: 'Only conversation administrators can add members' }, 403);
    }
  }

  // Check target user
  const targetUser = await c.env.DB.prepare('SELECT id, full_name FROM users WHERE id = ? AND is_active = 1 LIMIT 1')
    .bind(targetUserId)
    .first<{ id: string; full_name: string }>();

  if (!targetUser) {
    return c.json({ success: false, message: 'Target user not found or inactive' }, 404);
  }

  // Insert or update member
  const memberId = `mem_${convId}_${targetUserId}`;
  await c.env.DB.prepare(`
    INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
    VALUES (?, ?, ?, 'member', datetime('now'), datetime('now'))
    ON CONFLICT(conversation_id, user_id) DO NOTHING
  `)
    .bind(memberId, convId, targetUserId)
    .run();

  // Create system join message
  const sysMsgId = `msg_sys_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await c.env.DB.prepare(`
    INSERT INTO chat_messages (id, conversation_id, sender_id, sender_name, message_text, message_type, created_at, updated_at)
    VALUES (?, ?, ?, 'System', ?, 'system', datetime('now'), datetime('now'))
  `)
    .bind(sysMsgId, convId, targetUserId, `${targetUser.full_name} joined the conversation.`)
    .run();

  broadcastToRoom(c.env, convId, {
    type: 'member_joined',
    conversationId: convId,
    userId: targetUserId,
    userName: targetUser.full_name,
  });

  return c.json({ success: true, message: 'Member added successfully' });
});

// ----------------------------------------------------------------------------
// 8. DELETE /api/chat/conversations/:id/members/:userId - Remove member or leave
// ----------------------------------------------------------------------------
chatApp.delete('/conversations/:id/members/:userId', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');
  const targetUserId = c.req.param('userId');

  const myMembership = await c.env.DB.prepare(
    'SELECT role FROM chat_members WHERE conversation_id = ? AND user_id = ? LIMIT 1'
  )
    .bind(convId, currentUser.id)
    .first<{ role: string }>();

  // If user is removing themselves (leaving): allowed
  const isSelf = targetUserId === currentUser.id;
  const isAdmin =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN' ||
    myMembership?.role === 'owner' ||
    myMembership?.role === 'admin';

  if (!isSelf && !isAdmin) {
    return c.json({ success: false, message: 'Permission denied to remove member' }, 403);
  }

  await c.env.DB.prepare('DELETE FROM chat_members WHERE conversation_id = ? AND user_id = ?')
    .bind(convId, targetUserId)
    .run();

  broadcastToRoom(c.env, convId, {
    type: 'member_left',
    conversationId: convId,
    userId: targetUserId,
  });

  return c.json({ success: true, message: 'Member removed successfully' });
});

// ----------------------------------------------------------------------------
// 8b. DELETE /api/chat/conversations/:id - Delete conversation and its messages
// ----------------------------------------------------------------------------
chatApp.delete('/conversations/:id', async (c) => {
  const convId = c.req.param('id');
  try {
    await c.env.DB.prepare('DELETE FROM chat_messages WHERE conversation_id = ?').bind(convId).run();
    await c.env.DB.prepare('DELETE FROM chat_members WHERE conversation_id = ?').bind(convId).run();
    await c.env.DB.prepare('DELETE FROM chat_conversations WHERE id = ?').bind(convId).run();
    return c.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ----------------------------------------------------------------------------
// 9. GET /api/chat/conversations/:id/messages - Paginated message history
// ----------------------------------------------------------------------------
chatApp.get('/conversations/:id/messages', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');

  let conv = await c.env.DB.prepare('SELECT is_private FROM chat_conversations WHERE id = ? LIMIT 1')
    .bind(convId)
    .first<{ is_private: number }>();

  if (!conv && convId.startsWith('conv_dm_')) {
    return c.json({ success: true, messages: [], total: 0 });
  }

  if (!conv) {
    return c.json({ success: false, message: 'Conversation not found' }, 404);
  }

  // Check membership if private
  if (conv.is_private) {
    const cleanCur = (currentUser.id || '').replace(/^usr_/, '');
    const isDirectParticipant = convId.startsWith('conv_dm_') && convId.includes(cleanCur);

    const isMember = await c.env.DB.prepare(
      'SELECT id FROM chat_members WHERE conversation_id = ? AND (user_id = ? OR user_id = ? OR user_id = ?) LIMIT 1'
    )
      .bind(convId, currentUser.id, cleanCur, `usr_${cleanCur}`)
      .first<{ id: string }>();

    if (!isMember && currentUser.role !== 'SUPER_ADMIN' && !isDirectParticipant) {
      return c.json({ success: false, message: 'Access denied: not a member of this conversation' }, 403);
    }

    if (!isMember && isDirectParticipant) {
      try {
        await c.env.DB.prepare(`
          INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
          VALUES (?, ?, ?, 'member', datetime('now'), datetime('now'))
          ON CONFLICT(conversation_id, user_id) DO NOTHING
        `).bind(`mem_${convId}_${cleanCur}`, convId, currentUser.id).run();
      } catch {}
    }
  }

  const limit = Math.min(Math.max(Number(c.req.query('limit')) || 50, 1), 100);
  const before = c.req.query('before'); // Cursor: timestamp or ISO string

  let messages: ChatMessageRow[];
  if (before) {
    const query = await c.env.DB.prepare(`
      SELECT id, conversation_id, sender_id, sender_name, sender_role, sender_avatar,
             message_text, message_type, attachments, is_edited, edited_at, is_deleted, deleted_at,
             created_at, updated_at
      FROM chat_messages
      WHERE conversation_id = ? AND created_at < ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
      .bind(convId, before, limit)
      .all<ChatMessageRow>();

    messages = (query.results || []).reverse();
  } else {
    const query = await c.env.DB.prepare(`
      SELECT id, conversation_id, sender_id, sender_name, sender_role, sender_avatar,
             message_text, message_type, attachments, is_edited, edited_at, is_deleted, deleted_at,
             created_at, updated_at
      FROM chat_messages
      WHERE conversation_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `)
      .bind(convId, limit)
      .all<ChatMessageRow>();

    messages = (query.results || []).reverse();
  }

  // Auto-mark conversation as read for the current user
  await c.env.DB.prepare(
    "UPDATE chat_members SET last_read_at = datetime('now') WHERE conversation_id = ? AND user_id = ?"
  )
    .bind(convId, currentUser.id)
    .run();

  return c.json({
    success: true,
    messages: messages.map((m) => ({
      ...m,
      is_edited: Boolean(m.is_edited),
      is_deleted: Boolean(m.is_deleted),
      attachments: m.attachments ? JSON.parse(m.attachments) : [],
    })),
    has_more: messages.length === limit,
  });
});

// ----------------------------------------------------------------------------
// 10. POST /api/chat/conversations/:id/messages - Send a new message
// ----------------------------------------------------------------------------
chatApp.post('/conversations/:id/messages', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON request payload' }, 400);
  }

  const { message_text, attachments, message_type = 'text' } = body;

  if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
    return c.json({ success: false, message: 'Message text cannot be empty' }, 400);
  }

  const trimmedText = message_text.trim();
  if (trimmedText.length > 4000) {
    return c.json({ success: false, message: 'Message exceeds maximum length of 4000 characters' }, 400);
  }

  let conv = await c.env.DB.prepare('SELECT id, is_private, type FROM chat_conversations WHERE id = ? LIMIT 1')
    .bind(convId)
    .first<ChatConversationRow>();

  if (!conv && convId.startsWith('conv_dm_')) {
    const rawIds = convId.replace('conv_dm_', '').split('_');
    const u1 = rawIds[0];
    const u2 = rawIds[1];
    await c.env.DB.prepare(`
      INSERT INTO chat_conversations (id, type, title, is_private, created_by, created_at, updated_at)
      VALUES (?, 'direct', 'Direct Message', 1, ?, datetime('now'), datetime('now'))
      ON CONFLICT(id) DO NOTHING
    `).bind(convId, currentUser.id).run();

    await c.env.DB.prepare(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at)
      VALUES (?, ?, ?, 'member', datetime('now')),
             (?, ?, ?, 'member', datetime('now')),
             (?, ?, ?, 'member', datetime('now')),
             (?, ?, ?, 'member', datetime('now'))
      ON CONFLICT(conversation_id, user_id) DO NOTHING
    `).bind(
      `mem_${convId}_${u1}`, convId, u1,
      `mem_${convId}_${u2}`, convId, u2,
      `mem_${convId}_usr_${u1}`, convId, `usr_${u1}`,
      `mem_${convId}_usr_${u2}`, convId, `usr_${u2}`
    ).run();

    conv = await c.env.DB.prepare('SELECT id, is_private, type FROM chat_conversations WHERE id = ? LIMIT 1')
      .bind(convId)
      .first<ChatConversationRow>();
  }

  if (!conv) {
    return c.json({ success: false, message: 'Conversation not found' }, 404);
  }

  const cleanCurrentId = (currentUser.id || '').replace(/^usr_/, '');
  const isDirectParticipant = (conv.type === 'direct' || convId.startsWith('conv_dm_')) && (convId.includes(cleanCurrentId) || convId.includes(currentUser.id));

  // Check membership; if public channel or direct message participant and not yet member, auto-join
  const membership = await c.env.DB.prepare(
    'SELECT id FROM chat_members WHERE conversation_id = ? AND (user_id = ? OR user_id = ? OR user_id = ?) LIMIT 1'
  )
    .bind(convId, currentUser.id, cleanCurrentId, `usr_${cleanCurrentId}`)
    .first<{ id: string }>();

  if (!membership) {
    if (conv.is_private && currentUser.role !== 'SUPER_ADMIN' && !isDirectParticipant) {
      return c.json({ success: false, message: 'Forbidden: You are not a member of this conversation' }, 403);
    }

    // Auto-join
    await c.env.DB.prepare(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
      VALUES (?, ?, ?, 'member', datetime('now'), datetime('now'))
      ON CONFLICT(conversation_id, user_id) DO NOTHING
    `)
      .bind(`mem_${convId}_${currentUser.id}`, convId, currentUser.id)
      .run();
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const senderRole = currentUser.designation || currentUser.position || currentUser.role;
  const attachmentsJson = Array.isArray(attachments) ? JSON.stringify(attachments) : null;
  const senderName = currentUser.full_name || currentUser.username || 'Team Member';

  await c.env.DB.prepare(`
    INSERT INTO chat_messages (
      id, conversation_id, sender_id, sender_name, sender_role, sender_avatar,
      message_text, message_type, attachments, is_edited, is_deleted, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, datetime('now'), datetime('now'))
  `)
    .bind(
      messageId,
      convId,
      currentUser.id,
      senderName,
      senderRole,
      currentUser.avatar_image || (currentUser as any).avatar || null,
      trimmedText,
      message_type,
      attachmentsJson
    )
    .run();

  // Update conversation last message details
  await c.env.DB.prepare(`
    UPDATE chat_conversations
    SET last_message_at = datetime('now'),
        last_message_text = ?,
        last_message_sender_id = ?,
        last_message_sender_name = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `)
    .bind(trimmedText.slice(0, 150), currentUser.id, senderName, convId)
    .run();

  // Mark sender's read pointer
  await c.env.DB.prepare(
    "UPDATE chat_members SET last_read_at = datetime('now') WHERE conversation_id = ? AND user_id = ?"
  )
    .bind(convId, currentUser.id)
    .run();

  const newMessage = {
    id: messageId,
    conversation_id: convId,
    sender_id: currentUser.id,
    sender_name: senderName,
    sender_role: senderRole,
    sender_avatar: currentUser.avatar_image || (currentUser as any).avatar || null,
    message_text: trimmedText,
    message_type,
    attachments: Array.isArray(attachments) ? attachments : [],
    is_edited: false,
    is_deleted: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Broadcast to live WebSocket connections
  broadcastToRoom(c.env, convId, {
    type: 'new_message',
    conversationId: convId,
    message: newMessage,
  });

  return c.json({ success: true, message: newMessage }, 201);
});

// ----------------------------------------------------------------------------
// 11. PUT /api/chat/conversations/:id/messages/:messageId - Edit message
// ----------------------------------------------------------------------------
chatApp.put('/conversations/:id/messages/:messageId', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');
  const msgId = c.req.param('messageId');

  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, message: 'Invalid JSON request payload' }, 400);
  }

  const { message_text } = body;
  if (!message_text || typeof message_text !== 'string' || !message_text.trim()) {
    return c.json({ success: false, message: 'Edited message text cannot be empty' }, 400);
  }

  const msg = await c.env.DB.prepare(
    'SELECT * FROM chat_messages WHERE id = ? AND conversation_id = ? LIMIT 1'
  )
    .bind(msgId, convId)
    .first<ChatMessageRow>();

  if (!msg) {
    return c.json({ success: false, message: 'Message not found' }, 404);
  }

  // Only the author can edit their message
  if (msg.sender_id !== currentUser.id) {
    return c.json({ success: false, message: 'You can only edit your own messages' }, 403);
  }

  const trimmedText = message_text.trim();
  await c.env.DB.prepare(`
    UPDATE chat_messages
    SET message_text = ?, is_edited = 1, edited_at = datetime('now'), updated_at = datetime('now')
    WHERE id = ?
  `)
    .bind(trimmedText, msgId)
    .run();

  const editedMessage = {
    ...msg,
    message_text: trimmedText,
    is_edited: true,
    edited_at: new Date().toISOString(),
  };

  broadcastToRoom(c.env, convId, {
    type: 'message_edited',
    conversationId: convId,
    messageId: msgId,
    messageText: trimmedText,
  });

  return c.json({ success: true, message: editedMessage });
});

// ----------------------------------------------------------------------------
// 12. DELETE /api/chat/conversations/:id/messages/:messageId - Delete message
// ----------------------------------------------------------------------------
chatApp.delete('/conversations/:id/messages/:messageId', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');
  const msgId = c.req.param('messageId');

  const msg = await c.env.DB.prepare(
    'SELECT * FROM chat_messages WHERE id = ? AND conversation_id = ? LIMIT 1'
  )
    .bind(msgId, convId)
    .first<ChatMessageRow>();

  if (!msg) {
    return c.json({ success: false, message: 'Message not found' }, 404);
  }

  const canDelete =
    msg.sender_id === currentUser.id ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'ADMIN';

  if (!canDelete) {
    return c.json({ success: false, message: 'You do not have permission to delete this message' }, 403);
  }

  // Soft delete message to preserve conversation thread integrity
  await c.env.DB.prepare(`
    UPDATE chat_messages
    SET is_deleted = 1, deleted_at = datetime('now'), message_text = 'This message was deleted.', updated_at = datetime('now')
    WHERE id = ?
  `)
    .bind(msgId)
    .run();

  broadcastToRoom(c.env, convId, {
    type: 'message_deleted',
    conversationId: convId,
    messageId: msgId,
  });

  return c.json({ success: true, message: 'Message deleted successfully' });
});

// ----------------------------------------------------------------------------
// 13. POST /api/chat/conversations/:id/read - Mark conversation as read
// ----------------------------------------------------------------------------
chatApp.post('/conversations/:id/read', async (c) => {
  const currentUser = c.get('user');
  const convId = c.req.param('id');

  await c.env.DB.prepare(
    "UPDATE chat_members SET last_read_at = datetime('now') WHERE conversation_id = ? AND user_id = ?"
  )
    .bind(convId, currentUser.id)
    .run();

  return c.json({ success: true, message: 'Conversation marked as read' });
});

export { chatApp };

