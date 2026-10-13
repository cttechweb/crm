import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { app } from '../src/index.ts';
import { setCustomJWKS } from '../src/auth.ts';

const PROJECT_ID = 'cool-tech-crm';
const ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;

describe('cool-tech-crm-api Products & E-Commerce Integration Suite', () => {
  let validKeyPair;
  const validKeyId = 'key-test-prod-1';

  before(async () => {
    validKeyPair = await generateKeyPair('RS256', { extractable: true });
    const publicJwk = await exportJWK(validKeyPair.publicKey);
    publicJwk.kid = validKeyId;
    publicJwk.alg = 'RS256';
    publicJwk.use = 'sig';

    setCustomJWKS(async () => publicJwk);
  });

  async function createValidStaffToken(uid = 'uid_staff_1') {
    return await new SignJWT({
      email: 'staff@cooltechuae.com',
      sub: uid,
      user_id: uid,
    })
      .setProtectedHeader({ alg: 'RS256', kid: validKeyId })
      .setIssuer(ISSUER)
      .setAudience(PROJECT_ID)
      .setExpirationTime('1h')
      .setIssuedAt()
      .sign(validKeyPair.privateKey);
  }

  function createMockDb() {
    return {
      prepare(sql) {
        return {
          bind() {
            return this;
          },
          async all() {
            if (sql.includes('FROM users')) {
              return {
                results: [
                  {
                    id: 'usr_staff_1',
                    firebase_uid: 'uid_staff_1',
                    email: 'staff@cooltechuae.com',
                    full_name: 'Staff Member',
                    role: 'EMPLOYEE',
                    is_active: 1,
                  },
                ],
              };
            }
            return { results: [] };
          },
        };
      },
    };
  }

  it('1. GET /api/products without token returns 401', async () => {
    const res = await app.request('/api/products', { method: 'GET' }, {
      DB: createMockDb(),
      FIREBASE_PROJECT_ID: PROJECT_ID,
    });
    assert.equal(res.status, 401);
  });

  it('2. GET /api/products with keyword uses ECOMMERCE_SERVICE binding and maps fields', async () => {
    const token = await createValidStaffToken();
    let requestedUrl = '';

    const mockEcommerceService = {
      async fetch(req) {
        requestedUrl = req.url;
        return new Response(
          JSON.stringify({
            status: 'success',
            count: 1,
            products: [
              {
                id: 'prod_901',
                name: 'Chiller Unit 5 TR',
                slug: 'chiller-unit-5-tr',
                category: 'Chillers',
                brand: 'MIDEA',
                price: 12500,
                imageUrl: 'https://cdn.cooltech.ae/chiller.jpg',
                inStock: 1,
                rating: 4.9,
                description: 'Heavy duty commercial chiller unit',
                status: 'active',
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      },
    };

    const res = await app.request(
      '/api/products?q=Chiller&category=Chillers&brand=MIDEA',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        DB: createMockDb(),
        FIREBASE_PROJECT_ID: PROJECT_ID,
        ECOMMERCE_SERVICE: mockEcommerceService,
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.products.length, 1);
    assert.equal(body.products[0].id, 'prod_901');
    assert.equal(body.products[0].name, 'Chiller Unit 5 TR');
    assert.equal(body.products[0].sellingPrice, 12500);
    assert.equal(body.products[0].thumbnailImage, 'https://cdn.cooltech.ae/chiller.jpg');
    assert.equal(body.products[0].inStock, true);
    assert.ok(requestedUrl.includes('search=Chiller'));
    assert.ok(requestedUrl.includes('category=Chillers'));
  });

  it('3. GET /api/products with exact ID calls e-commerce single-product endpoint', async () => {
    const token = await createValidStaffToken();
    let requestedUrl = '';

    const mockEcommerceService = {
      async fetch(req) {
        requestedUrl = req.url;
        return new Response(
          JSON.stringify({
            status: 'success',
            product: {
              id: 'prod_901',
              name: 'Exact AC Unit',
              category: 'Split AC',
              brand: 'GREE',
              price: 2400,
              inStock: 1,
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      },
    };

    const res = await app.request(
      '/api/products?id=prod_901',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        DB: createMockDb(),
        FIREBASE_PROJECT_ID: PROJECT_ID,
        ECOMMERCE_SERVICE: mockEcommerceService,
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.products.length, 1);
    assert.equal(body.products[0].id, 'prod_901');
    assert.equal(body.products[0].name, 'Exact AC Unit');
    assert.ok(requestedUrl.includes('/api/products/prod_901'));
  });

  it('4. GET /api/products with non-existent ID returns empty list gracefully', async () => {
    const token = await createValidStaffToken();

    const mockEcommerceService = {
      async fetch() {
        return new Response(
          JSON.stringify({ error: 'Not Found', message: 'Product not found' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      },
    };

    const res = await app.request(
      '/api/products?id=non_existent_id',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        DB: createMockDb(),
        FIREBASE_PROJECT_ID: PROJECT_ID,
        ECOMMERCE_SERVICE: mockEcommerceService,
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.products.length, 0);
  });

  it('5. GET /api/products maps extended fields (modelId, badge, specs) and allows limit up to 1000', async () => {
    const token = await createValidStaffToken();
    let requestedUrl = '';

    const mockEcommerceService = {
      async fetch(req) {
        requestedUrl = req.url;
        return new Response(
          JSON.stringify({
            status: 'success',
            count: 1,
            products: [
              {
                id: 'prod_1001',
                name: 'Precision VRF Condenser Unit',
                slug: 'precision-vrf-condenser',
                category: 'VRF Systems',
                brand: 'DAIKIN',
                price: 18500,
                imageUrl: 'https://cdn.cooltech.ae/vrf.jpg',
                inStock: 1,
                minOrderQty: 2,
                modelId: 'RXQ16TAYDU',
                badge: 'Best Seller',
                isFeatured: true,
                specifications: { coolingCapacity: '45 kW', refrigerant: 'R410A' },
                features: ['Inverter scroll compressor', 'Quiet night operation'],
                tags: ['Commercial', 'High-Efficiency'],
                documents: [{ title: 'Technical Spec Sheet', url: 'https://cdn.cooltech.ae/specs.pdf' }],
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      },
    };

    const res = await app.request(
      '/api/products?limit=1000',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        DB: createMockDb(),
        FIREBASE_PROJECT_ID: PROJECT_ID,
        ECOMMERCE_SERVICE: mockEcommerceService,
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.products.length, 1);
    const p = body.products[0];
    assert.equal(p.id, 'prod_1001');
    assert.equal(p.sellingPrice, 18500);
    assert.equal(p.purchaseRate, undefined); // Preserved honestly, not invented from selling price
    assert.equal(p.modelId, 'RXQ16TAYDU');
    assert.equal(p.serialNo, 'RXQ16TAYDU');
    assert.equal(p.badge, 'Best Seller');
    assert.equal(p.isFeatured, true);
    assert.equal(p.minOrderQty, 2);
    assert.equal(p.specifications.coolingCapacity, '45 kW');
    assert.equal(p.features.length, 2);
    assert.equal(p.tags.length, 2);
    assert.equal(p.documents.length, 1);
    assert.ok(requestedUrl.includes('limit=1000'));
  });

  it('6. GET /api/products never uses retail selling price (e.g. 1336.00) as purchase rate', async () => {
    const token = await createValidStaffToken();

    const mockEcommerceService = {
      async fetch() {
        return new Response(
          JSON.stringify({
            status: 'success',
            count: 1,
            products: [
              {
                id: 'prod-1789467712536',
                name: 'Blue Star Window AC 1.5 TR Rotary R-410a',
                category: 'Window A/C',
                brand: 'Blue Star',
                price: 1336,
                modelId: 'WM18CLYFC3-01',
                inStock: 1,
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      },
    };

    const res = await app.request(
      '/api/products?id=prod-1789467712536',
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      },
      {
        DB: createMockDb(),
        FIREBASE_PROJECT_ID: PROJECT_ID,
        ECOMMERCE_SERVICE: mockEcommerceService,
      }
    );

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.products.length, 1);
    const item = body.products[0];
    assert.equal(item.sellingPrice, 1336);
    assert.equal(item.purchaseRate, undefined);
    assert.notEqual(item.purchaseRate, 1336);
  });
});
