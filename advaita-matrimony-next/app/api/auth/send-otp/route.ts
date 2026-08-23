/**
 * POST /api/auth/send-otp
 *
 * Body: { phone: string }  — accepts any human formatting, normalised here.
 *
 * Forwards to Laravel `POST /auth/send-otp`.
 *
 * NOTE ON `purpose`: we always send 'login'. `AuthController::verifyOtp` calls
 * `OtpService::verifyOtp($phone, $otp)` without a purpose argument, so it only
 * ever looks up rows with purpose='login'. An OTP requested as 'registration'
 * can never be verified. This is a server bug; sending 'login' works around it
 * for both sign-in and sign-up. See docs/SECURITY_FINDINGS.md.
 */

import {
  authError,
  authJson,
  callApi,
  clientIp,
  isValidPhone,
  normalisePhone,
  readJsonBody,
  str,
  throttleOtp,
} from '../../../../lib/auth/route-helpers';
import type { ApiMessage } from '../../../../lib/api/types';

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return authJson({ success: false, message: 'Invalid request.' }, 400);

  const phone = normalisePhone(str(body, 'phone'));
  if (!isValidPhone(phone)) {
    return authJson(
      {
        success: false,
        message: 'Enter a 10-digit Indian mobile number.',
        errors: { phone: ['Enter a 10-digit Indian mobile number.'] },
      },
      422,
    );
  }

  // Throttle per IP *and* per phone: one blocks a scripted flood, the other
  // blocks repeatedly texting the same victim from rotating addresses.
  const waitIp = throttleOtp(`ip:${clientIp(request)}`);
  const waitPhone = throttleOtp(`phone:${phone}`);
  const wait = Math.max(waitIp, waitPhone);
  if (wait > 0) {
    const minutes = Math.ceil(wait / 60);
    return authJson(
      {
        success: false,
        message: `Too many code requests. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`,
        retry_after: wait,
      },
      429,
    );
  }

  try {
    const result = await callApi<ApiMessage>('/auth/send-otp', {
      method: 'POST',
      body: { phone, purpose: 'login' },
    });
    // Never echo the phone back — keeps it out of logs and browser history.
    return authJson({ success: result.success, message: result.message });
  } catch (error) {
    return authError(error);
  }
}
