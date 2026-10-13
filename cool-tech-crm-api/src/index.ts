/**
 * cool-tech-crm-api
 * Dedicated Cloudflare Worker API for Cool Technologies CRM
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env, AppVariables, CrmProductItem } from './types.ts';
import { authMiddleware } from './auth.ts';
import { customersApp } from './customers.ts';

const app = new Hono<{ Bindings: Env; Variables: AppVariables }>();

// 1. Scoped, Restricted CORS Middleware
app.use('*', async (c, next) => {
  const allowedOriginSetting = c.env?.ALLOWED_ORIGIN;

  return cors({
    origin: (requestOrigin) => {
      if (!requestOrigin) return null;

      // Allow configured production CRM origin
      if (allowedOriginSetting && requestOrigin === allowedOriginSetting) {
        return requestOrigin;
      }

      // Allow only this project's Vercel preview/production deployments (scoped, not wildcard)
      if (
        (requestOrigin.startsWith('https://cool-tech-crm') || requestOrigin.startsWith('https://crm-')) &&
        requestOrigin.endsWith('.vercel.app')
      ) {
        return requestOrigin;
      }

      // Allow local development
      if (requestOrigin === 'http://localhost:3000' || requestOrigin === 'http://127.0.0.1:3000') {
        return requestOrigin;
      }

      return null;
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  })(c, next);
});

// 2. Public Health Check Endpoint
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'Cool Technologies CRM API is running',
    timestamp: new Date().toISOString(),
  });
});

// 3. Protected Auth Verification Endpoint (Inspects verified server context)
app.get('/api/auth/me', authMiddleware, (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name || null,
      role: user.role,
      position: user.position || null,
      department: user.department || null,
      reports_to: user.reports_to || null,
      is_active: user.is_active,
    },
  });
});

// Helper to transform e-commerce product records into CRM product selector schema
function mapEcomProductToCrmProduct(item: any): CrmProductItem {
  // Preserve selling price meaning; do not invent purchase prices from customer catalog prices
  const sellingPrice = typeof item.price === 'number' ? item.price : Number(item.price) || 0;
  // Never use retail selling price as purchase rate.
  const purchaseRate =
    typeof item.purchaseRate === 'number' &&
    item.purchaseRate > 0 &&
    item.purchaseRate !== sellingPrice
      ? item.purchaseRate
      : undefined;
  const rawId = String(item.id || item.code || '');
  const thumbnail = item.imageUrl || item.image || (Array.isArray(item.images) ? item.images[0] : '') || '';
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : (thumbnail ? [thumbnail] : []);

  return {
    id: rawId,
    code: item.code || item.slug || rawId,
    sku: item.sku || rawId,
    name: item.name || 'Untitled Product',
    slug: item.slug || undefined,
    category: item.category || 'General',
    categoryId: item.categoryId || undefined,
    brand: item.brand || 'General',
    sellingPrice,
    purchaseRate,
    basePrice: sellingPrice,
    thumbnailImage: thumbnail,
    images,
    inStock: Boolean(item.inStock),
    currentStock: item.inStock ? 1 : 0,
    minOrderQty: typeof item.minOrderQty === 'number' ? item.minOrderQty : 1,
    rating: typeof item.rating === 'number' ? item.rating : 4.8,
    status: item.status === 'active' || item.status === true || item.is_active === 1,
    additionalDescription: item.description || '',
    modelId: item.modelId || undefined,
    serialNo: item.modelId || item.serialNo || undefined,
    badge: item.badge || undefined,
    isFeatured: Boolean(item.isFeatured),
    specifications: typeof item.specifications === 'object' && item.specifications !== null ? item.specifications : undefined,
    features: Array.isArray(item.features) ? item.features : undefined,
    tags: Array.isArray(item.tags) ? item.tags : undefined,
    documents: Array.isArray(item.documents) ? item.documents : undefined,
    unit: item.unit || 'Pcs',
    type: item.type || 'Product',
  };
}

// 4. Products Search & Retrieval Endpoint (Protected by authMiddleware)
// Connects via Cloudflare Service Binding to cooltech-api-worker without copying data into CRM database
app.get('/api/products', authMiddleware, async (c) => {
  const url = new URL(c.req.url);
  const idParam = (url.searchParams.get('id') || '').trim();
  const searchParam = (url.searchParams.get('q') || url.searchParams.get('search') || '').trim();
  const categoryParam = (url.searchParams.get('category') || '').trim();
  const brandParam = (url.searchParams.get('brand') || '').trim();
  const limitParam = Math.min(1000, Math.max(1, parseInt(url.searchParams.get('limit') || '1000', 10) || 1000));
  const pageParam = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1);

  // A. If Cloudflare Service Binding to cooltech-api-worker is available
  if (c.env.ECOMMERCE_SERVICE) {
    try {
      // 1. Exact Product ID Lookup
      if (idParam) {
        const ecomUrl = `https://cooltech-api-worker/api/products/${encodeURIComponent(idParam)}`;
        const response = await c.env.ECOMMERCE_SERVICE.fetch(
          new Request(ecomUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(8000),
          })
        );

        if (response.status === 404) {
          return c.json({
            success: true,
            products: [],
            total: 0,
            page: 1,
            limit: limitParam,
          });
        }

        if (!response.ok) {
          return c.json(
            {
              success: false,
              message: `E-commerce service returned HTTP ${response.status}`,
              products: [],
            },
            502
          );
        }

        const data = (await response.json()) as any;
        const rawProduct = data?.product || (Array.isArray(data?.products) ? data.products[0] : data);
        const mapped = rawProduct && rawProduct.id ? [mapEcomProductToCrmProduct(rawProduct)] : [];

        return c.json({
          success: true,
          products: mapped,
          total: mapped.length,
          page: 1,
          limit: limitParam,
        });
      }

      // 2. Keyword Search & Filter Retrieval (Name, Brand, Category)
      const ecomParams = new URLSearchParams();
      if (searchParam) {
        ecomParams.set('search', searchParam);
      }
      if (categoryParam && categoryParam !== 'All' && categoryParam !== 'Select' && categoryParam !== 'All Equipment') {
        ecomParams.set('category', categoryParam);
      }
      if (brandParam && brandParam !== 'All' && brandParam !== 'Select' && brandParam !== 'All Brands') {
        ecomParams.set('brand', brandParam);
      }
      ecomParams.set('limit', String(limitParam));

      const ecomUrl = `https://cooltech-api-worker/api/products?${ecomParams.toString()}`;
      const response = await c.env.ECOMMERCE_SERVICE.fetch(
        new Request(ecomUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000),
        })
      );

      if (!response.ok) {
        return c.json(
          {
            success: false,
            message: `E-commerce service returned HTTP ${response.status}`,
            products: [],
          },
          502
        );
      }

      const data = (await response.json()) as any;
      const rawList = Array.isArray(data?.products) ? data.products : [];
      let mappedList: CrmProductItem[] = rawList.map(mapEcomProductToCrmProduct);

      // If searching with a keyword and 0 products matched name/brand/category, attempt exact ID lookup
      if (searchParam && !idParam && mappedList.length === 0) {
        try {
          const idLookupRes = await c.env.ECOMMERCE_SERVICE.fetch(
            new Request(`https://cooltech-api-worker/api/products/${encodeURIComponent(searchParam)}`, {
              method: 'GET',
              headers: { 'Accept': 'application/json' },
              signal: AbortSignal.timeout(4000),
            })
          );
          if (idLookupRes.ok) {
            const idData = (await idLookupRes.json()) as any;
            const singleProduct = idData?.product || idData;
            if (singleProduct && singleProduct.id) {
              mappedList.unshift(mapEcomProductToCrmProduct(singleProduct));
            }
          }
        } catch {
          // Non-blocking fallback
        }
      }

      // In-memory secondary ID check if search query matches an exact ID
      if (searchParam && !idParam && mappedList.length > 0) {
        const lowerSearch = searchParam.toLowerCase();
        mappedList.sort((a, b) => {
          const aIdMatch = a.id.toLowerCase() === lowerSearch ? -1 : 0;
          const bIdMatch = b.id.toLowerCase() === lowerSearch ? -1 : 0;
          return aIdMatch - bIdMatch;
        });
      }

      const total = mappedList.length;
      const startIndex = (pageParam - 1) * limitParam;
      const paginated = mappedList.slice(startIndex, startIndex + limitParam);

      return c.json({
        success: true,
        products: paginated,
        total,
        page: pageParam,
        limit: limitParam,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'E-commerce service communication error';
      return c.json(
        {
          success: false,
          message: 'Failed to retrieve live products from e-commerce service',
          error: msg,
          products: [],
        },
        502
      );
    }
  }

  // B. Optional Direct URL fallback (if ECOMMERCE_API_URL configured)
  if (c.env.ECOMMERCE_API_URL) {
    try {
      const baseUrl = c.env.ECOMMERCE_API_URL.replace(/\/+$/, '');
      const fetchUrl = idParam
        ? `${baseUrl}/api/products/${encodeURIComponent(idParam)}`
        : `${baseUrl}/api/products?search=${encodeURIComponent(searchParam)}&limit=${limitParam}`;

      const response = await fetch(fetchUrl, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        return c.json({ success: false, message: 'External API failure', products: [] }, 502);
      }

      const data = (await response.json()) as any;
      const raw = idParam ? [data?.product || data] : (data?.products || []);
      const mapped = raw.filter(Boolean).map(mapEcomProductToCrmProduct);

      return c.json({
        success: true,
        products: mapped,
        total: mapped.length,
      });
    } catch (err: unknown) {
      return c.json({ success: false, message: 'Network failure', error: String(err) }, 502);
    }
  }

  // C. Fallback for unit testing environments (e.g. auth.test.mjs mock DB)
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT id, name, sku, price, stock, category FROM products ORDER BY name ASC'
    ).all();

    return c.json({
      success: true,
      products: results || [],
      total: (results || []).length,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching products';
    return c.json(
      {
        success: false,
        message: 'Failed to retrieve products',
        error: msg,
      },
      500
    );
  }
});


// 5. Customer Endpoints (Protected by authMiddleware & RBAC)
app.route('/api/customers', customersApp);

// Global 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      message: 'Endpoint not found',
    },
    404
  );
});

// Global Error Handler
app.onError((err, c) => {
  return c.json(
    {
      success: false,
      message: 'Internal server error',
    },
    500
  );
});

export default app;
export { app };
