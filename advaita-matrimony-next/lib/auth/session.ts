/**
 * Server-side session handling.
 *
 * SECURITY DECISION — why the token lives in an httpOnly cookie
 * -------------------------------------------------------------
 * The Laravel API issues opaque Sanctum bearer tokens with NO expiry and NO
 * refresh mechanism: once leaked, a token is valid until the user explicitly
 * logs out. Storing something with that blast radius in `localStorage` means any
 * XSS anywhere on the origin — including in a third-party script — can exfiltrate
 * a permanent account credential.
 *
 * So the token never reaches the browser. It is set as an httpOnly, SameSite=Lax,
 * Secure cookie by our own route handlers, and every client-side API call goes
 * through the /api/bff proxy which re-attaches it server-side.
 *
 * Consequences you should know about:
 *   • Client Components cannot read the token. That is the point.
 *   • Server Components can, and should fetch directly (see lib/api/server.ts) —
 *     one less network hop and no client JS.
 *   • CSRF: SameSite=Lax blocks cross-site POSTs from forms/XHR, and the proxy
 *     additionally requires a same-origin fetch (see the Origin check in
 *     app/api/bff/[...path]/route.ts).
 *
 * This module imports `next/headers` and is therefore SERVER-ONLY. Importing it
 * from a Client Component is a build error, which is the desired guardrail.
 */

import { cookies } from 'next/headers';

/** Name is intentionally opaque — it does not advertise the framework or scheme. */
export const SESSION_COOKIE = 'advaita_session';

/**
 * Sanctum tokens do not expire server-side, so the cookie lifetime IS the
 * session lifetime. 30 days balances "do not make me log in constantly" against
 * the risk of an indefinitely valid credential sitting on a shared device.
 */
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/** Reads the bearer token for the current request, or null when signed out. */
export async function getSessionToken(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return value && value.length > 0 ? value : null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSessionToken()) !== null;
}

/**
 * Persists a freshly issued token.
 * Only callable from a Route Handler or Server Action.
 */
export async function setSessionToken(token: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears the session cookie. Used by logout and on any upstream 401. */
export async function clearSessionToken(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
