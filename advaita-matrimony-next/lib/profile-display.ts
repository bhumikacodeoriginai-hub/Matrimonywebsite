/**
 * Turns a `ProfileRecord` into the sections a profile page renders.
 *
 * THIS FILE IS THE PRIVACY GATE. `GET /profiles/{userId}` serialises the ENTIRE
 * profiles row to any authenticated viewer, with no server-side filtering. That
 * payload includes:
 *
 *   • `udid_certificate_number`  — a government disability identifier
 *   • `udid_document_path`       — a direct path to the uploaded certificate
 *   • `disability_percentage`    — a medical-legal figure
 *   • `latitude` / `longitude`   — precise coordinates
 *   • `pincode`                  — narrows an address to a street
 *   • `udid_verification_status` — internal moderation state
 *
 * None of it belongs on another member's screen. `HIDDEN_FIELDS` below is the
 * allow-list's inverse and is the reason this data never reaches the DOM.
 *
 * Two things follow from that, and both matter:
 *  1. Rendering a profile must go through `buildProfileSections`. Do not map over
 *     `Object.entries(profile)` anywhere in a component.
 *  2. This is a CLIENT-SIDE mitigation. The data is still in the JSON response and
 *     visible in devtools or a direct API call. The real fix is server-side field
 *     filtering, and it is recorded in docs/SECURITY_FINDINGS.md as the highest
 *     priority item.
 *
 * `disability_percentage` is a deliberate judgement call: it is genuinely part of
 * how some members describe themselves, but a bare percentage next to a photo
 * reduces a person to a number and invites exactly the bargaining the platform
 * exists to avoid. The member's own words (`disability_description`) are shown
 * instead. If a member wants the figure public, the right answer is a per-field
 * visibility toggle, not a blanket render.
 */

import {
  BLOOD_GROUPS,
  BODY_TYPE_LABELS,
  CHILDREN_LIVING_LABELS,
  COMPLEXION_LABELS,
  DIET_LABELS,
  DISABILITY_TYPE_LABELS,
  EMPLOYED_IN_LABELS,
  FAMILY_STATUS_LABELS,
  FAMILY_TYPE_LABELS,
  HABIT_LABELS,
  HEARING_CONDITION_LABELS,
  MARITAL_STATUS_LABELS,
  SKIN_CONDITION_LABELS,
  SPEECH_CONDITION_LABELS,
  VITILIGO_COVERAGE_LABELS,
  labelOf,
} from './enums';
import { formatHeight } from './format';
import type { IconName } from '../components/ui/icon';
import type { ProfileCategory, ProfileRecord } from './api/types';

/**
 * Fields that must never be rendered on another member's profile.
 * Adding a field here is always safe; removing one needs a privacy review.
 */
export const HIDDEN_FIELDS: readonly (keyof ProfileRecord)[] = [
  'udid_certificate_number',
  'udid_document_path',
  'udid_verification_status',
  'disability_percentage',
  'latitude',
  'longitude',
  'pincode',
  'user_id',
  'id',
];

export interface DisplayRow {
  key: string;
  value: string;
}

export interface DisplaySection {
  id: string;
  title: string;
  icon: IconName;
  rows: DisplayRow[];
  /** Free-text prose rendered above the rows (about me, own words). */
  prose?: string;
  /** Chips rendered below the rows (hobbies, languages). */
  tags?: string[];
}

/** Only returns a row when the value is genuinely present. */
function row(key: string, value: string | number | null | undefined): DisplayRow | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (text === '' || text === '0') return null;
  return { key, value: text };
}

function compactRows(rows: (DisplayRow | null)[]): DisplayRow[] {
  return rows.filter((item): item is DisplayRow => item !== null);
}

function yesNo(value: boolean | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  return value ? 'Yes' : null;
}

/**
 * Builds the sections for a profile page. Empty sections are dropped, so a sparse
 * profile shows a short page rather than a wall of "Not specified".
 */
export function buildProfileSections(
  profile: ProfileRecord,
  category: ProfileCategory | null,
): DisplaySection[] {
  const sections: DisplaySection[] = [];

  /* -------- In their own words -------- */
  if (profile.about_me?.trim()) {
    sections.push({
      id: 'about',
      title: 'In their own words',
      icon: 'user',
      rows: [],
      prose: profile.about_me.trim(),
    });
  }

  /* -------- Basics -------- */
  const basics = compactRows([
    row(
      'Marital status',
      profile.marital_status ? labelOf(MARITAL_STATUS_LABELS, profile.marital_status) : null,
    ),
    row('Children', profile.number_of_children),
    row(
      'Children live',
      profile.children_living_status && profile.children_living_status !== 'not_applicable'
        ? labelOf(CHILDREN_LIVING_LABELS, profile.children_living_status)
        : null,
    ),
    row('Height', formatHeight(profile.height_cm)),
    row('Body type', profile.body_type ? labelOf(BODY_TYPE_LABELS, profile.body_type) : null),
    // Complexion is shown only as the member's own description, never as a filter
    // or a badge anywhere in the product.
    row('Complexion', profile.complexion ? labelOf(COMPLEXION_LABELS, profile.complexion) : null),
    row(
      'Blood group',
      profile.blood_group && BLOOD_GROUPS.includes(profile.blood_group) ? profile.blood_group : null,
    ),
  ]);
  if (basics.length > 0) {
    sections.push({ id: 'basics', title: 'Basic details', icon: 'user', rows: basics });
  }

  /* -------- Education & career -------- */
  const career = compactRows([
    row('Highest qualification', profile.highest_education),
    row('Field of study', profile.education_field),
    row('Institution', profile.education_institution),
    row('Works in', profile.employed_in ? labelOf(EMPLOYED_IN_LABELS, profile.employed_in) : null),
    row('Role', profile.occupation),
    row('Organisation', profile.company_name),
    row('Annual income', profile.annual_income_range),
  ]);
  if (career.length > 0) {
    sections.push({ id: 'career', title: 'Education & career', icon: 'briefcase', rows: career });
  }

  /* -------- Location --------
     City, state and country only. `pincode`, `latitude` and `longitude` are in
     HIDDEN_FIELDS: they narrow a member to a street or a rooftop. */
  const location = compactRows([
    row('City', profile.city),
    row('State', profile.state),
    row('Country', profile.country),
  ]);
  if (location.length > 0) {
    sections.push({ id: 'location', title: 'Where they live', icon: 'pin', rows: location });
  }

  /* -------- Community & background -------- */
  const background = compactRows([
    row('Religion', profile.religion),
    row('Mother tongue', profile.mother_tongue),
    row('Caste', profile.caste),
    row('Sub-caste', profile.sub_caste),
    row('Gotra', profile.gotra),
  ]);
  if (background.length > 0 || profile.languages_known?.length) {
    sections.push({
      id: 'background',
      title: 'Community & background',
      icon: 'globe',
      rows: background,
      tags: profile.languages_known ?? undefined,
    });
  }

  /* -------- Family -------- */
  const family = compactRows([
    row('Family type', profile.family_type ? labelOf(FAMILY_TYPE_LABELS, profile.family_type) : null),
    row(
      'Family background',
      profile.family_status ? labelOf(FAMILY_STATUS_LABELS, profile.family_status) : null,
    ),
    row("Father's occupation", profile.father_occupation),
    row("Mother's occupation", profile.mother_occupation),
    row('Brothers', profile.number_of_brothers),
    row('Sisters', profile.number_of_sisters),
  ]);
  if (family.length > 0 || profile.family_details?.trim()) {
    sections.push({
      id: 'family',
      title: 'Family',
      icon: 'users',
      rows: family,
      prose: profile.family_details?.trim() || undefined,
    });
  }

  /* -------- Lifestyle -------- */
  const lifestyle = compactRows([
    row('Diet', profile.diet ? labelOf(DIET_LABELS, profile.diet) : null),
    row('Smoking', profile.smoking ? labelOf(HABIT_LABELS, profile.smoking) : null),
    row('Drinking', profile.drinking ? labelOf(HABIT_LABELS, profile.drinking) : null),
  ]);
  if (lifestyle.length > 0 || profile.hobbies?.length) {
    sections.push({
      id: 'lifestyle',
      title: 'Lifestyle',
      icon: 'utensils',
      rows: lifestyle,
      tags: profile.hobbies ?? undefined,
    });
  }

  /* -------- Community-specific --------
     Presented in exactly the same card, with the same neutral styling, as every
     section above. No warning colours, no medical framing. The member's own
     description leads; `disability_percentage` is never shown (see the file
     header for why). */
  if (category === 'physically_challenged') {
    const rows = compactRows([
      row('Type', profile.disability_type ? labelOf(DISABILITY_TYPE_LABELS, profile.disability_type) : null),
      row('Uses a wheelchair', yesNo(profile.uses_wheelchair)),
      row('Uses a prosthesis', yesNo(profile.uses_prosthetics)),
    ]);
    if (rows.length > 0 || profile.disability_description?.trim()) {
      sections.push({
        id: 'accessibility',
        title: 'What they would like you to know',
        icon: 'accessibility',
        rows,
        prose: profile.disability_description?.trim() || undefined,
      });
    }
  }

  if (category === 'hearing_speech_impaired') {
    const rows = compactRows([
      row(
        'Hearing',
        profile.hearing_condition ? labelOf(HEARING_CONDITION_LABELS, profile.hearing_condition) : null,
      ),
      row(
        'Speech',
        profile.speech_condition ? labelOf(SPEECH_CONDITION_LABELS, profile.speech_condition) : null,
      ),
      row('Uses a hearing aid', yesNo(profile.uses_hearing_aid)),
      row('Uses sign language', yesNo(profile.knows_sign_language)),
      row('Prefers to communicate by', profile.preferred_communication_method),
    ]);
    if (rows.length > 0) {
      sections.push({
        id: 'communication',
        title: 'How to communicate',
        icon: 'hand',
        rows,
      });
    }
  }

  if (category === 'vitiligo_skin_condition') {
    const rows = compactRows([
      row(
        'Condition',
        profile.skin_condition ? labelOf(SKIN_CONDITION_LABELS, profile.skin_condition) : null,
      ),
      row(
        'Coverage',
        profile.vitiligo_coverage ? labelOf(VITILIGO_COVERAGE_LABELS, profile.vitiligo_coverage) : null,
      ),
      row('Areas', profile.vitiligo_affected_areas),
      row('Stable', yesNo(profile.vitiligo_stable)),
    ]);
    if (rows.length > 0) {
      sections.push({
        id: 'skin',
        title: 'What they would like you to know',
        icon: 'sparkle',
        rows,
      });
    }
  }

  /* -------- What they are looking for -------- */
  if (profile.partner_preferences_text?.trim()) {
    sections.push({
      id: 'looking-for',
      title: 'What they are looking for',
      icon: 'heart',
      rows: [],
      prose: profile.partner_preferences_text.trim(),
    });
  }

  return sections;
}
