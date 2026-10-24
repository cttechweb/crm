/**
 * Centralized API Client for Cool Technologies CRM
 * 
 * Configured for the deployed Cloudflare Worker API:
 * - Reads API base URL from NEXT_PUBLIC_API_URL
 * - Validates absolute HTTP/HTTPS URL protocols
 * - 15-second default timeout via AbortController with caller-signal chaining
 * - Attaches Firebase ID token when available (non-blocking when requireAuth is false)
 * - Explicit fail-fast local verification when requireAuth is true
 * - Clear, structured error classification (HTTP status, timeout, network failure)
 * - Zero token, password, or credential logging
 */

import { auth } from '@/firebase/config';

const DEFAULT_FALLBACK_URL = 'https://cool-tech-crm-api.ctauhweb.workers.dev';
const DEFAULT_TIMEOUT_MS = 10000;

/**
 * Validates and normalizes the API base URL.
 * Accepts only absolute HTTP and HTTPS URLs.
 */
export function validateAndGetBaseUrl(): string {
  const envVal = process.env.NEXT_PUBLIC_API_URL;
  const target = envVal !== undefined && envVal.trim() !== '' ? envVal.trim() : DEFAULT_FALLBACK_URL;

  try {
    const parsed = new URL(target);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error(`Unsupported protocol "${parsed.protocol}". Only HTTP and HTTPS are permitted.`);
    }
    return target.replace(/\/+$/, '');
  } catch (err: unknown) {
    const detail = err instanceof Error ? err.message : 'Malformed URL format';
    throw new ApiError(
      `Invalid API base URL configuration: ${detail}`,
      0,
      null,
      '',
      false
    );
  }
}

// Initial validated base URL export for backward compatibility
export const API_BASE_URL = validateAndGetBaseUrl();

/**
 * Standardized API Error class
 */
export class ApiError extends Error {
  public status: number;
  public data: unknown;
  public endpoint: string;
  public isNetworkError: boolean;
  public isTimeout: boolean;

  constructor(
    message: string,
    status: number = 500,
    data: unknown = null,
    endpoint: string = '',
    isNetworkError: boolean = false,
    isTimeout: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.endpoint = endpoint;
    this.isNetworkError = isNetworkError;
    this.isTimeout = isTimeout;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Request options for API client calls
 */
export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  /** Query parameters to append to the URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON payload for POST/PUT/PATCH requests */
  body?: unknown;
  /** Explicit token override (optional) */
  token?: string;
  /** If true, skips attaching the Firebase auth token */
  skipAuth?: boolean;
  /**
   * When true, requires a valid authenticated Firebase session before sending the request.
   * If unauthenticated, fails locally without dispatching network requests.
   * Default: false.
   */
  requireAuth?: boolean;
  /**
   * Request timeout in milliseconds.
   * Default: 35000 (35 seconds).
   */
  timeoutMs?: number;
}

/**
 * Safely waits for Firebase auth state to stabilize with an upper limit to prevent stalling
 */
async function waitForAuthState(timeoutMs: number = 3000): Promise<void> {
  if (typeof window === 'undefined' || !auth) return;
  if (typeof auth.authStateReady !== 'function') return;
  try {
    await Promise.race([
      auth.authStateReady(),
      new Promise((resolve) => setTimeout(resolve, timeoutMs)),
    ]);
  } catch {
    // Non-blocking fallback
  }
}

/**
 * Safely retrieves current Firebase ID token without throwing (for non-required calls)
 */
async function getFirebaseIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  try {
    await waitForAuthState(3000);
    const currentUser = auth?.currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
  } catch {
    // Non-blocking: proceed unauthenticated
  }
  return null;
}

/**
 * Constructs the final URL with query parameters after validating the base URL
 */
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined | null>): string {
  const baseUrl = validateAndGetBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = new URL(`${baseUrl}${cleanEndpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Core HTTP fetch wrapper with timeout, explicit auth verification, and error parsing
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    params,
    body,
    token,
    skipAuth = false,
    requireAuth = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    signal: callerSignal,
    headers: customHeaders,
    ...fetchOptions
  } = options;

  const url = buildUrl(endpoint, params);
  const headers = new Headers(customHeaders || {});

  // Set default JSON Content-Type if sending a body
  if (body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Handle Authentication Logic
  if (requireAuth) {
    if (skipAuth) {
      throw new ApiError(
        'Invalid request configuration: requireAuth and skipAuth cannot both be true.',
        400,
        null,
        endpoint,
        false
      );
    }

    const hasExplicitAuth = Boolean(token || headers.get('Authorization'));

    if (!hasExplicitAuth) {
      if (typeof window === 'undefined') {
        throw new ApiError(
          'Authentication required: Firebase client session is unavailable during server-side execution. Provide an explicit token option.',
          401,
          null,
          endpoint,
          false
        );
      }

      await waitForAuthState(3000);

      const currentUser = auth?.currentUser;
      if (!currentUser) {
        throw new ApiError(
          'Authentication required: No active user session found.',
          401,
          null,
          endpoint,
          false
        );
      }

      let idToken: string | null = null;
      try {
        idToken = await currentUser.getIdToken();
      } catch {
        throw new ApiError(
          'Authentication failed: Unable to acquire authentication token from Firebase.',
          401,
          null,
          endpoint,
          false
        );
      }

      if (!idToken) {
        throw new ApiError(
          'Authentication failed: Retrieved user token is empty or invalid.',
          401,
          null,
          endpoint,
          false
        );
      }

      headers.set('Authorization', `Bearer ${idToken}`);
    } else if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } else if (!skipAuth && !headers.has('Authorization')) {
    // Optional / non-blocking token resolution for public/mixed endpoints
    const resolvedToken = token || (await getFirebaseIdToken());
    if (resolvedToken) {
      headers.set('Authorization', `Bearer ${resolvedToken}`);
    }
  }

  let serializedBody: BodyInit | undefined = undefined;
  if (body !== undefined) {
    serializedBody = typeof body === 'string' ? body : JSON.stringify(body);
  }

  // Setup Timeout Controller and link caller-provided signal if present
  const controller = new AbortController();
  let didTimeout = false;

  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  let callerAbortHandler: (() => void) | null = null;
  if (callerSignal) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerAbortHandler = () => controller.abort();
      callerSignal.addEventListener('abort', callerAbortHandler, { once: true });
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      body: serializedBody,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (didTimeout) {
      throw new ApiError(
        `Request timed out after ${timeoutMs}ms`,
        0,
        null,
        endpoint,
        true,
        true
      );
    }

    if (callerSignal?.aborted) {
      throw new ApiError(
        'Request was aborted by the caller',
        0,
        null,
        endpoint,
        true,
        false
      );
    }

    const errorMsg = err instanceof Error ? err.message : 'Unknown network failure';
    throw new ApiError(
      `Network connection failed: ${errorMsg}`,
      0,
      null,
      endpoint,
      true,
      false
    );
  } finally {
    clearTimeout(timeoutId);
    if (callerSignal && callerAbortHandler) {
      callerSignal.removeEventListener('abort', callerAbortHandler);
    }
  }

  // Parse response safely
  let responseData: unknown = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await response.text();
    } catch {
      responseData = null;
    }
  }

  // Handle HTTP error statuses
  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status} (${response.statusText || 'Error'})`;

    if (responseData && typeof responseData === 'object') {
      const obj = responseData as Record<string, unknown>;
      if (typeof obj.message === 'string') {
        errorMessage = obj.message;
      } else if (typeof obj.error === 'string') {
        errorMessage = obj.error;
      }
    }

    throw new ApiError(
      errorMessage,
      response.status,
      responseData,
      endpoint,
      false,
      false
    );
  }

  return responseData as T;
}

/**
 * Convenience methods for common HTTP verbs
 */
export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: Omit<ApiRequestOptions, 'body'>) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

  request: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiFetch<T>(endpoint, options),
};

export default apiClient;
