/**
 * System Notifications API & Dispatcher
 * Powers the real-time navbar notification bell across Sales, Warehouse, and Purchase teams.
 */

import { Hono } from 'hono';
import type { Env, AppVariables, SystemNotificationRow } from './types.ts';
import { authMiddleware } from './auth.ts';

export const notificationsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * Ensures the system_notifications table and indexes exist in D1.
 */
export async function ensureNotificationSchema(db: any) {
  try {
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS system_notifications (
        id TEXT PRIMARY KEY,
        recipient_id TEXT,
        recipient_role TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT DEFAULT 'info',
        link_url TEXT,
        is_read INTEGER DEFAULT 0,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `).run();

    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON system_notifications(recipient_id, is_read)
    `).run();
  } catch (err) {
    console.error('Failed to ensure notifications table:', err);
  }
}

/**
 * Helper to dispatch a notification to a specific user, role, or department.
 */
export async function createSystemNotification(
  db: any,
  data: {
    recipientId?: string | null;
    recipientRole?: string | null;
    title: string;
    message: string;
    type?: 'msrf' | 'shortage' | 'po' | 'grn' | 'approval' | 'closure' | 'info' | 'stock_available' | string;
    linkUrl?: string | null;
    metadata?: any;
  }
): Promise<string | null> {
  try {
    await ensureNotificationSchema(db);

    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const metaStr = data.metadata
      ? (typeof data.metadata === 'string' ? data.metadata : JSON.stringify(data.metadata))
      : null;

    const targetId = data.recipientId ? String(data.recipientId).toLowerCase().trim() : null;
    const targetRole = data.recipientRole ? String(data.recipientRole).toLowerCase().trim() : null;

    await db.prepare(`
      INSERT INTO system_notifications (
        id, recipient_id, recipient_role, title, message, type, link_url, is_read, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      targetId,
      targetRole,
      data.title,
      data.message,
      data.type || 'info',
      data.linkUrl || null,
      metaStr,
      now
    ).run();

    return id;
  } catch (err) {
    console.error('Error dispatching system notification:', err);
    return null;
  }
}

/**
 * Auto-seeds initial workflow notifications if table is fresh so existing requisitions show context.
 */
async function backfillInitialNotifications(db: D1Database) {
  try {
    const countCheck = await db.prepare('SELECT COUNT(*) as cnt FROM system_notifications').first<{ cnt: number }>();
    if (countCheck && countCheck.cnt > 0) return;

    // Check if MSRF-2026-0001 exists in Sourcing Quotes
    const msrf = await db.prepare(
      'SELECT id, msrf_number, sales_order_number, procurement_status, purchase_instructions FROM material_service_requests WHERE msrf_number = ? LIMIT 1'
    ).bind('MSRF-2026-0001').first<any>();

    if (msrf) {
      // 1. Notification for Mustafa (Purchase Manager)
      await createSystemNotification(db, {
        recipientId: 'mustafa',
        recipientRole: 'purchase',
        title: 'Warehouse Shortage Forwarded for Sourcing',
        message: `Fahad verified complete stock shortage for ${msrf.msrf_number} (Sales Order ${msrf.sales_order_number || 'CTSO#3920'}). Please obtain external supplier quotations.`,
        type: 'shortage',
        linkUrl: `/purchase?tab=quotations&msrfId=${msrf.id}`,
        metadata: { msrfNumber: msrf.msrf_number, source: 'warehouse_shortage' },
      });

      // 2. Notification for Fahad (Operations)
      await createSystemNotification(db, {
        recipientId: 'fahad',
        recipientRole: 'operations',
        title: 'Material Request Intake Completed',
        message: `Material Request ${msrf.msrf_number} was verified and shortage dispatched to Purchase Department (Mustafa).`,
        type: 'msrf',
        linkUrl: `/purchase?tab=msrf&msrfId=${msrf.id}`,
        metadata: { msrfNumber: msrf.msrf_number, source: 'intake_audit' },
      });
    }
  } catch (err) {
    console.error('Backfill notifications error:', err);
  }
}

// -----------------------------------------------------------------------------
// ENDPOINTS
// -----------------------------------------------------------------------------

/**
 * GET /api/notifications
 * Retrieves notifications for the active user, department, or role.
 */
notificationsApp.get('/', async (c) => {
  const db = c.env.DB;
  await ensureNotificationSchema(db);
  await backfillInitialNotifications(db);

  const authUser = c.get('user');
  const qUserId = c.req.query('userId') || authUser?.id || '';
  const qUserName = c.req.query('userName') || authUser?.username || authUser?.full_name || '';
  const qRole = c.req.query('role') || authUser?.role || '';
  const qDept = c.req.query('department') || authUser?.department || '';

  const normalizedUserId = String(qUserId).toLowerCase().trim();
  const normalizedUserName = String(qUserName).toLowerCase().trim();
  const normalizedRole = String(qRole).toLowerCase().trim();
  const normalizedDept = String(qDept).toLowerCase().trim();

  // Super Admin / Executive gets full visibility
  const isSuperAdmin = normalizedRole.includes('super_admin') || normalizedRole.includes('super admin') || normalizedRole === 'admin';

  let rows: SystemNotificationRow[] = [];

  try {
    if (isSuperAdmin) {
      const result = await db.prepare(`
        SELECT * FROM system_notifications
        ORDER BY created_at DESC
        LIMIT 50
      `).all<SystemNotificationRow>();
      rows = result.results || [];
    } else {
      const result = await db.prepare(`
        SELECT * FROM system_notifications
        WHERE recipient_id IS NULL
           OR recipient_id = 'all'
           OR recipient_id = ?
           OR recipient_id = ?
           OR recipient_role IS NULL
           OR recipient_role = 'all'
           OR recipient_role = ?
           OR recipient_role = ?
           OR (recipient_role = 'sales_manager' AND (? = 'manager' OR ? = 'sales'))
        ORDER BY created_at DESC
        LIMIT 50
      `)
        .bind(
          normalizedUserId,
          normalizedUserName,
          normalizedRole,
          normalizedDept,
          normalizedRole,
          normalizedDept
        )
        .all<SystemNotificationRow>();
      rows = result.results || [];
    }

    const unreadCount = rows.filter((r) => !r.is_read).length;

    return c.json({
      success: true,
      notifications: rows,
      unreadCount,
    });
  } catch (err: any) {
    return c.json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: err?.message,
    }, 500);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read.
 */
notificationsApp.patch('/:id/read', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id');

  try {
    await ensureNotificationSchema(db);
    await db.prepare('UPDATE system_notifications SET is_read = 1 WHERE id = ?').bind(id).run();

    return c.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (err: any) {
    return c.json({
      success: false,
      message: 'Failed to update notification',
      error: err?.message,
    }, 500);
  }
});

/**
 * POST /api/notifications/mark-all-read
 * Marks all notifications for a given user/role as read.
 */
notificationsApp.post('/mark-all-read', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json().catch(() => ({}));
  const targetUser = body.userId ? String(body.userId).toLowerCase().trim() : '';
  const targetUserName = body.userName ? String(body.userName).toLowerCase().trim() : '';
  const targetRole = body.role ? String(body.role).toLowerCase().trim() : '';
  const targetDept = body.department ? String(body.department).toLowerCase().trim() : '';
  const notificationIds = Array.isArray(body.notificationIds) ? body.notificationIds : [];

  try {
    await ensureNotificationSchema(db);

    // 1. If explicit notification IDs were sent, mark them read directly
    if (notificationIds.length > 0) {
      for (const id of notificationIds) {
        if (id && typeof id === 'string') {
          await db.prepare('UPDATE system_notifications SET is_read = 1 WHERE id = ?').bind(id).run();
        }
      }
    }

    // 2. Mark read by user, username, role, or department matching
    if (targetUser || targetUserName || targetRole || targetDept) {
      await db.prepare(`
        UPDATE system_notifications
        SET is_read = 1
        WHERE recipient_id IS NULL
           OR recipient_id = 'all'
           OR recipient_id = ?
           OR recipient_id = ?
           OR recipient_role IS NULL
           OR recipient_role = 'all'
           OR recipient_role = ?
           OR recipient_role = ?
           OR (recipient_role = 'sales_manager' AND (? = 'manager' OR ? = 'sales'))
      `).bind(
        targetUser,
        targetUserName,
        targetRole,
        targetDept,
        targetRole,
        targetDept
      ).run();
    } else {
      await db.prepare('UPDATE system_notifications SET is_read = 1').run();
    }

    return c.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err: any) {
    return c.json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: err?.message,
    }, 500);
  }
});

/**
 * POST /api/notifications
 * Creates a notification manually from client or automated processes.
 */
notificationsApp.post('/', async (c) => {
  const db = c.env.DB;
  const body = await c.req.json().catch(() => null);

  if (!body || !body.title || !body.message) {
    return c.json({
      success: false,
      message: 'Title and message are required',
    }, 400);
  }

  const id = await createSystemNotification(db, {
    recipientId: body.recipientId,
    recipientRole: body.recipientRole,
    title: body.title,
    message: body.message,
    type: body.type,
    linkUrl: body.linkUrl,
    metadata: body.metadata,
  });

  return c.json({
    success: true,
    notificationId: id,
    message: 'Notification created successfully',
  });
});

