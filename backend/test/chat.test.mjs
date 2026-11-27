/**
 * Automated Test Suite for Live Chat System (cool-tech-crm-api)
 * 
 * Verifies:
 * 1. Authentication enforcement (401 on unauthenticated requests)
 * 2. Listing active CRM colleagues to chat with
 * 3. Starting a direct conversation
 * 4. Duplicate direct conversation prevention between the same two users
 * 5. Creating public and private channels
 * 6. Private channel authorization checks (403 on non-member access)
 * 7. Sending messages and retrieving paginated message history
 * 8. Editing own messages (and blocking other users from editing)
 * 9. Deleting messages (soft deletion)
 * 10. Marking conversations as read and unread badge counts
 * 11. Group conversation creation, member addition and member removal
 * 12. Input validation for empty or oversized messages
 */

import { describe, it, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const TEST_KID = 'chat-test-key-1';

function createChatDatabase() {
  const sqlite = new DatabaseSync(':memory:');

  // 1. Users table
  sqlite.exec(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE')),
    position TEXT,
    department TEXT,
    team_id TEXT,
    reports_to TEXT REFERENCES users(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    phone TEXT,
    username TEXT,
    avatar_image TEXT,
    dob TEXT,
    designation TEXT,
    business_opportunity TEXT,
    store TEXT,
    sales_visit_permission INTEGER DEFAULT 0,
    permissions TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );`);

  // 2. Chat schema migration
  const chatMigration = fs.readFileSync(path.resolve(__dirname, '../migrations/0012_live_chat_system.sql'), 'utf8');
  sqlite.exec(chatMigration);

  const mockD1 = {
    prepare(sql) {
      return {
        _sql: sql,
        _bindings: [],
        bind(...args) {
          this._bindings = args.map((v) => (v === undefined ? null : v));
          return this;
        },
        async first(col) {
          const stmt = sqlite.prepare(this._sql);
          const row = stmt.get(...this._bindings);
          if (!row) return null;
          if (col && typeof col === 'string') return row[col];
          return row;
        },
        async all() {
          const stmt = sqlite.prepare(this._sql);
          const results = stmt.all(...this._bindings);
          return { results, success: true };
        },
        async run() {
          const stmt = sqlite.prepare(this._sql);
          const result = stmt.run(...this._bindings);
          return {
            success: true,
            meta: {
              changes: result.changes,
              last_row_id: Number(result.lastInsertRowid),
            },
          };
        },
      };
    },
  };

  return { sqlite, mockD1 };
}

describe('Live Chat System API Test Suite', () => {
  let privateKey;
  let mockEnv;
  let sqliteDb;

  let tokenShemin; // CEO (SUPER_ADMIN)
  let tokenNishad; // Sales Executive (EMPLOYEE)
  let tokenFahad;  // Operations Manager (MANAGER)
  let tokenMustafa;// Purchase Manager (MANAGER)

  before(async () => {
    const keyPair = await generateKeyPair('RS256', { extractable: true });
    privateKey = keyPair.privateKey;

    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === TEST_KID) {
        return keyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };
    setCustomJWKS(mockJWKS);

    // Mint test tokens
    tokenShemin = await new SignJWT({
      user_id: 'fb_uid_shemin_ceo',
      sub: 'fb_uid_shemin_ceo',
      email: 'shemin@cooltechuae.com',
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    tokenNishad = await new SignJWT({
      user_id: 'fb_uid_nishad_sales',
      sub: 'fb_uid_nishad_sales',
      email: 'nishad@cooltechuae.com',
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    tokenFahad = await new SignJWT({
      user_id: 'fb_uid_fahad_ops',
      sub: 'fb_uid_fahad_ops',
      email: 'fahad@cooltechuae.com',
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);

    tokenMustafa = await new SignJWT({
      user_id: 'fb_uid_mustafa_purch',
      sub: 'fb_uid_mustafa_purch',
      email: 'mustafa@cooltechuae.com',
    })
      .setProtectedHeader({ alg: 'RS256', kid: TEST_KID })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey);
  });

  beforeEach(() => {
    const { sqlite, mockD1 } = createChatDatabase();
    sqliteDb = sqlite;

    // Seed test CRM users
    sqliteDb.exec(`
      INSERT INTO users (id, firebase_uid, email, full_name, role, department, designation, is_active)
      VALUES 
      ('usr_shemin', 'fb_uid_shemin_ceo', 'shemin@cooltechuae.com', 'Shemin', 'SUPER_ADMIN', 'Executive', 'CEO', 1),
      ('usr_nishad', 'fb_uid_nishad_sales', 'nishad@cooltechuae.com', 'Nishad', 'EMPLOYEE', 'Sales', 'Sales Executive', 1),
      ('usr_fahad', 'fb_uid_fahad_ops', 'fahad@cooltechuae.com', 'Fahad', 'MANAGER', 'Operations', 'Operations Manager', 1),
      ('usr_mustafa', 'fb_uid_mustafa_purch', 'mustafa@cooltechuae.com', 'Mustafa', 'MANAGER', 'Purchase', 'Purchase Manager', 1);
    `);

    mockEnv = {
      DB: mockD1,
      FIREBASE_PROJECT_ID: PROJECT_ID,
      ALLOWED_ORIGIN: 'http://localhost:3000',
    };
  });

  // 1. Authentication
  it('1. GET /api/chat/conversations without token should return 401 UNAUTHORIZED', async () => {
    const res = await app.request('/api/chat/conversations', { method: 'GET' }, mockEnv);
    assert.equal(res.status, 401);
  });

  // 2. Listing users to chat with
  it('2. GET /api/chat/users should list other active CRM colleagues excluding the current user', async () => {
    const res = await app.request('/api/chat/users', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(Array.isArray(body.users), true);
    assert.equal(body.users.length, 3); // Shemin, Fahad, Mustafa (excluding Nishad)
    const names = body.users.map((u) => u.full_name);
    assert.equal(names.includes('Shemin'), true);
    assert.equal(names.includes('Nishad'), false);
  });

  // 3. Direct Message Creation
  it('3. POST /api/chat/conversations (direct) should start a private conversation between two users', async () => {
    const res = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'direct',
        target_user_id: 'usr_shemin',
      }),
    }, mockEnv);

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.is_existing, false);
    assert.equal(body.conversation.type, 'direct');
    assert.equal(body.conversation.other_user.id, 'usr_shemin');
    assert.equal(body.conversation.other_user.name, 'Shemin');
  });

  // 4. Duplicate Direct Conversation Prevention
  it('4. POST /api/chat/conversations (direct) should prevent duplicates and return the existing conversation', async () => {
    // Nishad starts direct chat with Shemin
    const res1 = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'direct',
        target_user_id: 'usr_shemin',
      }),
    }, mockEnv);

    assert.equal(res1.status, 201);
    const body1 = await res1.json();
    const convId = body1.conversation.id;

    // Shemin requests direct chat with Nishad (opposite direction)
    const res2 = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'direct',
        target_user_id: 'usr_nishad',
      }),
    }, mockEnv);

    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.success, true);
    assert.equal(body2.is_existing, true);
    assert.equal(body2.conversation.id, convId); // Exactly the same conversation ID!
  });

  // 5. Channels Creation & Public Channels Seed
  it('5. Default company channels should be seeded and accessible to all active employees', async () => {
    const res = await app.request('/api/chat/conversations', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    const slugs = body.conversations.map((c) => c.slug);
    assert.equal(slugs.includes('general'), true);
    assert.equal(slugs.includes('sales'), true);
    assert.equal(slugs.includes('purchase'), true);
    assert.equal(slugs.includes('operations'), true);
  });

  it('6. POST /api/chat/conversations (channel) should create a new named channel', async () => {
    const res = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'channel',
        title: 'Project Chiller Overhaul',
        description: 'Coordination channel for Chiller replacement project',
        is_private: 0,
      }),
    }, mockEnv);

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.conversation.title, '#Project Chiller Overhaul');
    assert.equal(body.conversation.slug, 'project-chiller-overhaul');
    assert.equal(body.conversation.is_private, false);
  });

  // 6. Private Channel Security
  it('7. Private channels should be forbidden to non-members (403)', async () => {
    // Shemin creates private channel #executive-board
    const createRes = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'channel',
        title: 'executive-board',
        description: 'Confidential executive discussions',
        is_private: 1,
      }),
    }, mockEnv);

    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    const privateChannelId = created.conversation.id;

    // Nishad (regular employee) tries to access private channel messages
    const accessRes = await app.request(`/api/chat/conversations/${privateChannelId}/messages`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(accessRes.status, 403);
    const accessBody = await accessRes.json();
    assert.equal(accessBody.success, false);
  });

  // 7. Message Sending & Retrieval
  it('8. POST & GET /api/chat/conversations/:id/messages should send and fetch messages in chronological order', async () => {
    // 1. Send first message in #general
    const sendRes1 = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Good morning Cool Technologies team! Welcome to the new CRM Live Chat.',
      }),
    }, mockEnv);

    assert.equal(sendRes1.status, 201);
    const sendBody1 = await sendRes1.json();
    assert.equal(sendBody1.success, true);
    assert.equal(sendBody1.message.sender_name, 'Shemin');
    assert.equal(sendBody1.message.sender_role, 'CEO');

    // 2. Nishad replies
    const sendRes2 = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Good morning Shemin! Ready for today’s field operations.',
      }),
    }, mockEnv);

    assert.equal(sendRes2.status, 201);

    // 3. Fetch message history
    const getRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(getRes.status, 200);
    const getBody = await getRes.json();
    assert.equal(getBody.success, true);
    assert.equal(getBody.messages.length, 2);
    assert.equal(getBody.messages[0].sender_name, 'Shemin');
    assert.equal(getBody.messages[1].sender_name, 'Nishad');
  });

  // 8. Message Editing
  it('9. PUT /api/chat/conversations/:id/messages/:msgId should edit own message, but reject other users (403)', async () => {
    // 1. Nishad posts message
    const sendRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Typo here: Meet me at 11:00 PM',
      }),
    }, mockEnv);

    const msgId = (await sendRes.json()).message.id;

    // 2. Mustafa tries to edit Nishad's message -> 403
    const editOtherRes = await app.request(`/api/chat/conversations/conv_general/messages/${msgId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenMustafa}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Malicious modification',
      }),
    }, mockEnv);

    assert.equal(editOtherRes.status, 403);

    // 3. Nishad edits his own message -> 200
    const editOwnRes = await app.request(`/api/chat/conversations/conv_general/messages/${msgId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Corrected: Meet me at 11:00 AM',
      }),
    }, mockEnv);

    assert.equal(editOwnRes.status, 200);
    const editBody = await editOwnRes.json();
    assert.equal(editBody.message.message_text, 'Corrected: Meet me at 11:00 AM');
    assert.equal(editBody.message.is_edited, true);
  });

  // 9. Message Deletion
  it('10. DELETE /api/chat/conversations/:id/messages/:msgId should soft delete the message', async () => {
    const sendRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message_text: 'Notice: Test message to be deleted',
      }),
    }, mockEnv);

    const msgId = (await sendRes.json()).message.id;

    const delRes = await app.request(`/api/chat/conversations/conv_general/messages/${msgId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(delRes.status, 200);

    // Check message state in list
    const getRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    const getBody = await getRes.json();
    const deletedMsg = getBody.messages.find((m) => m.id === msgId);
    assert.equal(deletedMsg.is_deleted, true);
    assert.equal(deletedMsg.message_text, 'This message was deleted.');
  });

  // 10. Read Tracking & Unread Counts
  it('11. Unread counts and read markers should update accurately when messages are viewed', async () => {
    // 1. Fahad sends a message in #sales
    await app.request('/api/chat/conversations/conv_sales/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenFahad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_text: 'New enquiry received for 10 Chiller split units.' }),
    }, mockEnv);

    // Join Nishad to #sales with an old read pointer
    sqliteDb.exec(`
      INSERT INTO chat_members (id, conversation_id, user_id, role, joined_at, last_read_at)
      VALUES ('mem_sales_nishad', 'conv_sales', 'usr_nishad', 'member', datetime('now'), '2020-01-01');
    `);

    // Check Nishad's unread count
    const unreadRes = await app.request('/api/chat/unread', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(unreadRes.status, 200);
    const unreadBody = await unreadRes.json();
    assert.equal(unreadBody.unread_count >= 1, true);

    // Nishad marks conversation as read
    const markReadRes = await app.request('/api/chat/conversations/conv_sales/read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    assert.equal(markReadRes.status, 200);

    // Check unread count again -> should be 0 for this conversation
    const convListRes = await app.request('/api/chat/conversations', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNishad}` },
    }, mockEnv);

    const convList = await convListRes.json();
    const salesConv = convList.conversations.find((c) => c.id === 'conv_sales');
    assert.equal(salesConv.unread_count, 0);
  });

  // 11. Group Creation, Member Addition and Removal
  it('12. Group conversation should allow adding and removing authorized colleagues', async () => {
    // Shemin creates group with Nishad
    const createRes = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'group',
        title: 'Dubai Marina AMC Squad',
        member_ids: ['usr_nishad'],
      }),
    }, mockEnv);

    assert.equal(createRes.status, 201);
    const group = (await createRes.json()).conversation;

    // Shemin adds Fahad
    const addRes = await app.request(`/api/chat/conversations/${group.id}/members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: 'usr_fahad' }),
    }, mockEnv);

    assert.equal(addRes.status, 200);

    // Fahad leaves the group
    const leaveRes = await app.request(`/api/chat/conversations/${group.id}/members/usr_fahad`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenFahad}` },
    }, mockEnv);

    assert.equal(leaveRes.status, 200);
  });

  // 12. Input validation
  it('13. POST /api/chat/conversations/:id/messages should reject empty text or text > 4000 characters', async () => {
    // Empty message
    const emptyRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_text: '   ' }),
    }, mockEnv);

    assert.equal(emptyRes.status, 400);

    // Oversized message
    const longRes = await app.request('/api/chat/conversations/conv_general/messages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNishad}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_text: 'A'.repeat(4001) }),
    }, mockEnv);

    assert.equal(longRes.status, 400);
  });

  // 13. Permanent conversation deletion
  it('14. DELETE /api/chat/conversations/:id should permanently remove conversation, members, and messages', async () => {
    // Shemin creates a direct conversation with Mustafa
    const createRes = await app.request('/api/chat/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'direct',
        target_user_id: 'usr_mustafa',
      }),
    }, mockEnv);

    assert.equal(createRes.status, 201);
    const conv = (await createRes.json()).conversation;

    // Send a message
    const sendRes = await app.request(`/api/chat/conversations/${conv.id}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message_text: 'Hello Mustafa' }),
    }, mockEnv);
    assert.equal(sendRes.status, 201);

    // Delete the conversation
    const deleteRes = await app.request(`/api/chat/conversations/${conv.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
      },
    }, mockEnv);
    assert.equal(deleteRes.status, 200);

    // Verify conversation is gone
    const getRes = await app.request(`/api/chat/conversations/${conv.id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${tokenShemin}`,
      },
    }, mockEnv);
    assert.equal(getRes.status, 404);
  });
});
