'use client';

/**
 * Handles session expiry in one place.
 *
 * `lib/api/bff.ts` dispatches `advaita:session-expired` whenever an API call comes
 * back 401 (the proxy has already cleared the cookie by then). This listens for it
 * and moves the member to sign-in with a reason and a return path, so no individual
 * call site has to think about logout.
 *
 * Sanctum tokens have no expiry, so in practice this fires when a token was revoked
 * elsewhere — signing out on another device, or an admin suspending the account.
 * Either way the member deserves an explanation rather than a screen of failed
 * requests.
 */

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { SESSION_EXPIRED_EVENT } from '../../lib/api/bff';

export function SessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  /** Several in-flight requests will each 401; only redirect once. */
  const redirecting = useRef(false);

  useEffect(() => {
    const onExpired = () => {
      if (redirecting.current) return;
      redirecting.current = true;

      // Bring them back to where they were once they have signed in again.
      const params = new URLSearchParams({ reason: 'expired' });
      if (pathname && pathname !== '/login') params.set('next', pathname);

      router.replace(`/login?${params.toString()}`);
    };

    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [router, pathname]);

  return null;
}
