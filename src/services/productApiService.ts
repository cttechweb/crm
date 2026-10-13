/**
 * Product API Service for Cool Technologies CRM Frontend
 * 
 * - Communicates with CRM Worker API at /api/products
 * - Automatically fetches live e-commerce catalog data via Cloudflare Service Binding
 * - Uses existing apiClient with Firebase ID token authentication (Bearer header)
 * - Supports searching by product ID (exact) or keyword/name (partial)
 * - Supports category and brand filtering
 * - Propagates backend errors accurately
 */

import { apiClient, ApiError } from '@/lib/apiClient';
import type { ProductSettingItem } from '@/types/settings';

export interface ProductQueryParams {
  id?: string;
  q?: string;
  search?: string;
  category?: string;
  brand?: string;
  page?: number;
  limit?: number;
}

export interface ProductsApiResponse {
  success: boolean;
  products: ProductSettingItem[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

/**
 * Searches and lists products from live e-commerce system
 */
export async function getLiveProducts(params: ProductQueryParams = {}): Promise<ProductsApiResponse> {
  const queryParams: Record<string, string | number | undefined> = {};

  if (params.id && params.id.trim()) {
    queryParams.id = params.id.trim();
  }
  if (params.q && params.q.trim()) {
    queryParams.q = params.q.trim();
  } else if (params.search && params.search.trim()) {
    queryParams.q = params.search.trim();
  }
  if (params.category && params.category !== 'All' && params.category !== 'Select' && params.category !== 'All Equipment') {
    queryParams.category = params.category;
  }
  if (params.brand && params.brand !== 'All' && params.brand !== 'Select' && params.brand !== 'All Brands') {
    queryParams.brand = params.brand;
  }
  queryParams.limit = params.limit !== undefined ? params.limit : 1000;
  if (params.page) {
    queryParams.page = params.page;
  }

  try {
    const data = await apiClient.get<ProductsApiResponse>('/api/products', {
      params: queryParams,
      requireAuth: false, // apiClient attaches Firebase bearer token automatically if user is logged in
    });

    const rawList = Array.isArray(data?.products) ? data.products : [];
    const sanitizedProducts: ProductSettingItem[] = rawList.map((p: any) => {
      // Selling price is mapped to e-commerce price
      const sellingPrice =
        typeof p.sellingPrice === 'number'
          ? p.sellingPrice
          : typeof p.price === 'number'
          ? p.price
          : 0;

      // Purchase rate: NEVER use retail selling price as purchase rate.
      // Genuine purchase rate must be an explicit, distinct, positive number.
      let purchaseRate: number | undefined = undefined;
      if (
        typeof p.purchaseRate === 'number' &&
        p.purchaseRate > 0 &&
        p.purchaseRate !== sellingPrice &&
        p.purchaseRate !== p.price
      ) {
        purchaseRate = p.purchaseRate;
      }

      return {
        ...p,
        sellingPrice,
        purchaseRate,
      };
    });

    return {
      success: true,
      products: sanitizedProducts,
      total: data?.total ?? sanitizedProducts.length,
      page: data?.page || 1,
      limit: data?.limit || params.limit || 1000,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Failed to retrieve products from live e-commerce';
    throw new ApiError(msg, 500, null, '/api/products');
  }
}
