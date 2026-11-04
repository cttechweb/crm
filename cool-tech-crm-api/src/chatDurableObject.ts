/**
 * Cloudflare Durable Object for Live Chat WebSockets (cool-tech-crm-api)
 * 
 * Manages active WebSocket connections per conversation/room:
 * - WebSocket upgrade and connection lifecycle
 * - Secure message broadcasting to connected room members
 * - Real-time typing indicators
 * - Internal HTTP broadcast hook from REST message POST endpoint
 */

import type { Env } from './types.ts';

export interface ChatSession {
  userId: string;
  userName: string;
  conversationId: string;
}

export class ChatRoom {
  state: DurableObjectState;
  env: Env;
  sessions: Map<WebSocket, ChatSession>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // 1. Internal HTTP broadcast endpoint (invoked by REST POST /messages)
    if (request.method === 'POST' && url.pathname.endsWith('/broadcast')) {
      try {
        const payload = await request.json();
        this.broadcast(payload);
        return new Response(JSON.stringify({ success: true, delivered: this.sessions.size }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ success: false, error: err.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // 2. WebSocket upgrade check
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket connection', { status: 426 });
    }

    const userId = url.searchParams.get('userId') || 'anonymous';
    const userName = url.searchParams.get('userName') || 'Team Member';
    const conversationId = url.searchParams.get('conversationId') || 'general';

    // Standard WebSocketPair provided by Cloudflare Workers runtime
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    this.handleWebSocket(server, { userId, userName, conversationId });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private handleWebSocket(ws: WebSocket, session: ChatSession): void {
    // Accept WebSocket connection on server side
    ws.accept();
    this.sessions.set(ws, session);

    // Broadcast member active status
    this.broadcast({
      type: 'user_connected',
      conversationId: session.conversationId,
      userId: session.userId,
      userName: session.userName,
      timestamp: new Date().toISOString(),
    });

    ws.addEventListener('message', (event: MessageEvent) => {
      try {
        const rawText = typeof event.data === 'string' ? event.data : new TextDecoder().decode(event.data as ArrayBuffer);
        const data = JSON.parse(rawText);

        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          return;
        }

        if (data.type === 'typing') {
          this.broadcast(
            {
              type: 'typing',
              conversationId: session.conversationId,
              userId: session.userId,
              userName: session.userName,
              isTyping: Boolean(data.isTyping),
            },
            ws // exclude sender
          );
        }
      } catch {
        // Silently ignore invalid non-JSON frames
      }
    });

    const cleanup = () => {
      this.sessions.delete(ws);
      this.broadcast({
        type: 'user_disconnected',
        conversationId: session.conversationId,
        userId: session.userId,
        userName: session.userName,
        timestamp: new Date().toISOString(),
      });
    };

    ws.addEventListener('close', cleanup);
    ws.addEventListener('error', cleanup);

    // Initial connection acknowledgment
    ws.send(
      JSON.stringify({
        type: 'connected',
        session: { userId: session.userId, conversationId: session.conversationId },
        timestamp: new Date().toISOString(),
      })
    );
  }

  public broadcast(message: unknown, excludeWs?: WebSocket): void {
    const raw = typeof message === 'string' ? message : JSON.stringify(message);
    for (const [ws] of this.sessions.entries()) {
      if (excludeWs && ws === excludeWs) continue;
      try {
        ws.send(raw);
      } catch {
        this.sessions.delete(ws);
      }
    }
  }
}

