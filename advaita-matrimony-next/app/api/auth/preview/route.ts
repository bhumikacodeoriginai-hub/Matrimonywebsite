/*
 * POST /api/auth/preview
 *
 * Development-only shortcut for local UI review. It reads the preview
 * credentials on the server, sends them through the same Laravel password
 * endpoint as normal login, and stores the returned Sanctum token in the
 * normal httpOnly session cookie. The password is never rendered into the
 * browser or returned in the response.
 */

import { setSessionToken } from '../../../../lib/auth/session';
import { authError, authJson, callApi } from '../../../../lib/auth/route-helpers';
import type { LoginResponse } from '../../../../lib/api/types';

export const dynamic = 'force-dynamic';

export async function POST() {
  const enabled =
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN === 'true';
  const login = process.env.ADVAITA_PREVIEW_LOGIN?.trim();
  const password = process.env.ADVAITA_PREVIEW_PASSWORD;

  if (!enabled || !login || !password) {
    return authJson({ success: false, message: 'Preview login is not available.' }, 404);
  }

  try {
    const result = await callApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: { login, password },
    });

    await setSessionToken(result.token);
    return authJson({ success: true, message: result.message, user: result.user });
  } catch (error) {
    return authError(error);
  }
}
