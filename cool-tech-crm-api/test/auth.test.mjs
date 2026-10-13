/**
 * Automated Test Suite for cool-tech-crm-api Authentication
 * 
 * Tests:
 * 1. GET /api/health (public)
 * 2. Missing token -> 401
 * 3. Malformed token -> 401
 * 4. Invalid signature -> 401
 * 5. Wrong audience -> 401
 * 6. Expired token -> 401
 * 7. Missing CRM profile in D1 -> 403 (PROFILE_NOT_FOUND)
 * 8. Inactive CRM profile in D1 -> 403 (ACCOUNT_INACTIVE)
 * 9. Valid active CRM user -> 200 OK (with full_name & server-side user context)
 * 10. GET /api/products without auth -> 401 (protection check)
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

// In-memory mock D1 database implementation for tests
function createMockD1Database(users = []) {
  return {
    prepare(sql) {
      let boundParams = [];
      return {
        bind(...params) {
          boundParams = params;
          return this;
        },
        async all() {
          if (sql.includes('FROM users')) {
            const uid = boundParams[0];
            const found = users.filter((u) => u.firebase_uid === uid);
            return { results: found };
          }
          if (sql.includes('FROM products')) {
            return { results: [{ id: 'prod_1', name: 'Chiller Unit', price: 5000 }] };
          }
          return { results: [] };
        },
      };
    },
  };
}

describe('cool-tech-crm-api Authentication Test Suite', () => {
  let validKeyPair;
  let attackerKeyPair;
  let validKeyId = 'google-test-key-1';

  before(async () => {
    validKeyPair = await generateKeyPair('RS256', { extractable: true });
    attackerKeyPair = await generateKeyPair('RS256', { extractable: true });

    const publicJwk = await exportJWK(validKeyPair.publicKey);
    publicJwk.kid = validKeyId;
    publicJwk.alg = 'RS256';
    publicJwk.use = 'sig';

    const mockJWKS = async (protectedHeader) => {
      if (protectedHeader?.kid === validKeyId) {
        return validKeyPair.publicKey;
      }
      throw new Error('Key ID not found in JWKS');
    };

    setCustomJWKS(mockJWKS);
  });

  async function createTestJwt({
    keyPair = validKeyPair,
    kid = validKeyId,
    sub = 'firebase_user_123',
    aud = PROJECT_ID,
    iss = ISSUER,
    exp = '1h',
  } = {}) {
    let signBuilder = new SignJWT({ email: 'staff@cooltechuae.com' })
      .setProtectedHeader({ alg: 'RS256', kid })
      .setSubject(sub)
      .setAudience(aud)
      .setIssuer(iss);

    if (exp === 'expired') {
      signBuilder = signBuilder.setIssuedAt(Math.floor(Date.now() / 1000) - 3600);
      signBuilder = signBuilder.setExpirationTime(Math.floor(Date.now() / 1000) - 60);
    } else {
      signBuilder = signBuilder.setIssuedAt().setExpirationTime(exp);
    }

    return await signBuilder.sign(keyPair.privateKey);
  }

  // 1. Public Health Check
  it('1. GET /api/health should remain publicly accessible (200 OK)', async () => {
    const res = await app.request('/api/health');
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.message, 'Cool Technologies CRM API is running');
  });

  // 2. Missing Token
  it('2. GET /api/auth/me without Authorization header should return 401', async () => {
    const mockDb = createMockD1Database([]);
    const res = await app.request('/api/auth/me', { method: 'GET' }, { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'UNAUTHORIZED');
  });

  // 3. Malformed Token
  it('3. GET /api/auth/me with malformed token should return 401', async () => {
    const mockDb = createMockD1Database([]);
    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: 'Bearer this-is-not-a-valid-jwt' },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_TOKEN');
  });

  // 4. Invalid Signature
  it('4. GET /api/auth/me with invalid signature should return 401', async () => {
    const untrustedToken = await createTestJwt({
      keyPair: attackerKeyPair,
      kid: 'untrusted-kid',
    });

    const mockDb = createMockD1Database([]);
    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${untrustedToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_TOKEN');
  });

  // 5. Wrong Audience
  it('5. GET /api/auth/me with wrong audience should return 401', async () => {
    const wrongAudToken = await createTestJwt({ aud: 'different-firebase-project' });

    const mockDb = createMockD1Database([]);
    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${wrongAudToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_TOKEN');
  });

  // 6. Expired Token
  it('6. GET /api/auth/me with expired token should return 401', async () => {
    const expiredToken = await createTestJwt({ exp: 'expired' });

    const mockDb = createMockD1Database([]);
    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${expiredToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.code, 'INVALID_TOKEN');
  });

  // 7. Missing CRM Profile in D1
  it('7. Valid token but no matching CRM user in D1 should return 403 PROFILE_NOT_FOUND', async () => {
    const validToken = await createTestJwt({ sub: 'unregistered_uid_999' });

    const mockDb = createMockD1Database([]);
    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${validToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'PROFILE_NOT_FOUND');
  });

  // 8. Inactive CRM Profile
  it('8. Valid token but inactive CRM user (is_active = 0) should return 403 ACCOUNT_INACTIVE', async () => {
    const validToken = await createTestJwt({ sub: 'inactive_uid_001' });

    const mockDb = createMockD1Database([
      {
        id: 'usr_inactive_1',
        firebase_uid: 'inactive_uid_001',
        email: 'inactive@cooltechuae.com',
        full_name: 'Inactive User',
        role: 'EMPLOYEE',
        is_active: 0,
      },
    ]);

    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${validToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'ACCOUNT_INACTIVE');
  });

  // 9. Active CRM User -> 200 OK
  it('9. Valid token and active user (is_active = 1) should return 200 with full_name and server user context', async () => {
    const validToken = await createTestJwt({ sub: 'active_admin_uid' });

    const mockDb = createMockD1Database([
      {
        id: 'adm_shemin',
        firebase_uid: 'active_admin_uid',
        email: 'shemin@cooltechuae.com',
        full_name: 'Muhammed Shemin',
        role: 'ADMIN',
        is_active: 1,
        department: 'Executive Operations',
        position: 'Managing Director',
      },
    ]);

    const res = await app.request(
      '/api/auth/me',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${validToken}` },
      },
      { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID }
    );
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.user.id, 'adm_shemin');
    assert.equal(body.user.full_name, 'Muhammed Shemin');
    assert.equal(body.user.role, 'ADMIN');
    assert.equal(body.user.is_active, 1);
  });

  // 10. Protected Products Endpoint
  it('10. GET /api/products without token should return 401 (no longer publicly exposed)', async () => {
    const mockDb = createMockD1Database([]);
    const res = await app.request('/api/products', { method: 'GET' }, { DB: mockDb, FIREBASE_PROJECT_ID: PROJECT_ID });
    assert.equal(res.status, 401);
  });
});
