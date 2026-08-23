/**
 * Compatibility presentation.
 *
 * HONESTY POLICY — read before changing any string in this file
 * ------------------------------------------------------------
 * `match_score` comes from `MatchService::calculateMatchScore`, which is a
 * hand-written weighted rule score. It is deterministic and genuinely
 * preference-based, but it is NOT machine learning. The word "AI" must never
 * appear next to it. The product brief is explicit about this, and the README's
 * "AI Recommendations" label is simply wrong.
 *
 * Three further properties of that score shape how we present it:
 *
 *  1. The denominator varies per member. Only preference groups you have
 *     actually filled in are counted, so "100%" can mean "matched the two
 *     things I specified", not "matched everything".
 *  2. It returns a flat 50 when you have no partner preferences saved, and 30
 *     when the candidate has no profile row. Those are placeholders, not
 *     measurements, so we suppress the badge entirely below the trust floor.
 *  3. State, religion and category are ALSO hard database filters, so survivors
 *     almost always score those points — which inflates the number.
 *
 * Therefore: we show the score as "preference match", we explain every reason
 * from data we can actually verify, and we never invent a reason.
 */

import type { PartnerPreferenceRecord, ProfileCardData } from './api/types';
import { PROFILE_CATEGORY_LABELS } from './enums';

/**
 * Below this, the score is dominated by the 50/30 fallbacks rather than by real
 * preference overlap, so a badge would imply precision that does not exist.
 */
export const SCORE_DISPLAY_FLOOR = 55;

export type CompatibilityBand = 'exceptional' | 'strong' | 'promising' | 'exploratory';

export function bandFor(score: number): CompatibilityBand {
  if (score >= 90) return 'exceptional';
  if (score >= 75) return 'strong';
  if (score >= 60) return 'promising';
  return 'exploratory';
}

export const BAND_LABELS: Record<CompatibilityBand, string> = {
  exceptional: 'Exceptional match',
  strong: 'Strong match',
  promising: 'Promising match',
  exploratory: 'Worth exploring',
};

/** True when we have enough signal to show a number at all. */
export function shouldShowScore(
  score: number | undefined,
  preferences: PartnerPreferenceRecord | null | undefined,
): boolean {
  if (score === undefined || score === null) return false;
  if (score < SCORE_DISPLAY_FLOOR) return false;
  // With no saved preferences the score is the hard-coded 50 fallback.
  if (!preferences || !hasAnyPreference(preferences)) return false;
  return true;
}

export function hasAnyPreference(preferences: PartnerPreferenceRecord): boolean {
  return Boolean(
    preferences.min_age ||
    preferences.max_age ||
    preferences.accepted_categories?.length ||
    preferences.preferred_states?.length ||
    preferences.religion_preferences?.length ||
    preferences.education_preferences?.length ||
    preferences.diet_preferences?.length,
  );
}

export interface MatchReason {
  /** Short label shown as a chip. */
  label: string;
  /** Longer sentence for the tooltip / detail list. */
  detail: string;
  kind: 'age' | 'location' | 'education' | 'community' | 'religion' | 'lifestyle';
}

/**
 * Derives the reasons behind a score from data we can actually see.
 *
 * IMPORTANT: recommendations return a CARD, not a full profile — we get city,
 * state, age, education, occupation and category, and nothing else. So religion
 * and diet overlap cannot be verified here even though they contribute to the
 * score, and we simply do not claim them. Under-claiming is the correct failure
 * mode: an unexplained point is better than a fabricated reason.
 */
export function explainMatch(
  candidate: ProfileCardData,
  preferences: PartnerPreferenceRecord | null | undefined,
): MatchReason[] {
  if (!preferences) return [];
  const reasons: MatchReason[] = [];

  const age = candidate.age ?? null;
  if (age !== null && (preferences.min_age || preferences.max_age)) {
    const min = preferences.min_age ?? 18;
    const max = preferences.max_age ?? 75;
    if (age >= min && age <= max) {
      reasons.push({
        kind: 'age',
        label: 'Age you prefer',
        detail: `${age} is inside the ${min}–${max} range you set.`,
      });
    }
  }

  if (candidate.state && preferences.preferred_states?.length) {
    if (preferences.preferred_states.includes(candidate.state)) {
      reasons.push({
        kind: 'location',
        label: 'Preferred location',
        detail: `Lives in ${candidate.city ? `${candidate.city}, ` : ''}${candidate.state}, which you listed.`,
      });
    }
  }

  if (candidate.highest_education && preferences.education_preferences?.length) {
    if (preferences.education_preferences.includes(candidate.highest_education)) {
      reasons.push({
        kind: 'education',
        label: 'Education match',
        detail: `${candidate.highest_education} is among the qualifications you prefer.`,
      });
    }
  }

  if (candidate.profile_category && preferences.accepted_categories?.length) {
    if (preferences.accepted_categories.includes(candidate.profile_category)) {
      reasons.push({
        kind: 'community',
        label: 'Community you accept',
        detail: `${PROFILE_CATEGORY_LABELS[candidate.profile_category]} is one of the communities you are open to.`,
      });
    }
  }

  return reasons;
}

/**
 * The disclosure shown beside every score. Deliberately plain language: members
 * deserve to know a number about their marriage prospects is arithmetic on the
 * preferences they typed, not a verdict.
 */
export const SCORE_DISCLOSURE =
  'Calculated from the partner preferences you saved — your age range, locations, communities and education. It is not a prediction, and it improves as you add more preferences.';

export const SCORE_METHOD_LABEL = 'Preference match';

/* ==========================================================================
   Partner-preference completeness — drives "improve your matches" prompts
   ========================================================================== */

export interface PreferenceGap {
  field: keyof PartnerPreferenceRecord;
  label: string;
  /** Why filling this in changes the member's results. */
  benefit: string;
}

export function preferenceGaps(preferences: PartnerPreferenceRecord | null | undefined): PreferenceGap[] {
  const gaps: PreferenceGap[] = [];
  if (!preferences) {
    return [
      { field: 'min_age', label: 'Age range', benefit: 'The single biggest improvement to your matches.' },
      {
        field: 'preferred_states',
        label: 'Preferred locations',
        benefit: 'Narrows results to where you can meet.',
      },
      { field: 'accepted_categories', label: 'Communities', benefit: 'Tells us who to include.' },
    ];
  }

  if (!preferences.min_age && !preferences.max_age) {
    gaps.push({
      field: 'min_age',
      label: 'Age range',
      benefit: 'The single biggest improvement to your matches.',
    });
  }
  if (!preferences.preferred_states?.length) {
    gaps.push({
      field: 'preferred_states',
      label: 'Preferred locations',
      benefit: 'Narrows results to where you can realistically meet.',
    });
  }
  if (!preferences.accepted_categories?.length) {
    gaps.push({
      field: 'accepted_categories',
      label: 'Communities you are open to',
      benefit: 'Without this we cannot weight community at all.',
    });
  }
  if (!preferences.education_preferences?.length) {
    gaps.push({
      field: 'education_preferences',
      label: 'Education preferences',
      benefit: 'Adds a meaningful signal to your match scores.',
    });
  }

  return gaps;
}
