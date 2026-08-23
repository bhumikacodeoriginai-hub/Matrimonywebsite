'use client';

/**
 * The ten onboarding step bodies.
 *
 * Each is a presentational component over the shared draft: it receives the draft,
 * a patch function and the current field errors, and renders fields. All
 * orchestration — saving, navigation, validation timing — lives in
 * registration-wizard.tsx.
 *
 * DESIGN RULE THAT SHAPES EVERY STEP AFTER THE FIRST
 * Only step 1 has required fields, because only step 1 is needed to create an
 * account. Everything else is optional and skippable. A member who does not want
 * to state their caste, income, complexion or disability percentage must still be
 * able to finish and be findable. That is why every later step has a working
 * "Skip for now" and why nothing is marked required.
 */

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox, OptionCardGroup, Segmented, Switch } from '../ui/choice';
import { FieldRow, SelectField, TextArea, TextField } from '../ui/field';
import { RangeSlider, SingleRange } from '../ui/range';
import { SearchableCheckList, TagInput } from '../ui/select-list';
import { OtpInput } from '../ui/otp-input';
import { Alert, Note } from '../ui/feedback';
import { Icon } from '../ui/icon';
import { authRoute } from '../../lib/api/bff';
import { ApiError, friendlyMessage } from '../../lib/api/client';
import { useCountdown } from '../../lib/hooks/use-countdown';
import { formatHeight, formatPhone } from '../../lib/format';
import {
  AGE_RANGE,
  BLOOD_GROUPS,
  BODY_TYPE_LABELS,
  CASTE_SUGGESTIONS,
  CHILDREN_LIVING_LABELS,
  COMMUNICATION_METHODS,
  COMPLEXION_LABELS,
  DIET_LABELS,
  DISABILITY_TYPE_LABELS,
  EDUCATION_LEVELS,
  EMPLOYED_IN_LABELS,
  FAMILY_STATUS_LABELS,
  FAMILY_TYPE_LABELS,
  HABIT_LABELS,
  HEARING_CONDITION_LABELS,
  HEIGHT_RANGE_CM,
  HOBBY_SUGGESTIONS,
  INCOME_RANGES,
  INDIAN_STATES,
  LANGUAGE_SUGGESTIONS,
  MARITAL_STATUS_LABELS,
  MOTHER_TONGUES,
  PROFILE_CATEGORY_DESCRIPTIONS,
  PROFILE_CATEGORY_LABELS,
  RELIGIONS,
  SKIN_CONDITION_LABELS,
  SPEECH_CONDITION_LABELS,
  VITILIGO_COVERAGE_LABELS,
  optionsOf,
} from '../../lib/enums';
import type {
  BloodGroup,
  BodyType,
  ChildrenLivingStatus,
  Complexion,
  Diet,
  DisabilityType,
  EmployedIn,
  FamilyStatus,
  FamilyType,
  Gender,
  Habit,
  HearingCondition,
  MaritalStatus,
  ProfileCategory,
  SkinCondition,
  SpeechCondition,
  VitiligoCoverage,
} from '../../lib/api/types';
import type { OnboardingDraft, StepErrors } from '../../lib/onboarding/draft';
import styles from './wizard.module.css';

export interface StepProps {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  errors: StepErrors;
}

/** Turns a string list into select options. */
const toOptions = (values: readonly string[]) => values.map((value) => ({ value, label: value }));

/* ==========================================================================
   Step 1 — Your account
   ========================================================================== */

const CATEGORY_ORDER: ProfileCategory[] = [
  'general',
  'physically_challenged',
  'hearing_speech_impaired',
  'vitiligo_skin_condition',
];

export interface AccountStepProps extends StepProps {
  password: string;
  setPassword: (value: string) => void;
}

/**
 * Inline mobile verification.
 *
 * Worth doing even though the server marks `phone_verified_at` automatically on
 * register: without a code, anyone could sign up using someone else's number. It
 * also catches "this number already has an account" earlier and far more kindly
 * than Laravel's `unique:users` 422 would.
 */
function PhoneVerifyField({ draft, update, errors }: StepProps) {
  const [stage, setStage] = useState<'idle' | 'code'>('idle');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingAccount, setExistingAccount] = useState(false);
  const { secondsLeft, start, stop } = useCountdown();

  const digits = draft.phone.replace(/\D/g, '');
  const phoneLooksValid = /^[6-9]\d{9}$/.test(digits);

  const send = useCallback(
    async (isResend = false) => {
      setError(null);
      if (isResend) setResending(true);
      else setPending(true);
      try {
        await authRoute('/send-otp', { method: 'POST', body: { phone: digits } });
        setStage('code');
        setCode('');
        start(45);
      } catch (caught) {
        setError(friendlyMessage(caught));
      } finally {
        setPending(false);
        setResending(false);
      }
    },
    [digits, start],
  );

  const verify = useCallback(
    async (value: string) => {
      setError(null);
      setPending(true);
      try {
        const result = await authRoute<{ is_new_user?: boolean }>('/verify-otp', {
          method: 'POST',
          body: { phone: digits, otp: value },
        });

        // A token means this number ALREADY has an account — the verify route
        // signed them in. Say so instead of failing later on `unique:users`.
        if (result.is_new_user === false) {
          setExistingAccount(true);
          stop();
          return;
        }

        update({ phoneVerified: true });
        stop();
      } catch (caught) {
        setError(caught instanceof ApiError ? friendlyMessage(caught) : 'That code did not match.');
        setCode('');
      } finally {
        setPending(false);
      }
    },
    [digits, stop, update],
  );

  if (existingAccount) {
    return (
      <Alert tone="info" title="This number already has an account">
        We signed you in. Head to your dashboard, or <Link href="/login">use a different number</Link> to
        create a second profile.
      </Alert>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      <TextField
        label="Mobile number"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        prefix="+91"
        value={draft.phone}
        onChange={(value) => {
          update({ phone: value, phoneVerified: false });
          setStage('idle');
        }}
        error={errors.phone}
        help="We text a 6-digit code to confirm the number is yours."
        required
        disabled={draft.phoneVerified}
        maxLength={14}
      />

      {draft.phoneVerified ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Badge tone="verified" icon="check-circle">
            Mobile verified
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => update({ phoneVerified: false, phone: '' })}>
            Use a different number
          </Button>
        </div>
      ) : stage === 'idle' ? (
        <Button
          variant="secondary"
          onClick={() => void send()}
          loading={pending}
          disabled={!phoneLooksValid}
          icon="message"
        >
          Send verification code
        </Button>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          <Note icon="message">Code sent to +91 {formatPhone(digits)}</Note>
          <OtpInput
            value={code}
            onChange={setCode}
            onComplete={(value) => void verify(value)}
            sentTo={`+91 ${formatPhone(digits)}`}
            error={error ?? undefined}
            disabled={pending}
            secondsLeft={secondsLeft}
            onResend={() => void send(true)}
            resendPending={resending}
            autoFocus
          />
        </div>
      )}

      {error && !stage.includes('code') && <Alert tone="error">{error}</Alert>}
    </div>
  );
}

export function AccountStep({ draft, update, errors, password, setPassword }: AccountStepProps) {
  return (
    <>
      <div className={styles.group}>
        <OptionCardGroup<ProfileCategory>
          legend="Which community fits you?"
          help="This decides which optional fields you can fill in later. Every community gets the same search, the same privacy controls and the same review process."
          options={CATEGORY_ORDER.map((category) => ({
            value: category,
            title: PROFILE_CATEGORY_LABELS[category],
            description: PROFILE_CATEGORY_DESCRIPTIONS[category],
            icon:
              category === 'general'
                ? 'users'
                : category === 'physically_challenged'
                  ? 'accessibility'
                  : category === 'hearing_speech_impaired'
                    ? 'hand'
                    : 'sparkle',
          }))}
          value={draft.profile_category}
          onChange={(value) => update({ profile_category: value })}
          error={errors.profile_category}
          minWidth={240}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>About you</h3>

        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          value={draft.name}
          onChange={(value) => update({ name: value })}
          error={errors.name}
          help="As you would like it to appear on your profile."
          required
          maxLength={100}
        />

        <OptionCardGroup<Gender>
          legend="I am"
          options={[
            { value: 'female', title: 'A woman' },
            { value: 'male', title: 'A man' },
            { value: 'other', title: 'Non-binary' },
          ]}
          value={draft.gender}
          onChange={(value) => update({ gender: value })}
          error={errors.gender}
          minWidth={150}
        />

        <TextField
          label="Date of birth"
          name="date_of_birth"
          type="date"
          autoComplete="bday"
          value={draft.date_of_birth}
          onChange={(value) => update({ date_of_birth: value })}
          error={errors.date_of_birth}
          help="You must be 18 or older. Only your age is shown, never the date."
          required
          max={new Date().toISOString().slice(0, 10)}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>How you sign in</h3>

        <PhoneVerifyField draft={draft} update={update} errors={errors} />

        <TextField
          label="Email address (optional)"
          name="email"
          type="email"
          autoComplete="email"
          icon="mail"
          value={draft.email}
          onChange={(value) => update({ email: value })}
          error={errors.email}
          help="Useful for account recovery. Never shown to other members."
        />

        <TextField
          label="Create a password"
          name="password"
          type="password"
          autoComplete="new-password"
          icon="lock"
          revealable
          value={password}
          onChange={setPassword}
          error={errors.password}
          help="At least 6 characters. You can also always sign in with a one-time code instead."
          required
          minLength={6}
        />

        <Checkbox
          label={
            <>
              I am 18 or older and I agree to the <Link href="/terms">terms of use</Link> and{' '}
              <Link href="/privacy">privacy policy</Link>.
            </>
          }
          checked={draft.acceptedTerms}
          onChange={(checked) => update({ acceptedTerms: checked })}
          error={errors.acceptedTerms}
          required
        />
      </div>
    </>
  );
}

/* ==========================================================================
   Step 2 — Personal information
   ========================================================================== */

export function PersonalStep({ draft, update }: StepProps) {
  const showChildren = draft.marital_status !== null && draft.marital_status !== 'never_married';

  return (
    <>
      <div className={styles.group}>
        <OptionCardGroup<MaritalStatus>
          legend="Marital status"
          options={optionsOf(MARITAL_STATUS_LABELS).map((option) => ({
            value: option.value,
            title: option.label,
          }))}
          value={draft.marital_status}
          onChange={(value) => update({ marital_status: value })}
          minWidth={160}
        />

        {/* Only asked when it can apply — a "children" question after "never
            married" is noise at best. */}
        {showChildren && (
          <FieldRow>
            <TextField
              label="Number of children"
              name="number_of_children"
              type="number"
              inputMode="numeric"
              min={0}
              max={10}
              value={draft.number_of_children}
              onChange={(value) => update({ number_of_children: value })}
            />
            <SelectField
              label="They live"
              name="children_living_status"
              options={optionsOf(CHILDREN_LIVING_LABELS)}
              value={draft.children_living_status ?? ''}
              onChange={(value) =>
                update({ children_living_status: (value || null) as ChildrenLivingStatus })
              }
            />
          </FieldRow>
        )}
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Physical details</h3>
        <p className={styles.groupHint}>
          Height is a common search filter, so it is worth filling in. Everything else here is optional.
        </p>

        <SingleRange
          label="Height"
          min={HEIGHT_RANGE_CM.min}
          max={HEIGHT_RANGE_CM.max}
          value={draft.height_cm ?? 165}
          onChange={(value) => update({ height_cm: value })}
          format={(value) => formatHeight(value) ?? `${value} cm`}
        />

        <FieldRow>
          <TextField
            label="Weight in kg (optional)"
            name="weight_kg"
            type="number"
            inputMode="numeric"
            min={30}
            max={200}
            value={draft.weight_kg}
            onChange={(value) => update({ weight_kg: value })}
          />
          <SelectField
            label="Body type (optional)"
            name="body_type"
            options={optionsOf(BODY_TYPE_LABELS)}
            value={draft.body_type ?? ''}
            onChange={(value) => update({ body_type: (value || null) as BodyType })}
          />
        </FieldRow>

        <FieldRow>
          {/*
            Complexion exists as a column so it is offered, but it is never a
            search filter and never a badge anywhere in this product. See the note
            in lib/enums.ts.
          */}
          <SelectField
            label="Complexion (optional)"
            name="complexion"
            options={optionsOf(COMPLEXION_LABELS)}
            value={draft.complexion ?? ''}
            onChange={(value) => update({ complexion: (value || null) as Complexion })}
            help="Self-described. Not used to filter or rank anyone."
          />
          <SelectField
            label="Blood group (optional)"
            name="blood_group"
            options={BLOOD_GROUPS.map((group) => ({ value: group, label: group }))}
            value={draft.blood_group ?? ''}
            onChange={(value) => update({ blood_group: (value || null) as BloodGroup })}
          />
        </FieldRow>
      </div>
    </>
  );
}

/* ==========================================================================
   Step 3 — Community & background
   ========================================================================== */

export function BackgroundStep({ draft, update }: StepProps) {
  return (
    <>
      <div className={styles.group}>
        <FieldRow>
          <SelectField
            label="Religion"
            name="religion"
            options={toOptions(RELIGIONS)}
            value={draft.religion}
            onChange={(value) => update({ religion: value })}
          />
          <SelectField
            label="Mother tongue"
            name="mother_tongue"
            options={toOptions(MOTHER_TONGUES)}
            value={draft.mother_tongue}
            onChange={(value) => update({ mother_tongue: value })}
          />
        </FieldRow>

        {/*
          Caste is a free-text field with suggestions, not a required dropdown, and
          it is never used to score or rank a match anywhere in this product.
        */}
        <FieldRow>
          <TextField
            label="Caste (optional)"
            name="caste"
            value={draft.caste}
            onChange={(value) => update({ caste: value })}
            help="Optional. Never used to rank or score matches."
            list="caste-suggestions"
          />
          <TextField
            label="Sub-caste (optional)"
            name="sub_caste"
            value={draft.sub_caste}
            onChange={(value) => update({ sub_caste: value })}
          />
        </FieldRow>

        {/* Native datalist: suggestions without taking away free text. */}
        <datalist id="caste-suggestions">
          {CASTE_SUGGESTIONS.map((caste) => (
            <option key={caste} value={caste} />
          ))}
        </datalist>

        <TextField
          label="Gotra (optional)"
          name="gotra"
          value={draft.gotra}
          onChange={(value) => update({ gotra: value })}
        />
      </div>

      <div className={styles.group}>
        <TagInput
          label="Languages you speak"
          help="Add as many as you like. Sign language counts."
          value={draft.languages_known}
          onChange={(value) => update({ languages_known: value })}
          suggestions={LANGUAGE_SUGGESTIONS}
          maxTags={8}
        />
      </div>
    </>
  );
}

/* ==========================================================================
   Step 4 — Education & career
   ========================================================================== */

export function CareerStep({ draft, update }: StepProps) {
  return (
    <>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Education</h3>
        <SelectField
          label="Highest qualification"
          name="highest_education"
          options={toOptions(EDUCATION_LEVELS)}
          value={draft.highest_education}
          onChange={(value) => update({ highest_education: value })}
          icon="graduation"
        />
        <FieldRow>
          <TextField
            label="Field of study (optional)"
            name="education_field"
            value={draft.education_field}
            onChange={(value) => update({ education_field: value })}
          />
          <TextField
            label="College or university (optional)"
            name="education_institution"
            value={draft.education_institution}
            onChange={(value) => update({ education_institution: value })}
          />
        </FieldRow>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Work</h3>
        <SelectField
          label="I work in"
          name="employed_in"
          options={optionsOf(EMPLOYED_IN_LABELS)}
          value={draft.employed_in ?? ''}
          onChange={(value) => update({ employed_in: (value || null) as EmployedIn })}
          icon="briefcase"
        />
        <FieldRow>
          <TextField
            label="Your role (optional)"
            name="occupation"
            value={draft.occupation}
            onChange={(value) => update({ occupation: value })}
          />
          <TextField
            label="Organisation (optional)"
            name="company_name"
            value={draft.company_name}
            onChange={(value) => update({ company_name: value })}
          />
        </FieldRow>
        <SelectField
          label="Annual income (optional)"
          name="annual_income_range"
          options={toOptions(INCOME_RANGES)}
          value={draft.annual_income_range}
          onChange={(value) => update({ annual_income_range: value })}
          help="A range, never an exact figure. You can choose to leave this out."
        />
      </div>
    </>
  );
}

/* ==========================================================================
   Step 5 — Where you live & family
   ========================================================================== */

export function LocationStep({ draft, update }: StepProps) {
  return (
    <>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Where you live</h3>
        <p className={styles.groupHint}>
          Location is used by search and by your match scores, so this is one of the more useful fields to
          fill in. Only your city and state are ever shown — never a precise address.
        </p>

        <FieldRow>
          <SelectField
            label="State"
            name="state"
            options={toOptions(INDIAN_STATES)}
            value={draft.state}
            onChange={(value) => update({ state: value })}
            icon="pin"
          />
          <TextField
            label="City"
            name="city"
            autoComplete="address-level2"
            value={draft.city}
            onChange={(value) => update({ city: value })}
          />
        </FieldRow>

        <FieldRow>
          <TextField
            label="Country"
            name="country"
            autoComplete="country-name"
            value={draft.country}
            onChange={(value) => update({ country: value })}
          />
          <TextField
            label="PIN code (optional)"
            name="pincode"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={6}
            value={draft.pincode}
            onChange={(value) => update({ pincode: value })}
            help="Never shown to members."
          />
        </FieldRow>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Your family</h3>
        <FieldRow>
          <SelectField
            label="Family type"
            name="family_type"
            options={optionsOf(FAMILY_TYPE_LABELS)}
            value={draft.family_type ?? ''}
            onChange={(value) => update({ family_type: (value || null) as FamilyType })}
          />
          <SelectField
            label="Family background"
            name="family_status"
            options={optionsOf(FAMILY_STATUS_LABELS)}
            value={draft.family_status ?? ''}
            onChange={(value) => update({ family_status: (value || null) as FamilyStatus })}
          />
        </FieldRow>
        <FieldRow>
          <TextField
            label="Father's occupation (optional)"
            name="father_occupation"
            value={draft.father_occupation}
            onChange={(value) => update({ father_occupation: value })}
          />
          <TextField
            label="Mother's occupation (optional)"
            name="mother_occupation"
            value={draft.mother_occupation}
            onChange={(value) => update({ mother_occupation: value })}
          />
        </FieldRow>
        <FieldRow>
          <TextField
            label="Brothers"
            name="number_of_brothers"
            type="number"
            inputMode="numeric"
            min={0}
            max={15}
            value={draft.number_of_brothers}
            onChange={(value) => update({ number_of_brothers: value })}
          />
          <TextField
            label="Sisters"
            name="number_of_sisters"
            type="number"
            inputMode="numeric"
            min={0}
            max={15}
            value={draft.number_of_sisters}
            onChange={(value) => update({ number_of_sisters: value })}
          />
        </FieldRow>
      </div>
    </>
  );
}

/* ==========================================================================
   Step 6 — Lifestyle & about you
   ========================================================================== */

export function LifestyleStep({ draft, update }: StepProps) {
  return (
    <>
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>Everyday life</h3>
        <SelectField
          label="Diet"
          name="diet"
          options={optionsOf(DIET_LABELS)}
          value={draft.diet ?? ''}
          onChange={(value) => update({ diet: (value || null) as Diet })}
          icon="utensils"
        />
        <FieldRow>
          <SelectField
            label="Smoking"
            name="smoking"
            options={optionsOf(HABIT_LABELS)}
            value={draft.smoking ?? ''}
            onChange={(value) => update({ smoking: (value || null) as Habit })}
          />
          <SelectField
            label="Drinking"
            name="drinking"
            options={optionsOf(HABIT_LABELS)}
            value={draft.drinking ?? ''}
            onChange={(value) => update({ drinking: (value || null) as Habit })}
          />
        </FieldRow>
      </div>

      <div className={styles.group}>
        <TagInput
          label="Things you enjoy"
          help="Gives someone a specific way to start a conversation with you."
          value={draft.hobbies}
          onChange={(value) => update({ hobbies: value })}
          suggestions={HOBBY_SUGGESTIONS}
        />
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupTitle}>In your own words</h3>
        <p className={styles.groupHint}>
          This is the most-read part of any profile. A few honest sentences work far better than a list of
          adjectives.
        </p>
        <TextArea
          label="About you"
          name="about_me"
          value={draft.about_me}
          onChange={(value) => update({ about_me: value })}
          maxLength={1200}
          rows={6}
          help="What your days look like, what matters to you, what you are hoping to find."
        />
      </div>
    </>
  );
}

/* ==========================================================================
   Step 7 — Community details
   ==========================================================================
   Disability, hearing, speech and skin fields.

   Presentation rules, applied deliberately:
     • Identical visual treatment to every other step. Same card, same spacing,
       same neutral colours. No warning tones, no medical iconography.
     • Every field optional, and stated as optional.
     • A privacy explainer FIRST, because this is where members most reasonably
       want to know the handling before typing.
     • Framed as "what someone should know about you", not "what is wrong".
   ========================================================================== */

function PrivacyExplainer({ items }: { items: string[] }) {
  return (
    <div className={styles.privacyExplainer}>
      <p className={styles.privacyExplainerHead}>
        <Icon name="lock" />
        Before you fill this in
      </p>
      <ul className={styles.privacyExplainerList}>
        {items.map((item) => (
          <li key={item}>
            <span className={styles.privacyExplainerIcon} aria-hidden="true">
              <Icon name="check" />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function InclusiveStep({ draft, update }: StepProps) {
  if (draft.profile_category === 'physically_challenged') {
    return (
      <>
        <PrivacyExplainer
          items={[
            'Every field here is optional. You can finish your profile without answering any of them.',
            'You choose what appears on your profile. Nothing here is shown as a warning or a label.',
            'If you add a UDID number, only our review team ever sees it. It is never shown to members.',
            'None of these fields affect where you appear in search unless someone has actively filtered for them.',
          ]}
        />

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>What someone should know</h3>
          <SelectField
            label="Type (optional)"
            name="disability_type"
            options={optionsOf(DISABILITY_TYPE_LABELS)}
            value={draft.disability_type ?? ''}
            onChange={(value) => update({ disability_type: (value || null) as DisabilityType })}
          />
          <TextField
            label="Percentage as certified (optional)"
            name="disability_percentage"
            type="number"
            inputMode="numeric"
            min={0}
            max={100}
            value={draft.disability_percentage}
            onChange={(value) => update({ disability_percentage: value })}
            help="Only if you have a certificate that states one. Leave blank otherwise."
          />

          <Switch
            label="I use a wheelchair"
            checked={draft.uses_wheelchair}
            onChange={(checked) => update({ uses_wheelchair: checked })}
          />
          <Switch
            label="I use a prosthesis"
            checked={draft.uses_prosthetics}
            onChange={(checked) => update({ uses_prosthetics: checked })}
          />

          <TextArea
            label="In your own words (optional)"
            name="disability_description"
            value={draft.disability_description}
            onChange={(value) => update({ disability_description: value })}
            maxLength={600}
            rows={4}
            help="Many members find this the most useful field on the whole profile — it replaces a dozen awkward first questions."
          />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>UDID verification (optional)</h3>
          <p className={styles.groupHint}>
            Adding your UDID number lets our team verify it and add a badge to your profile. The number and
            any document are visible only to reviewers, never to other members. You can skip this and add it
            later.
          </p>
          <TextField
            label="UDID number (optional)"
            name="udid_certificate_number"
            value={draft.udid_certificate_number}
            onChange={(value) => update({ udid_certificate_number: value })}
            icon="shield-check"
          />
          {/*
            Document upload is intentionally NOT here. The only upload endpoint the
            API exposes is for profile photos; there is no route that accepts a UDID
            document. Offering a file picker that silently discarded the file would
            be worse than telling the truth.
          */}
          <Note icon="info">
            Document upload is not available in the app yet. Once you save a number, our team will contact you
            about verifying it.
          </Note>
        </div>
      </>
    );
  }

  if (draft.profile_category === 'hearing_speech_impaired') {
    return (
      <>
        <PrivacyExplainer
          items={[
            'Every field here is optional.',
            'How you prefer to communicate is genuinely useful to share — it tells someone how to start.',
            'Nothing here is shown as a warning or a label on your profile.',
          ]}
        />

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>Hearing and speech</h3>
          <FieldRow>
            <SelectField
              label="Hearing (optional)"
              name="hearing_condition"
              options={optionsOf(HEARING_CONDITION_LABELS)}
              value={draft.hearing_condition ?? ''}
              onChange={(value) => update({ hearing_condition: (value || null) as HearingCondition })}
            />
            <SelectField
              label="Speech (optional)"
              name="speech_condition"
              options={optionsOf(SPEECH_CONDITION_LABELS)}
              value={draft.speech_condition ?? ''}
              onChange={(value) => update({ speech_condition: (value || null) as SpeechCondition })}
            />
          </FieldRow>

          <Switch
            label="I use a hearing aid"
            checked={draft.uses_hearing_aid}
            onChange={(checked) => update({ uses_hearing_aid: checked })}
          />
          <Switch
            label="I use sign language"
            checked={draft.knows_sign_language}
            onChange={(checked) => update({ knows_sign_language: checked })}
          />
        </div>

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>How you prefer to talk</h3>
          <SelectField
            label="Preferred way to communicate"
            name="preferred_communication_method"
            options={toOptions(COMMUNICATION_METHODS)}
            value={draft.preferred_communication_method}
            onChange={(value) => update({ preferred_communication_method: value })}
            help="Shown on your profile so someone knows how to reach you well."
          />
        </div>
      </>
    );
  }

  if (draft.profile_category === 'vitiligo_skin_condition') {
    return (
      <>
        <PrivacyExplainer
          items={[
            'Every field here is optional.',
            'Your photos stay blurred until you choose to share them, exactly like every other member.',
            'Nothing here is shown as a warning or a label on your profile.',
          ]}
        />

        <div className={styles.group}>
          <h3 className={styles.groupTitle}>What someone should know</h3>
          <SelectField
            label="Condition (optional)"
            name="skin_condition"
            options={optionsOf(SKIN_CONDITION_LABELS)}
            value={draft.skin_condition ?? ''}
            onChange={(value) => update({ skin_condition: (value || null) as SkinCondition })}
          />
          <SelectField
            label="Coverage (optional)"
            name="vitiligo_coverage"
            options={optionsOf(VITILIGO_COVERAGE_LABELS)}
            value={draft.vitiligo_coverage ?? ''}
            onChange={(value) => update({ vitiligo_coverage: (value || null) as VitiligoCoverage })}
          />
          <TextField
            label="Areas affected (optional)"
            name="vitiligo_affected_areas"
            value={draft.vitiligo_affected_areas}
            onChange={(value) => update({ vitiligo_affected_areas: value })}
          />
          <Segmented<'yes' | 'no' | 'unsure'>
            label="Has it been stable?"
            value={draft.vitiligo_stable === null ? 'unsure' : draft.vitiligo_stable ? 'yes' : 'no'}
            onChange={(value) => update({ vitiligo_stable: value === 'unsure' ? null : value === 'yes' })}
            options={[
              { value: 'yes', label: 'Stable' },
              { value: 'no', label: 'Changing' },
              { value: 'unsure', label: 'Prefer not to say' },
            ]}
            full
          />
        </div>
      </>
    );
  }

  // General community: nothing to add here.
  return (
    <div className={styles.group}>
      <h3 className={styles.groupTitle}>Nothing extra needed</h3>
      <p className={styles.groupHint}>
        You joined the general community, so there are no additional fields at this step. Continue to your
        partner preferences — that is the one that most improves your matches.
      </p>
    </div>
  );
}

/* ==========================================================================
   Step 8 — Partner preferences
   ========================================================================== */

export function PreferencesStep({ draft, update, errors }: StepProps) {
  return (
    <>
      <Alert tone="info" title="This step does the most work">
        Your match percentages are calculated from exactly these preferences. With none saved, every profile
        scores the same and the ordering means nothing.
      </Alert>

      <div className={styles.group}>
        <RangeSlider
          label="Age range"
          min={AGE_RANGE.min}
          max={AGE_RANGE.max}
          value={[draft.pref_min_age, draft.pref_max_age]}
          onChange={([min, max]) => update({ pref_min_age: min, pref_max_age: max })}
          format={(value) => `${value}`}
          minLabel="Youngest age you would consider"
          maxLabel="Oldest age you would consider"
        />
        {errors.pref_age && (
          <p role="alert" style={{ margin: 0, color: 'var(--danger)', fontSize: 'var(--text-xs)' }}>
            {errors.pref_age}
          </p>
        )}

        <RangeSlider
          label="Height range"
          min={HEIGHT_RANGE_CM.min}
          max={HEIGHT_RANGE_CM.max}
          value={[draft.pref_min_height_cm, draft.pref_max_height_cm]}
          onChange={([min, max]) => update({ pref_min_height_cm: min, pref_max_height_cm: max })}
          format={(value) => formatHeight(value) ?? `${value} cm`}
          minLabel="Shortest height you would consider"
          maxLabel="Tallest height you would consider"
        />
      </div>

      <div className={styles.group}>
        <OptionCardGroup<ProfileCategory>
          legend="Communities you are open to"
          help="Choose as many as you like. Leaving all of them unselected means we cannot weight community at all."
          multiple
          options={CATEGORY_ORDER.map((category) => ({
            value: category,
            title: PROFILE_CATEGORY_LABELS[category],
          }))}
          value={draft.pref_categories}
          onChange={(value) => update({ pref_categories: value })}
          minWidth={170}
        />
      </div>

      <div className={styles.group}>
        <SearchableCheckList
          label="Preferred states"
          help="Where you could realistically meet and settle."
          options={INDIAN_STATES}
          value={draft.pref_states}
          onChange={(value) => update({ pref_states: value })}
        />
      </div>

      <div className={styles.group}>
        <SearchableCheckList
          label="Religion"
          options={RELIGIONS}
          value={draft.pref_religions}
          onChange={(value) => update({ pref_religions: value })}
        />
        <SearchableCheckList
          label="Education"
          options={EDUCATION_LEVELS}
          value={draft.pref_education}
          onChange={(value) => update({ pref_education: value })}
        />
      </div>

      <div className={styles.group}>
        <OptionCardGroup<MaritalStatus>
          legend="Marital status you would consider"
          multiple
          options={optionsOf(MARITAL_STATUS_LABELS).map((option) => ({
            value: option.value,
            title: option.label,
          }))}
          value={draft.pref_marital_status}
          onChange={(value) => update({ pref_marital_status: value })}
          minWidth={160}
        />
        <OptionCardGroup<Diet>
          legend="Diet"
          multiple
          options={optionsOf(DIET_LABELS).map((option) => ({ value: option.value, title: option.label }))}
          value={draft.pref_diet}
          onChange={(value) => update({ pref_diet: value })}
          minWidth={160}
        />
      </div>

      <div className={styles.group}>
        <TextArea
          label="Anything else you would like to say (optional)"
          name="about_partner"
          value={draft.pref_about_partner}
          onChange={(value) => update({ pref_about_partner: value })}
          maxLength={800}
          rows={4}
          help="Shown on your profile as what you are looking for."
        />
      </div>
    </>
  );
}
