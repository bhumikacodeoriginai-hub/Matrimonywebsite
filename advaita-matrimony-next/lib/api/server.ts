/**
 * Server-side API access.
 *
 * Use this from Server Components, Route Handlers and Server Actions. It talks
 * directly to Laravel with the token from the httpOnly session cookie, which
 * means:
 *   • one network hop instead of two (no self-fetch through /api/bff)
 *   • zero client JavaScript for the data fetch
 *   • the token is never serialised into the RSC payload
 *
 * SERVER-ONLY: imports lib/auth/session, which imports next/headers.
 */

import { ApiError, getApiBaseUrl, request, type RequestOptions } from './client';
import { getSessionToken } from '../auth/session';

/** Authenticated request. Throws `ApiError` with status 401 when signed out. */
export async function serverFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = await getSessionToken();
  if (!token) {
    throw new ApiError({ message: 'Not signed in', status: 401 });
  }
  return request<T>(getApiBaseUrl(), path, {
    // Member data is per-user and must never land in a shared cache.
    cache: 'no-store',
    ...options,
    token,
  });
}

/** Unauthenticated request, for the genuinely public endpoints. */
export async function publicFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(getApiBaseUrl(), path, options);
}

/**
 * Authenticated request that resolves to `null` instead of throwing when the
 * call fails. For non-critical dashboard panels: one dead widget should degrade
 * to an empty state, not take down the whole page.
 *
 * A 401 is deliberately re-thrown so the layout can redirect to sign-in.
 */
export async function serverFetchOptional<T>(path: string, options: RequestOptions = {}): Promise<T | null> {
  try {
    return await serverFetch<T>(path, options);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) throw error;
    if (process.env.NODE_ENV !== 'production') {
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`[advaita] optional fetch failed for ${path}: ${detail}`);
    }
    return null;
  }
}
