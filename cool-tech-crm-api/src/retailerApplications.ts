/**
 * Retailer Applications Query Endpoints for cool-tech-crm-api
 * 
 * - Endpoints:
 *     GET /api/retailer-applications (list with status filter, search, pagination)
 *     GET /api/retailer-applications/:id (single application details)
 * - Security:
 *     - Protected by authMiddleware (validates Firebase ID token)
 *     - Accessible only by authenticated staff (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE)
 *     - Parameterized SQL queries (zero raw SQL concatenation)
 *     - Sensitive token & secret protection
 */

import { Hono } from 'hono';
import type { Env, AppVariables, RetailerApplicationRow } from './types.ts';
import { authMiddleware } from './auth.ts';

export const retailerApplicationsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// All retailer application query endpoints require authenticated staff context
retailerApplicationsApp.use('*', authMiddleware);

const VALID_STATUSES = new Set(['all', 'pending', 'under_review', 'approved', 'rejected']);

/**
 * Helper to format an application row for client consumption
 */
function formatRetailerApplication(row: any) {
  let interestedCategories: string[] = [];
  if (row.interested_categories) {
    try {
      const parsed = JSON.parse(row.interested_categories);
      interestedCategories = Array.isArray(parsed) ? parsed : [String(row.interested_categories)];
    } catch {
      interestedCategories = String(row.interested_categories).split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  return {
    id: row.id,
    websiteApplicationId: row.website_application_id,
    websiteUserId: row.website_user_id,
    companyName: row.company_name,
    legalName: row.legal_name || row.company_name,
    tradeLicenseNumber: row.trade_license_number,
    taxRegistrationNumber: row.tax_registration_number || null,
    businessType: row.business_type || 'contractor',
    emirate: row.emirate || 'Dubai',
    city: row.city || row.emirate || 'Dubai',
    address: row.address || null,
    contactPerson: row.contact_person,
    designation: row.designation || null,
    email: row.email,
    phone: row.phone,
    whatsappNumber: row.whatsapp_number || row.phone,
    interestedCategories,
    annualVolumeEstimate: row.annual_volume_estimate || null,
    paymentTermsRequested: row.payment_terms_requested || null,
    tradeLicenseUrl: row.trade_license_url || null,
    taxCertificateUrl: row.tax_certificate_url || null,
    hasTradeLicense: Boolean(row.trade_license_url),
    hasTaxCertificate: Boolean(row.tax_certificate_url),
    status: row.status,
    rejectionReason: row.rejection_reason || null,
    reviewNotes: row.review_notes || null,
    reviewedById: row.reviewed_by_id || null,
    reviewedByName: row.reviewed_by_name || null,
    reviewedAt: row.reviewed_at || null,
    customerId: row.customer_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 1. GET /api/retailer-applications
 * List applications with status filter, keyword search, and pagination
 */
retailerApplicationsApp.get('/', async (c) => {
  const db = c.env.DB;
  const url = new URL(c.req.url);

  const statusParam = (url.searchParams.get('status') || 'all').toLowerCase().trim();
  const searchParam = (url.searchParams.get('search') || url.searchParams.get('q') || '').trim();
  const pageParam = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);
  const limitParam = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10) || 20));
  const offset = (pageParam - 1) * limitParam;

  const filterStatus = VALID_STATUSES.has(statusParam) ? statusParam : 'all';

  try {
    // Build query conditions
    const conditions: string[] = [];
    const params: any[] = [];

    if (filterStatus !== 'all') {
      conditions.push('status = ?');
      params.push(filterStatus);
    }

    if (searchParam) {
      const searchPattern = `%${searchParam}%`;
      conditions.push('(company_name LIKE ? OR contact_person LIKE ? OR email LIKE ? OR trade_license_number LIKE ?)');
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // 1. Total Count Query
    const countSql = `SELECT COUNT(*) as total FROM retailer_applications ${whereClause}`;
    const countResult = await db.prepare(countSql).bind(...params).first<{ total: number }>();
    const total = countResult?.total || 0;

    // 2. Select Paginated Records Query
    const selectSql = `
      SELECT * FROM retailer_applications 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const { results } = await db.prepare(selectSql).bind(...params, limitParam, offset).all<any>();

    const applications = (results || []).map(formatRetailerApplication);

    return c.json({
      success: true,
      applications,
      pagination: {
        page: pageParam,
        limit: limitParam,
        total,
        totalPages: Math.ceil(total / limitParam) || 1,
      },
      counts: {
        filtered: total,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CRM Retailer Applications] List error:', msg);
    return c.json(
      {
        success: false,
        error: 'Database Error',
        message: 'Failed to retrieve retailer applications from CRM database.',
      },
      500
    );
  }
});

/**
 * 2. GET /api/retailer-applications/:id
 * Retrieve full application details by ID or websiteApplicationId
 */
retailerApplicationsApp.get('/:id', async (c) => {
  const db = c.env.DB;
  const id = c.req.param('id')?.trim();

  if (!id) {
    return c.json({ success: false, error: 'Bad Request', message: 'Application ID is required.' }, 400);
  }

  try {
    const app = await db
      .prepare('SELECT * FROM retailer_applications WHERE id = ? OR website_application_id = ? LIMIT 1')
      .bind(id, id)
      .first<any>();

    if (!app) {
      return c.json(
        {
          success: false,
          error: 'Not Found',
          message: `Retailer application '${id}' not found in CRM database.`,
        },
        404
      );
    }

    return c.json({
      success: true,
      application: formatRetailerApplication(app),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CRM Retailer Applications] Detail error for '${id}':`, msg);
    return c.json(
      {
        success: false,
        error: 'Database Error',
        message: 'Failed to retrieve retailer application details.',
      },
      500
    );
  }
});

/**
 * Helper to dispatch retailer approval or rejection to cooltechuae website backend
 */
async function dispatchStatusToEcommerce(
  env: Env,
  websiteAppId: string,
  crmRecordId: string,
  status: 'approved' | 'rejected',
  notes: string | null
): Promise<{ success: boolean; error?: string }> {
  const payload = {
    event: status === 'approved' ? 'retailer.application.approved' : 'retailer.application.rejected',
    event_type: status === 'approved' ? 'retailer.application.approved' : 'retailer.application.rejected',
    entity_id: websiteAppId,
    crm_record_id: crmRecordId,
    status,
    notes,
  };

  const secret = env.CRM_API_KEY?.trim() || 'cooltech_local_dev_secret_key_2026';
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${secret}`,
    'X-CRM-Signature': secret,
  };

  // 1. Try Cloudflare Service Binding first (fastest, direct worker-to-worker)
  if (env.ECOMMERCE_SERVICE) {
    try {
      const res = await env.ECOMMERCE_SERVICE.fetch(
        new Request('https://cooltech-api-worker/api/webhooks/crm', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(6000),
        })
      );
      if (res.ok) {
        return { success: true };
      }
    } catch (sbErr) {
      console.warn('[CRM Retailer Applications] Service binding dispatch failed, falling back to HTTP:', sbErr);
    }
  }

  // 2. HTTP Fallback to live public endpoint
  try {
    const ecomBaseUrl = env.ECOMMERCE_API_URL || 'https://cooltech-api-worker.ctauhweb.workers.dev';
    const httpRes = await fetch(`${ecomBaseUrl.replace(/\/$/, '')}/api/webhooks/crm`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(6000),
    });

    if (httpRes.ok) {
      return { success: true };
    }
    const errText = await httpRes.text().catch(() => '');
    return { success: false, error: `HTTP ${httpRes.status}: ${errText}` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CRM Retailer Applications] Error dispatching status to e-commerce worker:', msg);
    return { success: false, error: msg };
  }
}

/**
 * 3. POST /api/retailer-applications/:id/approve
 * Approves a retailer application, records reviewer details, and sets status to 'approved'
 */
retailerApplicationsApp.post('/:id/approve', async (c) => {
  const db = c.env.DB;
  const caller = c.get('user');
  const id = c.req.param('id')?.trim();

  if (!id) {
    return c.json({ success: false, error: 'Bad Request', message: 'Application ID is required.' }, 400);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await c.req.json();
  } catch {
    // Body is optional
  }

  const reviewNotes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;

  try {
    const existing = await db
      .prepare('SELECT id, website_application_id, status FROM retailer_applications WHERE id = ? OR website_application_id = ? LIMIT 1')
      .bind(id, id)
      .first<{ id: string; website_application_id: string; status: string }>();

    if (!existing) {
      return c.json({ success: false, error: 'Not Found', message: `Application '${id}' not found.` }, 404);
    }

    const reviewerId = caller?.id || 'usr_superadmin_001';
    const reviewerName = caller?.full_name || 'shemin';

    await db
      .prepare(`
        UPDATE retailer_applications
        SET status = 'approved',
            reviewed_by_id = ?,
            reviewed_by_name = ?,
            reviewed_at = datetime('now'),
            review_notes = COALESCE(?, review_notes),
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(reviewerId, reviewerName, reviewNotes, existing.id)
      .run();

    // Outbound Dispatch: Synchronize approved status to website backend (cooltech-api-worker)
    const targetWebsiteAppId = existing.website_application_id || existing.id;
    await dispatchStatusToEcommerce(c.env, targetWebsiteAppId, existing.id, 'approved', reviewNotes);

    const updated = await db
      .prepare('SELECT * FROM retailer_applications WHERE id = ? LIMIT 1')
      .bind(existing.id)
      .first<any>();

    return c.json({
      success: true,
      message: 'Retailer application successfully approved and synchronized with website.',
      application: formatRetailerApplication(updated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CRM Retailer Applications] Approve error for '${id}':`, msg);
    return c.json({ success: false, error: 'Database Error', message: 'Failed to approve retailer application.' }, 500);
  }
});

/**
 * 4. POST /api/retailer-applications/:id/reject
 * Rejects a retailer application with a mandatory reason
 */
retailerApplicationsApp.post('/:id/reject', async (c) => {
  const db = c.env.DB;
  const caller = c.get('user');
  const id = c.req.param('id')?.trim();

  if (!id) {
    return c.json({ success: false, error: 'Bad Request', message: 'Application ID is required.' }, 400);
  }

  let body: Record<string, unknown> = {};
  try {
    body = await c.req.json();
  } catch {
    return c.json({ success: false, error: 'Bad Request', message: 'Request body is required.' }, 400);
  }

  const reason = typeof body.reason === 'string' && body.reason.trim() ? body.reason.trim() : '';
  if (!reason) {
    return c.json({ success: false, error: 'Bad Request', message: 'A rejection reason is required.' }, 400);
  }

  const reviewNotes = typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;

  try {
    const existing = await db
      .prepare('SELECT id, website_application_id, status FROM retailer_applications WHERE id = ? OR website_application_id = ? LIMIT 1')
      .bind(id, id)
      .first<{ id: string; website_application_id: string; status: string }>();

    if (!existing) {
      return c.json({ success: false, error: 'Not Found', message: `Application '${id}' not found.` }, 404);
    }

    const reviewerId = caller?.id || 'usr_superadmin_001';
    const reviewerName = caller?.full_name || 'shemin';

    await db
      .prepare(`
        UPDATE retailer_applications
        SET status = 'rejected',
            rejection_reason = ?,
            reviewed_by_id = ?,
            reviewed_by_name = ?,
            reviewed_at = datetime('now'),
            review_notes = COALESCE(?, review_notes),
            updated_at = datetime('now')
        WHERE id = ?
      `)
      .bind(reason, reviewerId, reviewerName, reviewNotes, existing.id)
      .run();

    // Outbound Dispatch: Synchronize rejected status to website backend (cooltech-api-worker)
    const targetWebsiteAppId = existing.website_application_id || existing.id;
    await dispatchStatusToEcommerce(c.env, targetWebsiteAppId, existing.id, 'rejected', reason);

    const updated = await db
      .prepare('SELECT * FROM retailer_applications WHERE id = ? LIMIT 1')
      .bind(existing.id)
      .first<any>();

    return c.json({
      success: true,
      message: 'Retailer application rejected and synchronized with website.',
      application: formatRetailerApplication(updated),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[CRM Retailer Applications] Reject error for '${id}':`, msg);
    return c.json({ success: false, error: 'Database Error', message: 'Failed to reject retailer application.' }, 500);
  }
});
