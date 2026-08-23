/**
 * Low-level HTTP client for the Laravel API.
 *
 * This module is isomorphic and deliberately dumb: it knows how to send a
 * request and how to turn a failure into a useful `ApiError`. It does NOT know
 * where the token comes from. That is the caller's job, which is what lets the
 * same code run in three places:
 *
 *   • Server Components / route handlers → `serverFetch()` in lib/api/server.ts
 *     talks straight to Laravel with the token read from an httpOnly cookie.
 *   • Client Components → `bffFetch()` in lib/api/bff.ts talks to our own
 *     /api/bff proxy, which attaches the token server-side. The browser never
 *     sees the token.
 *   • Public endpoints → either, with no token at all.
 */

import type { ApiSuccess } from './types';

/* ==========================================================================
   Configuration
   ========================================================================== */

/**
 * Root of the Laravel API, e.g. https://advaitamatrimony.com/api/v1
 *
 * Server-only. It is intentionally NOT prefixed with NEXT_PUBLIC_ so the API
 * host is never inlined into the client bundle; the browser only ever talks to
 * our own /api/bff route. `NEXT_PUBLIC_API_BASE_URL` is still honoured as a
 * fallback for existing deployments that set it.
 */
export function getApiBaseUrl(): string {
  const base =
    process.env.ADVAITA_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'https://advaitamatrimony.com/api/v1';
  return base.replace(/\/+$/, '');
}

/**
 * Root of the Laravel *application* (not the API), used to build public
 * storage URLs for photos: `{APP_URL}/storage/{path}`.
 */
export function getMediaBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');
  // Derive it from the API base by stripping the trailing /api/v1.
  return getApiBaseUrl().replace(/\/api\/v\d+$/, '');
}

/* ==========================================================================
   Errors
   ========================================================================== */

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  /** Per-field validation messages, normalised from both Laravel shapes. */
  readonly fieldErrors: FieldErrors;
  /** The parsed body, for the rare caller that needs a non-standard key. */
  readonly payload: unknown;
  /** True when the request never reached the server (offline, DNS, CORS). */
  readonly isNetwork: boolean;

  constructor(options: {
    message: string;
    status: number;
    fieldErrors?: FieldErrors;
    payload?: unknown;
    isNetwork?: boolean;
  }) {
    super(options.message);
    this.name = 'ApiError';
    this.status = options.status;
    this.fieldErrors = options.fieldErrors ?? {};
    this.payload = options.payload;
    this.isNetwork = options.isNetwork ?? false;
  }

  /** 401 — the session is gone and the user must sign in again. */
  get isUnauthenticated(): boolean {
    return this.status === 401;
  }

  /** 403 — authenticated but not permitted (suspended, plan limit, blocked). */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  /** 409 — duplicate action, e.g. interest already sent. */
  get isConflict(): boolean {
    return this.status === 409;
  }

  get isValidation(): boolean {
    return this.status === 422 || Object.keys(this.fieldErrors).length > 0;
  }

  get isServer(): boolean {
    return this.status >= 500;
  }

  /** First message for a field, for inline form errors. */
  fieldError(field: string): string | undefined {
    return this.fieldErrors[field]?.[0];
  }
}

/**
 * Turns any failure into wording a member can act on.
 *
 * Accessibility requirement (§18 "descriptive errors"): never surface a bare
 * status code, and never blame the user for a server fault.
 */
export function friendlyMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.isNetwork) {
      return 'We could not reach Advaita. Check your connection and try again.';
    }
    // Prefer the server's own message when it is human-readable.
    if (error.message && !/^(Request failed|Unexpected)/.test(error.message)) {
      return error.message;
    }
    if (error.isValidation) {
      const first = Object.values(error.fieldErrors)[0]?.[0];
      return first ?? 'Please check the highlighted fields and try again.';
    }
    if (error.isUnauthenticated) return 'Your session has expired. Please sign in again.';
    if (error.isForbidden) return 'You do not have access to this yet.';
    if (error.isNotFound) return 'We could not find what you were looking for.';
    if (error.isServer) return 'Something went wrong on our side. Please try again in a moment.';
    return 'That did not work. Please try again.';
  }
  if (error instanceof Error && error.name === 'AbortError') {
    return 'The request was cancelled.';
  }
  return 'Something unexpected happened. Please try again.';
}

/* ==========================================================================
   Request
   ========================================================================== */

export type QueryValue = string | number | boolean | undefined | null | (string | number)[];

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Plain object (sent as JSON) or FormData (sent as multipart). */
  body?: unknown;
  query?: Record<string, QueryValue>;
  token?: string | null;
  signal?: AbortSignal;
  /** Next.js fetch cache hints — ignored in the browser. */
  cache?: 'no-store' | 'force-cache';
  revalidate?: number;
  /** Extra headers; never used to override Authorization. */
  headers?: Record<string, string>;
}

/**
 * Serialises a query object the way Laravel expects.
 * Arrays become repeated `key[]=` params, which is what `whereIn` filters read.
 */
export function buildQuery(query: Record<string, QueryValue> | undefined): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item === undefined || item === null || item === '') continue;
        params.append(`${key}[]`, String(item));
      }
    } else if (typeof value === 'boolean') {
      // Laravel's `boolean` rule accepts 1/0 far more reliably than true/false.
      params.append(key, value ? '1' : '0');
    } else {
      params.append(key, String(value));
    }
  }
  const serialised = params.toString();
  return serialised ? `?${serialised}` : '';
}

function extractFieldErrors(payload: unknown): FieldErrors {
  if (!payload || typeof payload !== 'object') return {};
  const body = payload as Record<string, unknown>;
  // Both shapes the API produces put them under `errors`.
  const errors = body.errors;
  if (!errors || typeof errors !== 'object') return {};
  const result: FieldErrors = {};
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      result[field] = value.map(String);
    } else if (typeof value === 'string') {
      result[field] = [value];
    }
  }
  return result;
}

function extractMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === 'object') {
    const body = payload as Record<string, unknown>;
    if (typeof body.message === 'string' && body.message.length > 0) return body.message;
    const fieldErrors = extractFieldErrors(payload);
    const first = Object.values(fieldErrors)[0]?.[0];
    if (first) return first;
  }
  return `Request failed with status ${status}`;
}

/**
 * Performs a request against `baseUrl` and returns the parsed JSON body.
 *
 * Returns the RAW body, deliberately. The API's envelope is inconsistent
 * (some endpoints nest under `data`, others put the payload at the top level),
 * so unwrapping is the job of the typed wrappers in lib/api/endpoints.ts where
 * the correct shape for each route is documented.
 */
export async function request<T>(baseUrl: string, path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, query, token, signal, cache, revalidate, headers: extraHeaders } = options;

  const headers = new Headers(extraHeaders);
  headers.set('Accept', 'application/json');
  // Without this, `auth:sanctum` issues a redirect to a non-existent web route
  // instead of returning a 401 JSON body.
  headers.set('X-Requested-With', 'XMLHttpRequest');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    // Never set Content-Type for FormData — the boundary must be generated by
    // the runtime. Setting it manually is what breaks multipart uploads.
    payload = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  const init: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
    body: payload,
    signal,
  };
  if (cache) init.cache = cache;
  if (revalidate !== undefined) init.next = { revalidate };

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}${buildQuery(query)}`, init);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new ApiError({
      message: 'Network request failed',
      status: 0,
      isNetwork: true,
      payload: error,
    });
  }

  if (response.status === 204) return null as T;

  // The body may not be JSON at all (Laravel debug pages, proxy HTML errors).
  const raw = await response.text();
  let parsed: unknown = null;
  if (raw.length > 0) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    throw new ApiError({
      message: parsed
        ? extractMessage(parsed, response.status)
        : `Request failed with status ${response.status}`,
      status: response.status,
      fieldErrors: extractFieldErrors(parsed),
      payload: parsed ?? raw,
    });
  }

  return parsed as T;
}

/* ==========================================================================
   Envelope helpers
   ========================================================================== */

/**
 * Unwraps the common `{ success, data }` envelope.
 *
 * Some endpoints return `{ success: false }` with HTTP 200 (for example
 * `request-photo` when a request is already pending). Those are handled
 * explicitly at the call site, not here.
 */
export function unwrap<T>(response: ApiSuccess<T>): T {
  return response.data;
}

/** True when a 200 response carries `success: false`. */
export function isSoftFailure(response: unknown): response is { success: false; message: string } {
  return !!response && typeof response === 'object' && (response as { success?: unknown }).success === false;
}
