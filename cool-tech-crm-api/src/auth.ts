/**
 * Firebase ID Token Verification & CRM Profile Resolution for Cloudflare Workers
 * 
 * - Verifies RS256 signature using Google's public JWKS
 * - Validates issuer, audience, expiry, key ID, and subject
 * - Resolves verified user profile from D1 users table using verified firebase_uid
 * - Aligned with actual table columns: id, firebase_uid, email, full_name, role, is_active
 * - Enforces active account checks (is_active)
 * - Returns structured 401 and 403 responses
 */

import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Context, MiddlewareHandler } from 'hono';
import type { Env, AppVariables, CrmUserProfile, CrmRole } from './types.ts';

// Google public JWKS URL for Firebase Auth ID tokens
const GOOGLE_JWKS_URL = new URL(
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
);

// Cached remote JWKS set (handles caching and Google key rotation automatically)
let cachedJWKS = createRemoteJWKSet(GOOGLE_JWKS_URL);

/**
 * Allows injecting a custom JWKS in test environments
 */
export function setCustomJWKS(customJWKS: ReturnType<typeof createRemoteJWKSet>): void {
  cachedJWKS = customJWKS;
}

export interface TokenVerificationResult {
  valid: boolean;
  uid?: string;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Cryptographically verifies a Firebase ID token
 */
export async function verifyFirebaseToken(
  token: string,
  projectId: string = 'cool-tech-crm'
): Promise<TokenVerificationResult> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token is missing or empty' };
  }

  const expectedIssuer = `https://securetoken.google.com/${projectId}`;

  try {
    const { payload } = await jwtVerify(token, cachedJWKS, {
      issuer: expectedIssuer,
      audience: projectId,
      algorithms: ['RS256'],
    });

    if (!payload.sub || typeof payload.sub !== 'string') {
      return { valid: false, error: 'Token subject (UID) is missing' };
    }

    return {
      valid: true,
      uid: payload.sub,
      payload,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    return {
      valid: false,
      error: message,
    };
  }
}

const VALID_CRM_ROLES: ReadonlySet<CrmRole> = new Set([
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'EMPLOYEE',
]);

/**
 * Cloudflare Worker Authentication & Profile Resolution Middleware
 */
export const authMiddleware: MiddlewareHandler<{ Bindings: Env; Variables: AppVariables }> = async (
  c: Context<{ Bindings: Env; Variables: AppVariables }>,
  next
) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json(
      {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Missing or malformed Authorization header.',
      },
      401
    );
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return c.json(
      {
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Empty Bearer token provided.',
      },
      401
    );
  }

  const projectId = c.env.FIREBASE_PROJECT_ID || 'cool-tech-crm';
  const verification = await verifyFirebaseToken(token, projectId);

  if (!verification.valid || !verification.uid) {
    return c.json(
      {
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Authentication token is invalid, expired, or untrusted.',
      },
      401
    );
  }

  const verifiedUid = verification.uid;
  const verifiedEmail = typeof verification.payload?.email === 'string'
    ? verification.payload.email.trim().toLowerCase()
    : null;

  // Query D1 users table using verified firebase_uid and exact schema columns
  try {
    const query = await c.env.DB.prepare(
      'SELECT id, firebase_uid, email, full_name, role, is_active, department, position, reports_to FROM users WHERE firebase_uid = ? LIMIT 1'
    )
      .bind(verifiedUid)
      .all<CrmUserProfile>();

    let userProfile = query.results?.[0];

    // JIT Account Linking: If not found by firebase_uid, resolve by verified Firebase email
    if (!userProfile && verifiedEmail) {
      const emailQuery = await c.env.DB.prepare(
        'SELECT id, firebase_uid, email, full_name, role, is_active, department, position, reports_to FROM users WHERE LOWER(email) = ? LIMIT 1'
      )
        .bind(verifiedEmail)
        .all<CrmUserProfile>();

      const emailProfile = emailQuery.results?.[0];
      if (emailProfile) {
        await c.env.DB.prepare(
          'UPDATE users SET firebase_uid = ?, updated_at = datetime(\'now\') WHERE id = ?'
        )
          .bind(verifiedUid, emailProfile.id)
          .run();

        userProfile = {
          ...emailProfile,
          firebase_uid: verifiedUid,
        };
      }
    }

    // 1. Check if CRM profile exists
    if (!userProfile) {
      return c.json(
        {
          success: false,
          code: 'PROFILE_NOT_FOUND',
          message: 'Authenticated user does not have a registered CRM staff profile.',
        },
        403
      );
    }

    // 2. Check if user is active (is_active in D1 is 1/0 or boolean true/false)
    const isActive = userProfile.is_active === 1 || userProfile.is_active === true;
    if (!isActive) {
      return c.json(
        {
          success: false,
          code: 'ACCOUNT_INACTIVE',
          message: 'Your CRM account has been deactivated. Contact an administrator.',
        },
        403
      );
    }

    // 3. Normalize & validate role against allowed CRM roles
    const normalizedRole = String(userProfile.role || '').toUpperCase() as CrmRole;
    if (!VALID_CRM_ROLES.has(normalizedRole)) {
      return c.json(
        {
          success: false,
          code: 'INVALID_ROLE',
          message: 'User has an invalid or unrecognized CRM role assignment.',
        },
        403
      );
    }

    // 4. Attach verified server-side user context (never trusting client input)
    c.set('user', {
      ...userProfile,
      role: normalizedRole,
    });
    c.set('firebaseUid', verifiedUid);

    await next();
  } catch (dbErr: unknown) {
    const errMsg = dbErr instanceof Error ? dbErr.message : 'Database error';
    return c.json(
      {
        success: false,
        code: 'DATABASE_ERROR',
        message: 'Failed to verify user profile against database.',
        detail: errMsg,
      },
      500
    );
  }
};
