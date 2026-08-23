'use client';

/**
 * Client-side API access, routed through our own /api/bff proxy.
 *
 * Client Components must never see the bearer token (see lib/auth/session.ts for
 * the reasoning), so they call our origin and the proxy attaches the credential.
 * The cookie travels automatically because the request is same-origin.
 */

import { ApiError, request, type RequestOptions } from './client';

const BFF_BASE = '/api/bff';

/**
 * Fired when the API reports that the session is gone. `SessionWatcher`
 * (components/app-shell/session-watcher.tsx) listens and redirects to sign-in,
 * so individual call sites never have to handle logout themselves.
 */
export const SESSION_EXPIRED_EVENT = 'advaita:session-expired';

function announceSessionExpiry(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
}

/**
 * Authenticated request from the browser.
 *
 * `path` is the Laravel path WITHOUT the /api/v1 prefix, e.g.
 * `/matches/recommended` or `/interests/send/42`.
 */
export async function bff<T>(path: string, options: RequestOptions = {}): Promise<T> {
  try {
    // `token` is intentionally omitted — the proxy owns it.
    return await request<T>(BFF_BASE, path, options);
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthenticated) {
      announceSessionExpiry();
    }
    throw error;
  }
}

/**
 * Calls one of our own auth route handlers (not the proxy). These set or clear
 * the session cookie, so they live at /api/auth/* rather than going upstream.
 */
export async function authRoute<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>('/api/auth', path, options);
}
