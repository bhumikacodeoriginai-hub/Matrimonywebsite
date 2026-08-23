/**
 * Create a profile.
 *
 * A Server Component that reads the entry parameters and hands them to the wizard:
 *
 *  • `?phone=…&verified=1` — set when a member came through the sign-in OTP flow
 *    and the number turned out to have no account. Their number is already
 *    verified, so the wizard skips asking again.
 *  • `?community=…` — set by the landing page's community cards.
 *  • `?plan=…` — set by the membership cards. Recorded here only so the value is
 *    documented; checkout happens after the account exists, from /subscription.
 *
 * Unlike /login this does NOT redirect an already-signed-in member away: someone
 * whose profile is half-finished should be able to come back and complete it. The
 * wizard is told they already have a session so it skips account creation.
 */

import type { Metadata } from 'next';
import { RegistrationWizard } from '../../components/onboarding/registration-wizard';
import { isAuthenticated } from '../../lib/auth/session';
import type { ProfileCategory } from '../../lib/api/types';

export const metadata: Metadata = {
  title: 'Create your profile',
  description:
    'Create a free Advaita Matrimony profile in ten short steps. Only the first step is required, and everything saves as you go.',
  robots: { index: false, follow: false },
};

const VALID_CATEGORIES: ProfileCategory[] = [
  'general',
  'physically_challenged',
  'hearing_speech_impaired',
  'vitiligo_skin_condition',
];

function parseCategory(value: string | undefined): ProfileCategory | undefined {
  if (!value) return undefined;
  return VALID_CATEGORIES.includes(value as ProfileCategory) ? (value as ProfileCategory) : undefined;
}

/** Only accept a well-formed Indian mobile number from the URL. */
function parsePhone(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, '');
  return /^[6-9]\d{9}$/.test(digits) ? digits : undefined;
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string; verified?: string; community?: string; plan?: string }>;
}) {
  const { phone, verified, community } = await searchParams;
  const signedIn = await isAuthenticated();

  const parsedPhone = parsePhone(phone);

  return (
    <RegistrationWizard
      initialPhone={parsedPhone}
      // Only trust `verified=1` when it arrives alongside a valid number.
      initialPhoneVerified={verified === '1' && parsedPhone !== undefined}
      initialCategory={parseCategory(community)}
      alreadySignedIn={signedIn}
    />
  );
}
