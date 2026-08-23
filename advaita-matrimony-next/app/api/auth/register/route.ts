/**
 * POST /api/auth/register
 *
 * Creates the account (Laravel `POST /auth/register`) and signs the member in by
 * storing the returned token in the httpOnly session cookie.
 *
 * Only the fields Laravel actually validates are forwarded. Everything else the
 * onboarding wizard collects is saved afterwards through
 * `PUT /profile/update` and `PUT /profile/partner-preferences`, because those
 * columns do not exist on the register endpoint.
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
import type { Gender, LoginResponse, ProfileCategory } from '../../../../lib/api/types';

const GENDERS: Gender[] = ['male', 'female', 'other'];
const CATEGORIES: ProfileCategory[] = [
  'general',
  'physically_challenged',
  'hearing_speech_impaired',
  'vitiligo_skin_condition',
];

/** Laravel rule is `before:-18 years`; mirror it so we can say why, kindly. */
function isAtLeast18(dateOfBirth: string): boolean {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return false;
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
  return dob.getTime() <= cutoff.getTime();
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return authJson({ success: false, message: 'Invalid request.' }, 400);

  const phone = normalisePhone(str(body, 'phone'));
  const name = str(body, 'name');
  const email = str(body, 'email');
  const gender = str(body, 'gender') as Gender;
  const dateOfBirth = str(body, 'date_of_birth');
  const category = str(body, 'profile_category') as ProfileCategory;
  const password = typeof body.password === 'string' ? body.password : '';

  const errors: Record<string, string[]> = {};
  if (!isValidPhone(phone)) errors.phone = ['Enter a 10-digit Indian mobile number.'];
  if (name.length < 3) errors.name = ['Your name needs at least 3 characters.'];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Enter a valid email address.'];
  if (!GENDERS.includes(gender)) errors.gender = ['Choose how you identify.'];
  if (!dateOfBirth) errors.date_of_birth = ['Enter your date of birth.'];
  else if (!isAtLeast18(dateOfBirth)) errors.date_of_birth = ['You must be at least 18 to join.'];
  if (!CATEGORIES.includes(category)) errors.profile_category = ['Choose the community that fits you.'];
  if (password.length < 6) errors.password = ['Use at least 6 characters.'];

  if (Object.keys(errors).length > 0) {
    return authJson({ success: false, message: 'Please check the highlighted fields.', errors }, 422);
  }

  try {
    const result = await callApi<LoginResponse>('/auth/register', {
      method: 'POST',
      body: {
        phone,
        name,
        // Laravel's rule is `nullable|email|unique:users`; omit rather than send ''.
        ...(email ? { email } : {}),
        gender,
        date_of_birth: dateOfBirth,
        password,
        // The server rule is `confirmed`, so this key is mandatory.
        password_confirmation: password,
        profile_category: category,
      },
    });

    await setSessionToken(result.token);
    return authJson({ success: true, message: result.message, user: result.user }, 201);
  } catch (error) {
    return authError(error);
  }
}
