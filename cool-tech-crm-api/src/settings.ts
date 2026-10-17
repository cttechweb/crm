/**
 * Settings, Targets, and Opportunity Pipeline Stages Endpoints
 * 
 * Manages:
 * - Company & System Settings (/api/settings)
 * - Lead Sources & Target Industries (/api/settings/lead-sources, /api/settings/industries)
 * - User & Company Sales Targets (/api/targets/users, /api/targets/company)
 * - Opportunity Pipeline Stages (/api/opportunity-stages)
 * - Opportunity Lost Reasons (/api/opportunity-lost-reasons)
 * 
 * Protected by authMiddleware and RBAC.
 * SAFETY: Dedicated CRM tables only. Completely isolated from e-commerce database.
 */

import { Hono } from 'hono';
import type {
  Env,
  AppVariables,
  CrmUserProfile,
  CompanySettingsRow,
  SystemSettingRow,
  LeadSourceRow,
  TargetIndustryRow,
  UserTargetRow,
  CompanyTargetRow,
  OpportunityStageRow,
  OpportunityLostReasonRow,
} from './types.ts';
import { authMiddleware } from './auth.ts';

// RBAC Permission Helpers
function isAdmin(user: CrmUserProfile): boolean {
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN';
}

function isManagerOrAdmin(user: CrmUserProfile): boolean {
  return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'MANAGER';
}

// ============================================================================
// 1. SETTINGS ROUTER (Company Profile, Key-Values, Sources, Industries)
// ============================================================================
export const settingsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
settingsApp.use('*', authMiddleware);

// --- Company Profile Settings ---
settingsApp.get('/company', async (c) => {
  const db = c.env.DB;
  try {
    const res = await db.prepare('SELECT * FROM company_settings WHERE id = ? LIMIT 1')
      .bind('default')
      .all<CompanySettingsRow>();

    const company = res.results?.[0] || {
      id: 'default',
      company_name: 'Cool Technologies LLC',
      legal_entity: 'Cool Technologies LLC',
      trn: '100349284900003',
      operating_region: 'United Arab Emirates (AED / +971)',
      primary_email: 'support@cooltechuae.com',
      phone: '+971 4 000 0000',
      address: 'Dubai, United Arab Emirates',
      currency: 'AED',
      vat_rate: 5.0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return c.json({ success: true, company });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.put('/company', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can update corporate company settings.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const companyName = (body.company_name || body.companyName || 'Cool Technologies LLC').trim();
  const legalEntity = (body.legal_entity || body.legalEntity || companyName).trim();
  const trn = (body.trn || '').trim() || null;
  const operatingRegion = (body.operating_region || body.operatingRegion || '').trim() || null;
  const primaryEmail = (body.primary_email || body.primaryEmail || '').trim() || null;
  const phone = (body.phone || '').trim() || null;
  const address = (body.address || '').trim() || null;
  const currency = (body.currency || 'AED').trim().toUpperCase();
  const vatRate = typeof body.vat_rate === 'number' ? body.vat_rate : typeof body.vatRate === 'number' ? body.vatRate : 5.0;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO company_settings (
        id, company_name, legal_entity, trn, operating_region, primary_email, phone, address, currency, vat_rate, created_at, updated_at
      ) VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        company_name = excluded.company_name,
        legal_entity = excluded.legal_entity,
        trn = excluded.trn,
        operating_region = excluded.operating_region,
        primary_email = excluded.primary_email,
        phone = excluded.phone,
        address = excluded.address,
        currency = excluded.currency,
        vat_rate = excluded.vat_rate,
        updated_at = excluded.updated_at
    `).bind(
      companyName,
      legalEntity,
      trn,
      operatingRegion,
      primaryEmail,
      phone,
      address,
      currency,
      vatRate,
      now,
      now
    ).run();

    const updated = await db.prepare('SELECT * FROM company_settings WHERE id = ? LIMIT 1')
      .bind('default')
      .all<CompanySettingsRow>();

    return c.json({
      success: true,
      message: 'Company configuration saved successfully.',
      company: updated.results?.[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// --- System Key-Value Settings ---
settingsApp.get('/system', async (c) => {
  const db = c.env.DB;
  const category = c.req.query('category')?.trim();

  try {
    let query = 'SELECT * FROM system_settings';
    const params: string[] = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY key ASC';

    const res = await db.prepare(query).bind(...params).all<SystemSettingRow>();
    return c.json({ success: true, settings: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.put('/system', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can update system configurations.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const key = (body.key || '').trim();
  if (!key) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Key is required.' }, 400);
  }

  const value = typeof body.value === 'string' ? body.value : JSON.stringify(body.value ?? '');
  const category = (body.category || 'general').trim();
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO system_settings (key, value, category, updated_by, updated_by_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        category = excluded.category,
        updated_by = excluded.updated_by,
        updated_by_id = excluded.updated_by_id,
        updated_at = excluded.updated_at
    `).bind(key, value, category, user.full_name || user.email, user.id, now, now).run();

    return c.json({ success: true, message: `System setting '${key}' saved.` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

// --- Lead / Customer Sources ---
settingsApp.get('/lead-sources', async (c) => {
  const db = c.env.DB;
  try {
    const res = await db.prepare('SELECT * FROM lead_sources WHERE is_deleted = 0 ORDER BY sort_order ASC, name ASC')
      .all<LeadSourceRow>();
    return c.json({ success: true, sources: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.post('/lead-sources', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can add lead sources.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const name = (body.name || '').trim();
  if (!name) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Source name is required.' }, 400);
  }

  const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : typeof body.sortOrder === 'number' ? body.sortOrder : 0;
  const isActive = body.is_active === 0 || body.active === false ? 0 : 1;
  const id = `src_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO lead_sources (id, name, is_active, sort_order, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `).bind(id, name, isActive, sortOrder, now, now).run();

    return c.json({
      success: true,
      message: 'Lead source created successfully.',
      source: { id, name, is_active: isActive, sort_order: sortOrder, is_deleted: 0, created_at: now, updated_at: now },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    if (message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, code: 'CONFLICT', message: `Lead source '${name}' already exists.` }, 409);
    }
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.delete('/lead-sources/:id', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can delete lead sources.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE lead_sources SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'Lead source deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.post('/lead-sources/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const sources = Array.isArray(body.sources) ? body.sources : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const s of sources) {
    const name = (s.name || '').trim();
    if (!name) continue;
    const id = s.id ? String(s.id) : `src_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isActive = s.active === false || s.is_active === 0 ? 0 : 1;
    const sortOrder = typeof s.sort_order === 'number' ? s.sort_order : 0;

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO lead_sources (id, name, is_active, sort_order, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `).bind(id, name, isActive, sortOrder, now, now).run();
      synced++;
    } catch {
      // Continue next item
    }
  }

  return c.json({ success: true, message: `Synced ${synced} lead sources.`, count: synced });
});

// --- Target Industries ---
settingsApp.get('/industries', async (c) => {
  const db = c.env.DB;
  try {
    const res = await db.prepare('SELECT * FROM target_industries WHERE is_deleted = 0 ORDER BY sort_order ASC, name ASC')
      .all<TargetIndustryRow>();
    return c.json({ success: true, industries: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.post('/industries', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can add industries.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const name = (body.name || '').trim();
  if (!name) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Industry name is required.' }, 400);
  }

  const sortOrder = typeof body.sort_order === 'number' ? body.sort_order : typeof body.sortOrder === 'number' ? body.sortOrder : 0;
  const isActive = body.is_active === 0 || body.active === false ? 0 : 1;
  const id = `ind_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO target_industries (id, name, is_active, sort_order, is_deleted, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, ?, ?)
    `).bind(id, name, isActive, sortOrder, now, now).run();

    return c.json({
      success: true,
      message: 'Industry created successfully.',
      industry: { id, name, is_active: isActive, sort_order: sortOrder, is_deleted: 0, created_at: now, updated_at: now },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    if (message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, code: 'CONFLICT', message: `Industry '${name}' already exists.` }, 409);
    }
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.delete('/industries/:id', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can delete industries.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE target_industries SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'Industry deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

settingsApp.post('/industries/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const industries = Array.isArray(body.industries) ? body.industries : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const item of industries) {
    const name = (item.name || '').trim();
    if (!name) continue;
    const id = item.id ? String(item.id) : `ind_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const isActive = item.active === false || item.is_active === 0 ? 0 : 1;
    const sortOrder = typeof item.sort_order === 'number' ? item.sort_order : 0;

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO target_industries (id, name, is_active, sort_order, is_deleted, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `).bind(id, name, isActive, sortOrder, now, now).run();
      synced++;
    } catch {
      // Continue next item
    }
  }

  return c.json({ success: true, message: `Synced ${synced} industries.`, count: synced });
});


// ============================================================================
// 2. TARGETS ROUTER (/api/targets/users, /api/targets/company)
// ============================================================================
export const targetsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
targetsApp.use('*', authMiddleware);

// --- User Sales Targets ---
targetsApp.get('/users', async (c) => {
  const db = c.env.DB;
  const search = c.req.query('search')?.trim();
  const year = c.req.query('year') ? parseInt(c.req.query('year')!, 10) : undefined;

  try {
    let query = 'SELECT * FROM user_targets WHERE is_deleted = 0';
    const params: (string | number)[] = [];

    if (search) {
      query += ' AND (user_name LIKE ? OR role LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    query += ' ORDER BY target_rev DESC, user_name ASC';

    const res = await db.prepare(query).bind(...params).all<UserTargetRow>();
    return c.json({ success: true, targets: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.post('/users', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can establish user target quotas.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const userName = (body.name || body.userName || body.user_name || '').trim();
  if (!userName) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'User name is required.' }, 400);
  }

  const role = (body.role || 'Sales Representative').trim();
  const period = (body.period || 'Q1 - 2026').trim();
  const year = typeof body.year === 'number' ? body.year : 2026;
  const deals = typeof body.deals === 'number' ? body.deals : typeof body.targetDeals === 'number' ? body.targetDeals : 0;
  const targetRev = typeof body.targetRev === 'number' ? body.targetRev : typeof body.target_rev === 'number' ? body.target_rev : 0;
  const closedRev = typeof body.closedRev === 'number' ? body.closedRev : typeof body.closed_rev === 'number' ? body.closed_rev : 0;
  const notes = (body.notes || '').trim() || null;
  const userId = body.userId || body.user_id || null;
  const id = body.id ? String(body.id) : `utarg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    // If user already has an active target for this period/name, upsert
    const existing = await db.prepare(
      'SELECT id FROM user_targets WHERE LOWER(user_name) = LOWER(?) AND is_deleted = 0 LIMIT 1'
    ).bind(userName).all<UserTargetRow>();

    if (existing.results?.length) {
      const existingId = existing.results[0].id;
      await db.prepare(`
        UPDATE user_targets SET
          role = ?,
          period = ?,
          year = ?,
          deals = ?,
          target_rev = ?,
          notes = ?,
          updated_at = ?
        WHERE id = ?
      `).bind(role, period, year, deals, targetRev, notes, now, existingId).run();

      const updated = await db.prepare('SELECT * FROM user_targets WHERE id = ?').bind(existingId).all<UserTargetRow>();
      return c.json({
        success: true,
        message: `Target quota for ${userName} updated successfully.`,
        target: updated.results?.[0],
      });
    }

    await db.prepare(`
      INSERT INTO user_targets (
        id, user_id, user_name, role, period, year, deals, target_rev, closed_rev, notes, created_by, created_by_id, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      userId,
      userName,
      role,
      period,
      year,
      deals,
      targetRev,
      closedRev,
      notes,
      user.full_name || user.email,
      user.id,
      now,
      now
    ).run();

    return c.json({
      success: true,
      message: `Target quota for ${userName} created successfully.`,
      target: {
        id,
        user_id: userId,
        user_name: userName,
        role,
        period,
        year,
        deals,
        target_rev: targetRev,
        closed_rev: closedRev,
        notes,
        created_by: user.full_name || user.email,
        created_by_id: user.id,
        is_deleted: 0,
        created_at: now,
        updated_at: now,
      },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.delete('/users/:id', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can delete user targets.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE user_targets SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'User target removed successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.post('/users/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const targets = Array.isArray(body.targets) ? body.targets : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const t of targets) {
    const userName = (t.name || t.userName || t.user_name || '').trim();
    if (!userName) continue;

    const id = t.id ? String(t.id) : `utarg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const role = (t.role || 'Sales Representative').trim();
    const period = (t.period || 'Q1 - 2026').trim();
    const year = typeof t.year === 'number' ? t.year : 2026;
    const deals = typeof t.deals === 'number' ? t.deals : typeof t.targetDeals === 'number' ? t.targetDeals : 0;
    const targetRev = typeof t.targetRev === 'number' ? t.targetRev : typeof t.target_rev === 'number' ? t.target_rev : 0;
    const closedRev = typeof t.closedRev === 'number' ? t.closedRev : typeof t.closed_rev === 'number' ? t.closed_rev : 0;

    try {
      const existing = await db.prepare(
        'SELECT id FROM user_targets WHERE LOWER(user_name) = LOWER(?) AND is_deleted = 0 LIMIT 1'
      ).bind(userName).all<UserTargetRow>();

      if (existing.results?.length) {
        await db.prepare(`
          UPDATE user_targets SET
            role = ?,
            deals = ?,
            target_rev = ?,
            updated_at = ?
          WHERE id = ?
        `).bind(role, deals, targetRev, now, existing.results[0].id).run();
      } else {
        await db.prepare(`
          INSERT INTO user_targets (
            id, user_id, user_name, role, period, year, deals, target_rev, closed_rev, created_by, is_deleted, created_at, updated_at
          ) VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        `).bind(id, userName, role, period, year, deals, targetRev, closedRev, user.full_name || user.email, now, now).run();
      }
      synced++;
    } catch {
      // Continue next target
    }
  }

  return c.json({ success: true, message: `Synced ${synced} user targets.`, count: synced });
});

// --- Company Sales Targets ---
targetsApp.get('/company', async (c) => {
  const db = c.env.DB;
  const search = c.req.query('search')?.trim();
  const year = c.req.query('year') ? parseInt(c.req.query('year')!, 10) : undefined;

  try {
    let query = 'SELECT * FROM company_targets WHERE is_deleted = 0';
    const params: (string | number)[] = [];

    if (search) {
      query += ' AND month LIKE ?';
      params.push(`%${search}%`);
    }
    if (year) {
      query += ' AND year = ?';
      params.push(year);
    }
    query += ' ORDER BY created_at DESC';

    const res = await db.prepare(query).bind(...params).all<CompanyTargetRow>();
    return c.json({ success: true, targets: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.post('/company', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can establish company targets.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const rawMonth = (body.month || '').trim();
  if (!rawMonth) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Target month is required.' }, 400);
  }
  const month = rawMonth.includes('TO') ? rawMonth.split('TO')[0].trim() : rawMonth;

  const saleTarget = typeof body.sale_target === 'number' ? body.sale_target : typeof body.saleTarget === 'number' ? body.saleTarget : 0;
  const profitTarget = typeof body.profit_target === 'number' ? body.profit_target : typeof body.profitTarget === 'number' ? body.profitTarget : null;
  const invoiceTarget = typeof body.invoice_target === 'number' ? body.invoice_target : typeof body.invoiceTarget === 'number' ? body.invoiceTarget : null;
  const collectionTarget = typeof body.collection_target === 'number' ? body.collection_target : typeof body.collectionTarget === 'number' ? body.collectionTarget : null;
  const year = typeof body.year === 'number' ? body.year : 2026;
  const id = body.id ? String(body.id) : `ctarg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO company_targets (
        id, month, sale_target, profit_target, invoice_target, collection_target, year, created_by, created_by_id, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).bind(
      id,
      month,
      saleTarget,
      profitTarget,
      invoiceTarget,
      collectionTarget,
      year,
      user.full_name || user.email,
      user.id,
      now,
      now
    ).run();

    return c.json({
      success: true,
      message: `Company target for ${month} created successfully.`,
      target: {
        id,
        month,
        sale_target: saleTarget,
        profit_target: profitTarget,
        invoice_target: invoiceTarget,
        collection_target: collectionTarget,
        year,
        created_by: user.full_name || user.email,
        created_by_id: user.id,
        is_deleted: 0,
        created_at: now,
        updated_at: now,
      },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.put('/company/:id', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can update company targets.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const rawMonth = (body.month || '').trim();
  const month = rawMonth.includes('TO') ? rawMonth.split('TO')[0].trim() : rawMonth;
  const saleTarget = typeof body.sale_target === 'number' ? body.sale_target : typeof body.saleTarget === 'number' ? body.saleTarget : 0;
  const profitTarget = typeof body.profit_target === 'number' ? body.profit_target : typeof body.profitTarget === 'number' ? body.profitTarget : null;
  const invoiceTarget = typeof body.invoice_target === 'number' ? body.invoice_target : typeof body.invoiceTarget === 'number' ? body.invoiceTarget : null;
  const collectionTarget = typeof body.collection_target === 'number' ? body.collection_target : typeof body.collectionTarget === 'number' ? body.collectionTarget : null;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE company_targets SET
        month = COALESCE(NULLIF(?, ''), month),
        sale_target = ?,
        profit_target = ?,
        invoice_target = ?,
        collection_target = ?,
        updated_at = ?
      WHERE id = ? AND is_deleted = 0
    `).bind(
      month,
      saleTarget,
      profitTarget,
      invoiceTarget,
      collectionTarget,
      now,
      id
    ).run();

    const updated = await db.prepare('SELECT * FROM company_targets WHERE id = ?').bind(id).all<CompanyTargetRow>();
    return c.json({
      success: true,
      message: 'Company target updated successfully.',
      target: updated.results?.[0],
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.delete('/company/:id', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can delete company targets.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE company_targets SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'Company target deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

targetsApp.post('/company/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const targets = Array.isArray(body.targets) ? body.targets : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const t of targets) {
    const rawMonth = (t.month || '').trim();
    if (!rawMonth) continue;
    const month = rawMonth.includes('TO') ? rawMonth.split('TO')[0].trim() : rawMonth;
    const id = t.id ? String(t.id) : `ctarg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const saleTarget = typeof t.sale_target === 'number' ? t.sale_target : typeof t.saleTarget === 'number' ? t.saleTarget : 0;
    const profitTarget = typeof t.profit_target === 'number' ? t.profit_target : typeof t.profitTarget === 'number' ? t.profitTarget : null;
    const invoiceTarget = typeof t.invoice_target === 'number' ? t.invoice_target : typeof t.invoiceTarget === 'number' ? t.invoiceTarget : null;
    const collectionTarget = typeof t.collection_target === 'number' ? t.collection_target : typeof t.collectionTarget === 'number' ? t.collectionTarget : null;

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO company_targets (
          id, month, sale_target, profit_target, invoice_target, collection_target, year, created_by, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 2026, ?, 0, ?, ?)
      `).bind(
        id,
        month,
        saleTarget,
        profitTarget,
        invoiceTarget,
        collectionTarget,
        user.full_name || user.email,
        now,
        now
      ).run();
      synced++;
    } catch {
      // Continue next target
    }
  }

  return c.json({ success: true, message: `Synced ${synced} company targets.`, count: synced });
});


// ============================================================================
// 3. OPPORTUNITY PIPELINE STAGES ROUTER (/api/opportunity-stages)
// ============================================================================
export const opportunityStagesApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
opportunityStagesApp.use('*', authMiddleware);

opportunityStagesApp.get('/', async (c) => {
  const db = c.env.DB;
  try {
    const res = await db.prepare(
      'SELECT * FROM opportunity_stages WHERE is_deleted = 0 ORDER BY stage_order ASC, name ASC'
    ).all<OpportunityStageRow>();

    return c.json({ success: true, stages: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityStagesApp.post('/', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can add opportunity stages.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const name = (body.name || '').trim();
  if (!name) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Stage name is required.' }, 400);
  }

  const abbreviation = (body.abbreviation || name.substring(0, 4).toUpperCase()).trim();
  const color = (body.color || '#2563EB').trim();
  const textColor = (body.textColor || body.text_color || color).trim();
  const probability = typeof body.probability === 'number' ? body.probability : 50;
  const stageOrder = typeof body.stageOrder === 'number' ? body.stageOrder : typeof body.stage_order === 'number' ? body.stage_order : typeof body.order === 'number' ? body.order : 10;
  const id = body.id ? String(body.id) : `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO opportunity_stages (
        id, name, abbreviation, color, text_color, probability, stage_order, is_system, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `).bind(id, name, abbreviation, color, textColor, probability, stageOrder, now, now).run();

    return c.json({
      success: true,
      message: 'Opportunity stage created successfully.',
      stage: {
        id,
        name,
        abbreviation,
        color,
        text_color: textColor,
        probability,
        stage_order: stageOrder,
        is_system: 0,
        is_deleted: 0,
        created_at: now,
        updated_at: now,
      },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    if (message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, code: 'CONFLICT', message: `Stage '${name}' already exists.` }, 409);
    }
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityStagesApp.put('/:id', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can update opportunity stages.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const name = (body.name || '').trim();
  const abbreviation = (body.abbreviation || '').trim();
  const color = (body.color || '').trim();
  const textColor = (body.textColor || body.text_color || '').trim();
  const probability = typeof body.probability === 'number' ? body.probability : undefined;
  const stageOrder = typeof body.stageOrder === 'number' ? body.stageOrder : typeof body.stage_order === 'number' ? body.stage_order : undefined;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE opportunity_stages SET
        name = COALESCE(NULLIF(?, ''), name),
        abbreviation = COALESCE(NULLIF(?, ''), abbreviation),
        color = COALESCE(NULLIF(?, ''), color),
        text_color = COALESCE(NULLIF(?, ''), text_color),
        probability = COALESCE(?, probability),
        stage_order = COALESCE(?, stage_order),
        updated_at = ?
      WHERE id = ? AND is_deleted = 0
    `).bind(name, abbreviation, color, textColor, probability ?? null, stageOrder ?? null, now, id).run();

    const updated = await db.prepare('SELECT * FROM opportunity_stages WHERE id = ?').bind(id).all<OpportunityStageRow>();
    return c.json({ success: true, message: 'Opportunity stage updated successfully.', stage: updated.results?.[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityStagesApp.delete('/:id', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can delete opportunity stages.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    // Check if stage is a system stage
    const stageCheck = await db.prepare('SELECT is_system FROM opportunity_stages WHERE id = ?').bind(id).all<OpportunityStageRow>();
    if (stageCheck.results?.[0]?.is_system === 1) {
      return c.json({ success: false, code: 'PROTECTED_RECORD', message: 'Core system opportunity pipeline stages cannot be deleted.' }, 400);
    }

    await db.prepare(`
      UPDATE opportunity_stages SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'Opportunity stage deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityStagesApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const stages = Array.isArray(body.stages) ? body.stages : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const s of stages) {
    const name = (s.name || '').trim();
    if (!name) continue;
    const id = s.id ? String(s.id) : `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const abbreviation = (s.abbreviation || name.substring(0, 4).toUpperCase()).trim();
    const color = (s.color || '#2563EB').trim();
    const textColor = (s.textColor || s.text_color || color).trim();
    const probability = typeof s.probability === 'number' ? s.probability : 50;
    const stageOrder = typeof s.order === 'number' ? s.order : typeof s.stage_order === 'number' ? s.stage_order : 10;
    const isSystem = s.is_system === 1 || s.isSystem === true ? 1 : 0;

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO opportunity_stages (
          id, name, abbreviation, color, text_color, probability, stage_order, is_system, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(id, name, abbreviation, color, textColor, probability, stageOrder, isSystem, now, now).run();
      synced++;
    } catch {
      // Continue next stage
    }
  }

  return c.json({ success: true, message: `Synced ${synced} opportunity stages.`, count: synced });
});


// ============================================================================
// 4. OPPORTUNITY LOST REASONS ROUTER (/api/opportunity-lost-reasons)
// ============================================================================
export const opportunityLostReasonsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();
opportunityLostReasonsApp.use('*', authMiddleware);

opportunityLostReasonsApp.get('/', async (c) => {
  const db = c.env.DB;
  try {
    const res = await db.prepare(
      'SELECT * FROM opportunity_lost_reasons WHERE is_deleted = 0 ORDER BY reason ASC'
    ).all<OpportunityLostReasonRow>();

    return c.json({ success: true, reasons: res.results || [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityLostReasonsApp.post('/', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can add opportunity lost reasons.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const reason = (body.reason || '').trim();
  if (!reason) {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Reason description is required.' }, 400);
  }

  const description = (body.description || '').trim() || null;
  const isActive = body.is_active === 0 || body.active === false ? 0 : 1;
  const id = body.id ? String(body.id) : `lr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      INSERT INTO opportunity_lost_reasons (
        id, reason, description, is_active, is_deleted, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 0, ?, ?)
    `).bind(id, reason, description, isActive, now, now).run();

    return c.json({
      success: true,
      message: 'Opportunity lost reason created successfully.',
      lostReason: {
        id,
        reason,
        description,
        is_active: isActive,
        is_deleted: 0,
        created_at: now,
        updated_at: now,
      },
    }, 201);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    if (message.includes('UNIQUE constraint failed')) {
      return c.json({ success: false, code: 'CONFLICT', message: `Reason '${reason}' already exists.` }, 409);
    }
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityLostReasonsApp.put('/:id', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Managers and Administrators can update lost reasons.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const reason = (body.reason || '').trim();
  const description = (body.description || '').trim() || null;
  const isActive = typeof body.is_active === 'number' ? body.is_active : typeof body.active === 'boolean' ? (body.active ? 1 : 0) : undefined;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE opportunity_lost_reasons SET
        reason = COALESCE(NULLIF(?, ''), reason),
        description = COALESCE(?, description),
        is_active = COALESCE(?, is_active),
        updated_at = ?
      WHERE id = ? AND is_deleted = 0
    `).bind(reason, description, isActive ?? null, now, id).run();

    const updated = await db.prepare('SELECT * FROM opportunity_lost_reasons WHERE id = ?').bind(id).all<OpportunityLostReasonRow>();
    return c.json({ success: true, message: 'Lost reason updated successfully.', lostReason: updated.results?.[0] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityLostReasonsApp.delete('/:id', async (c) => {
  const user = c.get('user');
  if (!isAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Only Administrators can delete lost reasons.' }, 403);
  }

  const id = c.req.param('id');
  const db = c.env.DB;
  const now = new Date().toISOString();

  try {
    await db.prepare(`
      UPDATE opportunity_lost_reasons SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?
    `).bind(now, now, id).run();

    return c.json({ success: true, message: 'Opportunity lost reason deleted successfully.' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error';
    return c.json({ success: false, code: 'DATABASE_ERROR', message }, 500);
  }
});

opportunityLostReasonsApp.post('/sync-batch', async (c) => {
  const user = c.get('user');
  if (!isManagerOrAdmin(user)) {
    return c.json({ success: false, code: 'FORBIDDEN', message: 'Insufficient permissions for batch sync.' }, 403);
  }

  const db = c.env.DB;
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, code: 'BAD_REQUEST', message: 'Malformed JSON payload.' }, 400);
  }

  const reasons = Array.isArray(body.reasons) ? body.reasons : [];
  let synced = 0;
  const now = new Date().toISOString();

  for (const r of reasons) {
    const reasonText = (r.reason || '').trim();
    if (!reasonText) continue;
    const id = r.id ? String(r.id) : `lr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const description = (r.description || '').trim() || null;
    const isActive = r.active === false || r.is_active === 0 ? 0 : 1;

    try {
      await db.prepare(`
        INSERT OR IGNORE INTO opportunity_lost_reasons (
          id, reason, description, is_active, is_deleted, created_at, updated_at
        ) VALUES (?, ?, ?, ?, 0, ?, ?)
      `).bind(id, reasonText, description, isActive, now, now).run();
      synced++;
    } catch {
      // Continue next reason
    }
  }

  return c.json({ success: true, message: `Synced ${synced} opportunity lost reasons.`, count: synced });
});
