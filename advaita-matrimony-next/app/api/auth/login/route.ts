/**
 * POST /api/auth/login
 *
 * Body: { login: string, password: string }  — `login` is an email or a phone.
 *
 * Forwards to Laravel `POST /auth/login`, then stores the returned token in the
 * httpOnly session cookie. The token is never returned to the browser.
 */

import { setSessionToken } from '../../../../lib/auth/session';
import {
  authError,
  authJson,
  callApi,
  isValidPhone,
  normalisePhone,
  readJsonBody,
  str,
} from '../../../../lib/auth/route-helpers';
import type { LoginResponse } from '../../../../lib/api/types';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return authJson({ success: false, message: 'Invalid request.' }, 400);

  const rawLogin = str(body, 'login');
  const password = typeof body.password === 'string' ? body.password : '';

  if (!rawLogin) {
    return authJson(
      {
        success: false,
        message: 'Enter your email or mobile number.',
        errors: { login: ['Enter your email or mobile number.'] },
      },
      422,
    );
  }
  if (!password) {
    return authJson(
      { success: false, message: 'Enter your password.', errors: { password: ['Enter your password.'] } },
      422,
    );
  }

  // If it looks like a phone number, normalise it so "+91 98765 43210" matches
  // the 10-digit value stored in `users.phone`. Otherwise treat it as an email.
  const digitsOnly = rawLogin.replace(/\D/g, '');
  const looksLikePhone = digitsOnly.length >= 10 && !rawLogin.includes('@');
  const normalisedPhone = normalisePhone(rawLogin);
  const login = looksLikePhone && isValidPhone(normalisedPhone) ? normalisedPhone : rawLogin;

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
