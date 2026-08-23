'use client';

/**
 * Review step.
 *
 * Shows what was actually entered, grouped by the step it came from, with a jump
 * link back to each. Empty fields are shown as "Not added" rather than hidden —
 * the point of a review screen is to reveal the gaps, and silently omitting them
 * defeats it.
 *
 * The community-details block only appears for the community it belongs to, so a
 * general-community member is never shown an empty disability section.
 */

import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Alert } from '../ui/feedback';
import { formatHeight } from '../../lib/format';
import {
  BODY_TYPE_LABELS,
  CHILDREN_LIVING_LABELS,
  COMPLEXION_LABELS,
  DIET_LABELS,
  DISABILITY_TYPE_LABELS,
  EMPLOYED_IN_LABELS,
  FAMILY_STATUS_LABELS,
  FAMILY_TYPE_LABELS,
  GENDER_LABELS,
  HABIT_LABELS,
  HEARING_CONDITION_LABELS,
  MARITAL_STATUS_LABELS,
  PROFILE_CATEGORY_LABELS,
  SKIN_CONDITION_LABELS,
  SPEECH_CONDITION_LABELS,
  VITILIGO_COVERAGE_LABELS,
  labelOf,
} from '../../lib/enums';
import type { OnboardingDraft } from '../../lib/onboarding/draft';
import styles from './wizard.module.css';

interface Row {
  key: string;
  value: string | null;
}

function Section({
  title,
  step,
  rows,
  onEditStep,
}: {
  title: string;
  step: number;
  rows: Row[];
  onEditStep: (step: number) => void;
}) {
  return (
    <div className={styles.reviewCard}>
      <div className={styles.reviewHead}>
        <h3 className={styles.reviewTitle}>{title}</h3>
        <Button variant="ghost" size="sm" icon="edit" onClick={() => onEditStep(step)}>
          Edit
        </Button>
      </div>
      <dl className={styles.reviewList}>
        {rows.map((row) => (
          <div key={row.key} className={styles.reviewRow}>
            <dt className={styles.reviewKey}>{row.key}</dt>
            <dd className={[styles.reviewValue, row.value ? '' : styles.reviewEmpty].join(' ')}>
              {row.value || 'Not added'}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** Empty strings and empty arrays become null so they render as "Not added". */
const val = (input: string | number | null | undefined): string | null => {
  if (input === null || input === undefined) return null;
  const text = String(input).trim();
  return text === '' ? null : text;
};

const list = (input: string[]): string | null => (input.length > 0 ? input.join(', ') : null);

export function ReviewStep({
  draft,
  onEditStep,
}: {
  draft: OnboardingDraft;
  onEditStep: (step: number) => void;
}) {
  const communityRows: Row[] = (() => {
    switch (draft.profile_category) {
      case 'physically_challenged':
        return [
          {
            key: 'Type',
            value: draft.disability_type ? labelOf(DISABILITY_TYPE_LABELS, draft.disability_type) : null,
          },
          { key: 'Percentage', value: val(draft.disability_percentage) },
          { key: 'Uses a wheelchair', value: draft.uses_wheelchair ? 'Yes' : 'No' },
          { key: 'Uses a prosthesis', value: draft.uses_prosthetics ? 'Yes' : 'No' },
          { key: 'In your words', value: val(draft.disability_description) },
          { key: 'UDID number', value: draft.udid_certificate_number ? 'Added (reviewers only)' : null },
        ];
      case 'hearing_speech_impaired':
        return [
          {
            key: 'Hearing',
            value: draft.hearing_condition
              ? labelOf(HEARING_CONDITION_LABELS, draft.hearing_condition)
              : null,
          },
          {
            key: 'Speech',
            value: draft.speech_condition ? labelOf(SPEECH_CONDITION_LABELS, draft.speech_condition) : null,
          },
          { key: 'Uses a hearing aid', value: draft.uses_hearing_aid ? 'Yes' : 'No' },
          { key: 'Uses sign language', value: draft.knows_sign_language ? 'Yes' : 'No' },
          { key: 'Prefers to communicate by', value: val(draft.preferred_communication_method) },
        ];
      case 'vitiligo_skin_condition':
        return [
          {
            key: 'Condition',
            value: draft.skin_condition ? labelOf(SKIN_CONDITION_LABELS, draft.skin_condition) : null,
          },
          {
            key: 'Coverage',
            value: draft.vitiligo_coverage
              ? labelOf(VITILIGO_COVERAGE_LABELS, draft.vitiligo_coverage)
              : null,
          },
          { key: 'Areas', value: val(draft.vitiligo_affected_areas) },
          {
            key: 'Stable',
            value: draft.vitiligo_stable === null ? null : draft.vitiligo_stable ? 'Stable' : 'Changing',
          },
        ];
      default:
        return [];
    }
  })();

  return (
    <>
      <Alert tone="info" title="What happens after you submit">
        A person on our team reviews your profile — usually within a day. You can keep editing it in the
        meantime, and you will be able to browse straight away.
      </Alert>

      <div className={styles.reviewGrid}>
        <Section
          title="Your account"
          step={1}
          onEditStep={onEditStep}
          rows={[
            { key: 'Name', value: val(draft.name) },
            {
              key: 'Community',
              value: draft.profile_category ? PROFILE_CATEGORY_LABELS[draft.profile_category] : null,
            },
            { key: 'I am', value: draft.gender ? GENDER_LABELS[draft.gender] : null },
            { key: 'Date of birth', value: val(draft.date_of_birth) },
            { key: 'Mobile', value: draft.phone ? `+91 ${draft.phone}` : null },
            { key: 'Email', value: val(draft.email) },
          ]}
        />

        <Section
          title="Personal"
          step={2}
          onEditStep={onEditStep}
          rows={[
            {
              key: 'Marital status',
              value: draft.marital_status ? labelOf(MARITAL_STATUS_LABELS, draft.marital_status) : null,
            },
            { key: 'Children', value: val(draft.number_of_children) },
            {
              key: 'Living arrangement',
              value: draft.children_living_status
                ? labelOf(CHILDREN_LIVING_LABELS, draft.children_living_status)
                : null,
            },
            { key: 'Height', value: draft.height_cm ? formatHeight(draft.height_cm) : null },
            { key: 'Weight', value: draft.weight_kg ? `${draft.weight_kg} kg` : null },
            { key: 'Body type', value: draft.body_type ? labelOf(BODY_TYPE_LABELS, draft.body_type) : null },
            {
              key: 'Complexion',
              value: draft.complexion ? labelOf(COMPLEXION_LABELS, draft.complexion) : null,
            },
            { key: 'Blood group', value: val(draft.blood_group) },
          ]}
        />

        <Section
          title="Community and background"
          step={3}
          onEditStep={onEditStep}
          rows={[
            { key: 'Religion', value: val(draft.religion) },
            { key: 'Mother tongue', value: val(draft.mother_tongue) },
            { key: 'Caste', value: val(draft.caste) },
            { key: 'Sub-caste', value: val(draft.sub_caste) },
            { key: 'Gotra', value: val(draft.gotra) },
            { key: 'Languages', value: list(draft.languages_known) },
          ]}
        />

        <Section
          title="Education and work"
          step={4}
          onEditStep={onEditStep}
          rows={[
            { key: 'Qualification', value: val(draft.highest_education) },
            { key: 'Field of study', value: val(draft.education_field) },
            { key: 'Institution', value: val(draft.education_institution) },
            {
              key: 'Works in',
              value: draft.employed_in ? labelOf(EMPLOYED_IN_LABELS, draft.employed_in) : null,
            },
            { key: 'Role', value: val(draft.occupation) },
            { key: 'Organisation', value: val(draft.company_name) },
            { key: 'Income', value: val(draft.annual_income_range) },
          ]}
        />

        <Section
          title="Location and family"
          step={5}
          onEditStep={onEditStep}
          rows={[
            { key: 'City', value: val(draft.city) },
            { key: 'State', value: val(draft.state) },
            { key: 'Country', value: val(draft.country) },
            {
              key: 'Family type',
              value: draft.family_type ? labelOf(FAMILY_TYPE_LABELS, draft.family_type) : null,
            },
            {
              key: 'Family background',
              value: draft.family_status ? labelOf(FAMILY_STATUS_LABELS, draft.family_status) : null,
            },
            { key: "Father's occupation", value: val(draft.father_occupation) },
            { key: "Mother's occupation", value: val(draft.mother_occupation) },
            {
              key: 'Siblings',
              value:
                draft.number_of_brothers || draft.number_of_sisters
                  ? `${draft.number_of_brothers || 0} brother(s), ${draft.number_of_sisters || 0} sister(s)`
                  : null,
            },
          ]}
        />

        <Section
          title="Lifestyle and about you"
          step={6}
          onEditStep={onEditStep}
          rows={[
            { key: 'Diet', value: draft.diet ? labelOf(DIET_LABELS, draft.diet) : null },
            { key: 'Smoking', value: draft.smoking ? labelOf(HABIT_LABELS, draft.smoking) : null },
            { key: 'Drinking', value: draft.drinking ? labelOf(HABIT_LABELS, draft.drinking) : null },
            { key: 'Interests', value: list(draft.hobbies) },
            { key: 'About you', value: val(draft.about_me) },
          ]}
        />

        {/* Only rendered for the community it belongs to. */}
        {communityRows.length > 0 && (
          <Section title="What someone should know" step={7} onEditStep={onEditStep} rows={communityRows} />
        )}

        <Section
          title="What you're looking for"
          step={8}
          onEditStep={onEditStep}
          rows={[
            { key: 'Age range', value: `${draft.pref_min_age}–${draft.pref_max_age}` },
            {
              key: 'Height range',
              value: `${formatHeight(draft.pref_min_height_cm)} – ${formatHeight(draft.pref_max_height_cm)}`,
            },
            {
              key: 'Communities',
              value: list(draft.pref_categories.map((category) => PROFILE_CATEGORY_LABELS[category])),
            },
            { key: 'States', value: list(draft.pref_states) },
            { key: 'Religion', value: list(draft.pref_religions) },
            { key: 'Education', value: list(draft.pref_education) },
            {
              key: 'Marital status',
              value: list(draft.pref_marital_status.map((status) => labelOf(MARITAL_STATUS_LABELS, status))),
            },
            { key: 'Diet', value: list(draft.pref_diet.map((diet) => labelOf(DIET_LABELS, diet))) },
            { key: 'In your words', value: val(draft.pref_about_partner) },
          ]}
        />
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge tone="verified" icon="lock">
          Your contact details stay masked
        </Badge>
        <Badge tone="verified" icon="eye-off">
          Photos blurred by default
        </Badge>
      </div>
    </>
  );
}
