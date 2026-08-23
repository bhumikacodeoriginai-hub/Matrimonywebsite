/**
 * POST /api/auth/logout
 *
 * Revokes the token upstream, then clears the session cookie.
 *
 * The local cookie is cleared even if the upstream call fails — a member who
 * clicks "Sign out" must end up signed out of this browser regardless of whether
 * the API was reachable. The token may survive server-side in that case, which
 * is a consequence of Sanctum tokens having no expiry; noted in
 * docs/SECURITY_FINDINGS.md.
 */

import { clearSessionToken, getSessionToken } from '../../../../lib/auth/session';
import { authJson, callApi } from '../../../../lib/auth/route-helpers';

export async function POST() {
  const token = await getSessionToken();

  if (token) {
    try {
      await callApi('/auth/logout', { method: 'POST', token });
    } catch {
      // Deliberately ignored — see the note above.
    }
  }

  await clearSessionToken();
  return authJson({ success: true, message: 'Signed out.' });
}
