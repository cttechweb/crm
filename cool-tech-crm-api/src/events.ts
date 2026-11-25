/**
 * Inbound Event Ingestion Endpoints for cool-tech-crm-api
 * 
 * - Endpoint: POST /api/v1/events and POST /api/events
 * - Purpose: Receives vendor-neutral integration events from Cool Technologies website platform
 * - Security: Constant-time shared-secret authentication (Bearer token / X-CRM-Key)
 * - Features:
 *     - Strict schema & server-side validation
 *     - Idempotency & duplicate protection via idempotency_key / website_application_id
 *     - Saves incoming retailer applications to CRM D1 database
 *     - Returns consistent crm_record_id response expected by website dispatcher
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Env, AppVariables, CrmInboundEvent } from './types.ts';

export const eventsApp = new Hono<{ Bindings: Env; Variables: AppVariables }>();

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
export function safeTimingEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Validates the shared API secret against CRM_API_KEY
 */
function authenticateSharedSecret(c: Context<{ Bindings: Env; Variables: AppVariables }>): boolean {
  const configuredKey = c.env.CRM_API_KEY?.trim();
  if (!configuredKey) {
    return false;
  }

  const authHeader = c.req.header('Authorization')?.trim() || '';
  const xApiKey = (c.req.header('X-CRM-Key') || c.req.header('X-Integration-Key') || '').trim();

  let token = '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (xApiKey) {
    token = xApiKey;
  }

  if (!token) return false;
  return safeTimingEqual(token, configuredKey);
}

/**
 * Main Event Ingestion Handler
 */
eventsApp.post('/', async (c) => {
  // 1. Shared Secret Authentication Check
  if (!c.env.CRM_API_KEY?.trim()) {
    return c.json(
      {
        success: false,
        error: 'Service Unavailable',
        message: 'CRM API key is not configured on this server.',
      },
      503
    );
  }

  if (!authenticateSharedSecret(c)) {
    return c.json(
      {
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing CRM API key.',
      },
      401
    );
  }

  // 2. Parse Incoming Event Payload
  let event: CrmInboundEvent;
  try {
    event = await c.req.json();
  } catch {
    return c.json(
      {
        success: false,
        error: 'Bad Request',
        message: 'Malformed JSON payload in request body.',
      },
      400
    );
  }

  // 3. Schema & Envelope Validation
  if (!event || typeof event !== 'object') {
    return c.json({ success: false, error: 'Bad Request', message: 'Event envelope is missing.' }, 400);
  }

  const eventType = event.event_type?.trim();
  const entityType = event.entity_type?.trim();
  const entityId = event.entity_id?.trim();
  const data = event.data;

  if (!eventType || !entityType || !entityId || !data || typeof data !== 'object') {
    return c.json(
      {
        success: false,
        error: 'Bad Request',
        message: 'Missing required envelope fields: event_type, entity_type, entity_id, or data.',
      },
      400
    );
  }

  // Resolve Idempotency Key (Envelope field takes precedence, then header)
  const idempotencyKey = (
    event.idempotency_key ||
    c.req.header('X-Idempotency-Key') ||
    `${entityType}:${entityId}:${eventType}`
  ).trim();

  const eventId = (event.event_id || c.req.header('X-Event-ID') || `evt_${Date.now()}`).trim();

  // 4. Handle Specific Event Types
  switch (eventType) {
    case 'retailer.application.created':
    case 'retailer.application.updated': {
      return handleRetailerApplicationEvent(c, event, data, idempotencyKey, eventId);
    }

    default: {
      return c.json(
        {
          success: false,
          error: 'Unprocessable Entity',
          message: `Unsupported event_type: '${eventType}'. Currently supported: 'retailer.application.created'.`,
        },
        422
      );
    }
  }
});

/**
 * Handles 'retailer.application.created' event with duplicate prevention and D1 persistence
 */
async function handleRetailerApplicationEvent(
  c: Context<{ Bindings: Env; Variables: AppVariables }>,
  event: CrmInboundEvent,
  data: any,
  idempotencyKey: string,
  eventId: string
) {
  const db = c.env.DB;
  const applicationId = String(data.application_id || event.entity_id || '').trim();
  const userId = String(data.user_id || '').trim();
  const companyName = String(data.company_name || '').trim();
  const legalName = data.legal_name ? String(data.legal_name).trim() : companyName;
  const tradeLicenseNumber = String(data.trade_license_number || '').trim();
  const taxRegistrationNumber = data.tax_registration_number ? String(data.tax_registration_number).trim() : null;
  const businessType = data.business_type ? String(data.business_type).trim() : 'contractor';
  const emirate = data.emirate ? String(data.emirate).trim() : (data.city ? String(data.city).trim() : 'Dubai');
  const city = data.city ? String(data.city).trim() : emirate;
  const address = data.address ? String(data.address).trim() : null;
  const contactPerson = String(data.contact_person || '').trim();
  const designation = data.designation ? String(data.designation).trim() : null;
  const email = String(data.email || '').trim().toLowerCase();
  const phone = String(data.phone || '').trim();
  const whatsappNumber = data.whatsapp_number ? String(data.whatsapp_number).trim() : phone;
  const annualVolumeEstimate = data.annual_volume_estimate ? String(data.annual_volume_estimate).trim() : null;
  const paymentTermsRequested = data.payment_terms_requested ? String(data.payment_terms_requested).trim() : null;
  const tradeLicenseUrl = data.trade_license_url ? String(data.trade_license_url).trim() : null;
  const taxCertificateUrl = data.tax_certificate_url ? String(data.tax_certificate_url).trim() : null;

  // Format interested categories
  let interestedCategories: string | null = null;
  if (Array.isArray(data.interested_categories)) {
    interestedCategories = JSON.stringify(data.interested_categories);
  } else if (typeof data.interested_categories === 'string' && data.interested_categories.trim()) {
    interestedCategories = data.interested_categories.trim();
  }

  // 1. Data Validation
  if (!applicationId) {
    return c.json({ success: false, error: 'Bad Request', message: 'Missing application_id in data payload.' }, 400);
  }
  if (!companyName) {
    return c.json({ success: false, error: 'Bad Request', message: 'Company name is required.' }, 400);
  }
  if (!contactPerson) {
    return c.json({ success: false, error: 'Bad Request', message: 'Contact person is required.' }, 400);
  }
  if (!email || !email.includes('@')) {
    return c.json({ success: false, error: 'Bad Request', message: 'A valid email address is required.' }, 400);
  }
  if (!phone) {
    return c.json({ success: false, error: 'Bad Request', message: 'Contact phone number is required.' }, 400);
  }
  if (!tradeLicenseNumber) {
    return c.json({ success: false, error: 'Bad Request', message: 'Trade license number is required.' }, 400);
  }

  // 2. Idempotency Check: Prevent duplicate record insertion
  try {
    const existing = await db
      .prepare(`
        SELECT id, website_application_id, status, created_at 
        FROM retailer_applications 
        WHERE website_application_id = ? OR id = ? OR idempotency_key = ?
        LIMIT 1
      `)
      .bind(applicationId, applicationId, idempotencyKey)
      .first<{ id: string; website_application_id: string; status: string; created_at: string }>();

    if (existing) {
      // Record already exists: update last event ID, return success idempotently
      await db
        .prepare(`
          UPDATE retailer_applications 
          SET last_event_id = ?, updated_at = datetime('now')
          WHERE id = ?
        `)
        .bind(eventId, existing.id)
        .run()
        .catch(() => {});

      return c.json(
        {
          success: true,
          crm_record_id: existing.id,
          status: 'already_processed',
          message: 'Retailer application already exists in CRM database (idempotent duplicate acknowledged).',
          event_id: eventId,
        },
        200
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[CRM Events] Duplicate lookup error:', msg);
    return c.json(
      {
        success: false,
        error: 'Database Error',
        message: 'Failed to check existing application records.',
        details: msg,
      },
      500
    );
  }

  // 3. Insert Application into CRM D1 Database
  try {
    const crmRecordId = applicationId; // Maintain 1:1 cross-system mapping

    await db
      .prepare(`
        INSERT INTO retailer_applications (
          id,
          website_application_id,
          website_user_id,
          company_name,
          legal_name,
          trade_license_number,
          tax_registration_number,
          business_type,
          emirate,
          city,
          address,
          contact_person,
          designation,
          email,
          phone,
          whatsapp_number,
          interested_categories,
          annual_volume_estimate,
          payment_terms_requested,
          trade_license_url,
          tax_certificate_url,
          status,
          idempotency_key,
          last_event_id,
          created_at,
          updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, datetime('now'), datetime('now')
        )
      `)
      .bind(
        crmRecordId,
        applicationId,
        userId || 'unknown',
        companyName,
        legalName,
        tradeLicenseNumber,
        taxRegistrationNumber,
        businessType,
        emirate,
        city,
        address,
        contactPerson,
        designation,
        email,
        phone,
        whatsappNumber,
        interestedCategories,
        annualVolumeEstimate,
        paymentTermsRequested,
        tradeLicenseUrl,
        taxCertificateUrl,
        idempotencyKey,
        eventId
      )
      .run();

    return c.json(
      {
        success: true,
        crm_record_id: crmRecordId,
        status: 'synced',
        message: 'Retailer application successfully saved in CRM database.',
        event_id: eventId,
      },
      201
    );
  } catch (insertErr: unknown) {
    const msg = insertErr instanceof Error ? insertErr.message : String(insertErr);
    console.error('[CRM Events] Insert error:', msg);
    return c.json(
      {
        success: false,
        error: 'Database Insert Error',
        message: 'Failed to insert retailer application into CRM database.',
        details: msg,
      },
      500
    );
  }
}
