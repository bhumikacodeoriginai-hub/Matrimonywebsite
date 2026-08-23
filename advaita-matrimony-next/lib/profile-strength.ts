/**
 * Profile strength: turning a completion percentage into next actions.
 *
 * DIVISION OF LABOUR — this matters for trust
 * -------------------------------------------
 * The PERCENTAGE always comes from the server (`profile_completion`), computed by
 * `ProfileController::calculateProfileCompletion` across eight weighted sections.
 * We never recompute or second-guess it, because a number that disagrees with the
 * server's own is worse than no number.
 *
 * What we do here is derive the CHECKLIST — which specific things are missing —
 * from the same profile payload, so the suggestions are specific ("Add your
 * highest qualification") rather than generic ("Complete your profile").
 *
 * Every item is verified against real data. Nothing on this list is decorative.
 */

import type { MyProfileResponse } from './api/types';
import { hasAnyPreference } from './compatibility';

export type StrengthPriority = 'critical' | 'high' | 'medium';

export interface StrengthAction {
  id: string;
  label: string;
  /** What the member gets out of doing it. */
  benefit: string;
  priority: StrengthPriority;
  /** Where the member goes to fix it. */
  href: string;
}

function isBlank(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Ordered by impact, most important first. The dashboard shows the top three;
 * the profile page shows all of them.
 */
export function strengthActions(me: MyProfileResponse): StrengthAction[] {
  const { user } = me;
  const profile = user.profile;
  const actions: StrengthAction[] = [];

  /* ---- Trust signals first: these gate what other members will do ---- */

  const approvedPhotos = user.photos.filter((photo) => photo.status === 'approved');
  const pendingPhotos = user.photos.filter((photo) => photo.status === 'pending');

  if (approvedPhotos.length === 0 && pendingPhotos.length === 0) {
    actions.push({
      id: 'first-photo',
      label: 'Add your first photo',
      benefit: 'Profiles with a photo receive far more interest. Yours stays blurred until you allow access.',
      priority: 'critical',
      href: '/profile/photos',
    });
  } else if (approvedPhotos.length + pendingPhotos.length < 3) {
    actions.push({
      id: 'more-photos',
      label: 'Add another photo',
      benefit: 'Two or three photos help people recognise you as a real person.',
      priority: 'high',
      href: '/profile/photos',
    });
  }

  if (!user.phone_verified_at) {
    actions.push({
      id: 'verify-phone',
      label: 'Verify your mobile number',
      benefit: 'Verified members are shown a trust badge and rank higher in search.',
      priority: 'critical',
      href: '/settings/verification',
    });
  }

  if (
    profile?.profile_category === 'physically_challenged' &&
    (profile.udid_verification_status === 'not_uploaded' || !profile.udid_verification_status)
  ) {
    actions.push({
      id: 'udid',
      label: 'Add your UDID details',
      benefit: 'Optional. It adds a verified badge, and only our review team ever sees the document.',
      priority: 'medium',
      href: '/settings/verification',
    });
  }

  /* ---- Then the things that make the profile worth reading ---- */

  if (isBlank(profile?.about_me)) {
    actions.push({
      id: 'about-me',
      label: 'Write a short introduction',
      benefit: 'A few honest sentences are the most-read part of any profile.',
      priority: 'high',
      href: '/profile/edit#about',
    });
  }

  if (isBlank(profile?.highest_education) || isBlank(profile?.occupation)) {
    actions.push({
      id: 'career',
      label: 'Complete your education and work',
      benefit: 'One of the first things people filter on.',
      priority: 'high',
      href: '/profile/edit#career',
    });
  }

  if (isBlank(profile?.city) || isBlank(profile?.state)) {
    actions.push({
      id: 'location',
      label: 'Add where you live',
      benefit: 'Location is used by both search and your match scores.',
      priority: 'high',
      href: '/profile/edit#location',
    });
  }

  if (!me.user.partner_preferences || !hasAnyPreference(me.user.partner_preferences)) {
    actions.push({
      id: 'preferences',
      label: 'Set your partner preferences',
      benefit: 'Without these we cannot score compatibility — every match looks average.',
      priority: 'critical',
      href: '/profile/preferences',
    });
  }

  if (isBlank(profile?.height_cm) || isBlank(profile?.marital_status)) {
    actions.push({
      id: 'basics',
      label: 'Fill in your basic details',
      benefit: 'Height and marital status are common filters.',
      priority: 'medium',
      href: '/profile/edit#basics',
    });
  }

  if (isBlank(profile?.family_type) && isBlank(profile?.family_details)) {
    actions.push({
      id: 'family',
      label: 'Tell us about your family',
      benefit: 'Families read this section closely.',
      priority: 'medium',
      href: '/profile/edit#family',
    });
  }

  if (isBlank(profile?.hobbies)) {
    actions.push({
      id: 'hobbies',
      label: 'Add a few interests',
      benefit: 'Gives people something specific to open a conversation with.',
      priority: 'medium',
      href: '/profile/edit#lifestyle',
    });
  }

  const priorityWeight: Record<StrengthPriority, number> = { critical: 0, high: 1, medium: 2 };
  return actions.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
}

/** Qualitative label for the server's percentage. */
export function strengthLabel(completion: number): string {
  if (completion >= 90) return 'Excellent';
  if (completion >= 70) return 'Strong';
  if (completion >= 50) return 'Getting there';
  if (completion >= 25) return 'Needs work';
  return 'Just started';
}

/**
 * Members whose profile is still awaiting moderation cannot be found by anyone,
 * which is the single most important thing to tell them clearly.
 */
export function visibilityNotice(me: MyProfileResponse): {
  tone: 'pending' | 'blocked' | 'live';
  message: string;
} {
  switch (me.user.profile_status) {
    case 'approved':
      return {
        tone: 'live',
        message: 'Your profile is live and visible to members who match your preferences.',
      };
    case 'pending':
      return {
        tone: 'pending',
        message:
          'Your profile is with our review team. You can browse and set everything up now — you will appear in search once it is approved.',
      };
    case 'rejected':
      return {
        tone: 'blocked',
        message:
          'Your profile needs a few changes before it can go live. Check your messages from our team for what to adjust.',
      };
    case 'suspended':
      return {
        tone: 'blocked',
        message: 'This account is suspended. Please contact support so we can help resolve it.',
      };
    default:
      return { tone: 'pending', message: 'Your profile status is being updated.' };
  }
}
