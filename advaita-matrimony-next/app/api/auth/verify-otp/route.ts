/**
 * POST /api/auth/verify-otp
 *
 * Body: { phone: string, otp: string }
 *
 * Two possible outcomes from Laravel:
 *   • Known phone   → a token + user. We store the token in the session cookie
 *                     and tell the client to continue to the dashboard.
 *   • Unknown phone → no token, `is_new_user: true`. The client continues to
 *                     the registration wizard carrying the verified phone.
 *
 * The token is never included in the response body.
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
import type { VerifyOtpResponse } from '../../../../lib/api/types';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return authJson({ success: false, message: 'Invalid request.' }, 400);

  const phone = normalisePhone(str(body, 'phone'));
  const otp = str(body, 'otp').replace(/\D/g, '');

  if (!isValidPhone(phone)) {
    return authJson(
      {
        success: false,
        message: 'Enter a 10-digit Indian mobile number.',
        errors: { phone: ['Invalid number.'] },
      },
      422,
    );
  }
  if (otp.length !== 6) {
    return authJson(
      {
        success: false,
        message: 'Enter the 6-digit code we sent you.',
        errors: { otp: ['Enter the 6-digit code we sent you.'] },
      },
      422,
    );
  }

  try {
    const result = await callApi<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: { phone, otp },
    });

    if ('token' in result && result.token) {
      await setSessionToken(result.token);
      return authJson({
        success: true,
        message: result.message,
        is_new_user: false,
        user: result.user,
      });
    }

    // Verified, but no account yet — registration is the next step.
    return authJson({
      success: true,
      message: result.message,
      is_new_user: true,
      phone,
    });
  } catch (error) {
    return authError(error);
  }
}
