/**
 * Shared helpers for the /api/auth/* route handlers.
 *
 * These handlers are the ONLY place a Sanctum token is allowed to be touched.
 * They call Laravel, move the token straight into an httpOnly cookie, and return
 * a token-free body to the browser.
 */

import { NextResponse } from 'next/server';
import { ApiError, getApiBaseUrl, request, type RequestOptions } from '../api/client';

/** Standard no-store JSON response. Auth responses must never be cached. */
export function authJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}

/** Turns an `ApiError` back into the shape our client code already understands. */
export function authError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return authJson(
      {
        success: false,
        message: error.message,
        errors: error.fieldErrors,
      },
      // Collapse a network failure to 502 so the client shows "cannot reach us".
      error.status === 0 ? 502 : error.status,
    );
  }
  return authJson({ success: false, message: 'Something went wrong. Please try again.' }, 500);
}

/** Reads a JSON body, returning `null` for malformed input rather than throwing. */
export async function readJsonBody(request_: Request): Promise<Record<string, unknown> | null> {
  try {
    const parsed = await request_.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Calls a public Laravel endpoint from a route handler. */
export function callApi<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(getApiBaseUrl(), path, { cache: 'no-store', ...options });
}

/** Trims and returns a string field, or '' when absent/not a string. */
export function str(body: Record<string, unknown>, key: string): string {
  const value = body[key];
  return typeof value === 'string' ? value.trim() : '';
}

/* ==========================================================================
   Best-effort OTP throttle
   ==========================================================================
   Sending an SMS costs money, so an unthrottled send-otp endpoint is a billing
   vulnerability as much as a security one. Laravel caps *verification* attempts
   (5 per OTP) but does not cap *requests*.

   LIMITATIONS — read before relying on this:
   • In-memory, so it is per-instance. On serverless or multi-replica deployments
     an attacker simply spreads requests across instances.
   • Keyed on a best-effort client IP from x-forwarded-for, which is spoofable
     unless a trusted proxy overwrites it.

   It raises the cost of casual abuse and nothing more. The real fix belongs in
   Laravel (`throttle` middleware on the auth routes) or at the edge/WAF, and is
   recorded in docs/SECURITY_FINDINGS.md.
   ========================================================================== */

const OTP_WINDOW_MS = 10 * 60 * 1000;
const OTP_MAX_PER_WINDOW = 5;

const otpAttempts = new Map<string, number[]>();

export function clientIp(request_: Request): string {
  const forwarded = request_.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request_.headers.get('x-real-ip') ?? 'unknown';
}

/**
 * Returns the number of seconds the caller must wait, or 0 when allowed.
 * Records the attempt when it is allowed.
 */
export function throttleOtp(key: string): number {
  const now = Date.now();
  const recent = (otpAttempts.get(key) ?? []).filter((at) => now - at < OTP_WINDOW_MS);

  if (recent.length >= OTP_MAX_PER_WINDOW) {
    const oldest = recent[0]!;
    otpAttempts.set(key, recent);
    return Math.ceil((OTP_WINDOW_MS - (now - oldest)) / 1000);
  }

  recent.push(now);
  otpAttempts.set(key, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (otpAttempts.size > 5000) {
    for (const [mapKey, times] of otpAttempts) {
      if (times.every((at) => now - at >= OTP_WINDOW_MS)) otpAttempts.delete(mapKey);
    }
  }

  return 0;
}

/* ==========================================================================
   Input normalisation
   ========================================================================== */

/**
 * Laravel requires exactly 10 digits. Members paste "+91 98765 43210",
 * "098765 43210" and "9876543210" interchangeably, so normalise before we
 * bounce them for a formatting mistake they cannot see.
 */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function isValidPhone(phone: string): boolean {
  // Indian mobile numbers start 6–9.
  return /^[6-9]\d{9}$/.test(phone);
}
