/**
 * Authenticated backend-for-frontend proxy.
 *
 * Client Components call `/api/bff/<laravel-path>`; this handler attaches the
 * bearer token from the httpOnly session cookie and forwards the request to the
 * Laravel API. The browser therefore never holds a credential that, once stolen,
 * would grant permanent account access (Sanctum tokens have no expiry).
 *
 * It is a byte pipe on purpose — it does not parse or reshape payloads, so
 * multipart uploads (photos, chat attachments) pass through untouched and the
 * API contract stays authoritative.
 *
 * Guardrails
 * ----------
 * • Path allow-list regex: blocks traversal and any encoded-slash trickery.
 * • Same-origin `Origin` check on every state-changing method (CSRF defence in
 *   depth on top of the cookie's SameSite=Lax).
 * • The inbound `Cookie` header is NOT forwarded — our session cookie must never
 *   leak to the API host.
 * • An upstream 401 clears the local session so the UI can react immediately.
 * • `no-store` throughout: this is per-member data.
 */

import { NextResponse } from 'next/server';
import { clearSessionToken, getSessionToken } from '../../../../lib/auth/session';
import { getApiBaseUrl } from '../../../../lib/api/client';

/** Every real API path is made of these characters. Anything else is rejected. */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

/** Response headers worth passing back; everything else is dropped. */
const PASSTHROUGH_RESPONSE_HEADERS = ['content-type', 'content-disposition'];

function jsonError(message: string, status: number): NextResponse {
  return NextResponse.json({ success: false, message }, { status, headers: { 'Cache-Control': 'no-store' } });
}

function resolvePath(segments: string[]): string | null {
  if (segments.length === 0) return null;
  for (const segment of segments) {
    // `decodeURIComponent` first so `%2e%2e` and `%2f` cannot smuggle traversal.
    let decoded: string;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return null;
    }
    if (decoded !== segment) return null;
    if (!SAFE_SEGMENT.test(decoded)) return null;
    if (decoded === '.' || decoded === '..') return null;
  }
  return `/${segments.join('/')}`;
}

/**
 * Rejects cross-site state-changing requests. Same-origin `fetch()` always sends
 * `Origin` for non-GET methods, so a missing or mismatched value is suspicious.
 */
function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

async function proxy(
  request: Request,
  context: { params: Promise<{ path: string[] }> },
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
): Promise<Response> {
  const { path: segments } = await context.params;

  const apiPath = resolvePath(segments ?? []);
  if (!apiPath) return jsonError('Unsupported API path.', 400);

  if (method !== 'GET' && !isSameOrigin(request)) {
    return jsonError('Cross-origin requests are not permitted.', 403);
  }

  const token = await getSessionToken();
  if (!token) return jsonError('Your session has expired. Please sign in again.', 401);

  const headers = new Headers();
  headers.set('Accept', 'application/json');
  // Makes `auth:sanctum` return a JSON 401 rather than redirecting to a web route.
  headers.set('X-Requested-With', 'XMLHttpRequest');
  headers.set('Authorization', `Bearer ${token}`);

  // Preserve the caller's content type verbatim so multipart boundaries survive.
  const contentType = request.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);

  let body: ArrayBuffer | undefined;
  if (method !== 'GET') {
    const buffer = await request.arrayBuffer();
    if (buffer.byteLength > 0) body = buffer;
  }

  const search = new URL(request.url).search;
  const target = `${getApiBaseUrl()}${apiPath}${search}`;

  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, cache: 'no-store' });
  } catch {
    return jsonError('We could not reach Advaita. Please try again in a moment.', 502);
  }

  // The token is dead upstream; drop ours so the UI stops pretending otherwise.
  if (upstream.status === 401) {
    await clearSessionToken();
  }

  const responseHeaders = new Headers({ 'Cache-Control': 'no-store' });
  for (const name of PASSTHROUGH_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context, 'GET');
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context, 'POST');
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context, 'PUT');
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context, 'PATCH');
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return proxy(request, context, 'DELETE');
}
