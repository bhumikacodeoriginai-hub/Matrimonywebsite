/**
 * Onboarding draft: the shape of everything the wizard collects, how it is
 * persisted, and how it maps onto the three API calls that save it.
 *
 * WHY A LOCAL DRAFT AT ALL
 * Filling in a matrimony profile is a 10-step job that people do in more than one
 * sitting, often on a phone, often interrupted. The draft is mirrored to
 * localStorage after every change so closing the tab loses nothing.
 *
 * WHAT IS NEVER PERSISTED LOCALLY
 * The password and the one-time code. Both are held in component state only and
 * dropped the moment the account is created. Writing a password to localStorage
 * would leave it readable by any script on the origin, indefinitely.
 *
 * HOW IT REACHES THE SERVER
 *   Step 1  → POST /api/auth/register            (creates the account + session)
 *   Steps 2–7, 9 → PUT /profile/update           (auto-saved as the member moves on)
 *   Step 8  → PUT /profile/partner-preferences
 *   Photos  → POST /profile/photo/upload         (immediately, per file)
 *
 * `PUT /profile/update` performs NO server-side validation and mass-assigns what
 * it receives, so `toProfilePayload` is the only thing standing between a typo and
 * a MySQL truncation error. It sends only known keys, and omits empty ones.
 */

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
  PartnerPreferenceRecord,
  ProfileCategory,
  ProfileUpdatePayload,
  SkinCondition,
  SpeechCondition,
  VitiligoCoverage,
} from '../api/types';

export const DRAFT_STORAGE_KEY = 'advaita:onboarding-draft';

/** Everything the wizard collects, other than the password and OTP. */
export interface OnboardingDraft {
  /* -- Step 1: account (also the /auth/register payload) -- */
  profile_category: ProfileCategory | null;
  name: string;
  gender: Gender | null;
  date_of_birth: string;
  phone: string;
  email: string;
  /** True once the number has been verified by OTP in this flow. */
  phoneVerified: boolean;
  acceptedTerms: boolean;

  /* -- Step 2: personal -- */
  marital_status: MaritalStatus | null;
  number_of_children: string;
  children_living_status: ChildrenLivingStatus | null;
  height_cm: number | null;
  weight_kg: string;
  body_type: BodyType | null;
  complexion: Complexion | null;
  blood_group: BloodGroup | null;

  /* -- Step 3: community & background -- */
  religion: string;
  caste: string;
  sub_caste: string;
  mother_tongue: string;
  languages_known: string[];
  gotra: string;

  /* -- Step 4: education & career -- */
  highest_education: string;
  education_field: string;
  education_institution: string;
  employed_in: EmployedIn | null;
  occupation: string;
  company_name: string;
  annual_income_range: string;

  /* -- Step 5: location & family -- */
  country: string;
  state: string;
  city: string;
  pincode: string;
  family_type: FamilyType | null;
  family_status: FamilyStatus | null;
  father_occupation: string;
  mother_occupation: string;
  number_of_brothers: string;
  number_of_sisters: string;

  /* -- Step 6: lifestyle & about -- */
  diet: Diet | null;
  smoking: Habit | null;
  drinking: Habit | null;
  hobbies: string[];
  about_me: string;

  /* -- Step 7: inclusive details (all optional, all self-declared) -- */
  disability_type: DisabilityType | null;
  disability_percentage: string;
  uses_wheelchair: boolean;
  uses_prosthetics: boolean;
  uses_hearing_aid: boolean;
  disability_description: string;
  udid_certificate_number: string;
  hearing_condition: HearingCondition | null;
  speech_condition: SpeechCondition | null;
  knows_sign_language: boolean;
  preferred_communication_method: string;
  skin_condition: SkinCondition | null;
  vitiligo_coverage: VitiligoCoverage | null;
  vitiligo_affected_areas: string;
  vitiligo_stable: boolean | null;

  /* -- Step 8: partner preferences -- */
  pref_min_age: number;
  pref_max_age: number;
  pref_min_height_cm: number;
  pref_max_height_cm: number;
  pref_categories: ProfileCategory[];
  pref_states: string[];
  pref_religions: string[];
  pref_education: string[];
  pref_marital_status: MaritalStatus[];
  pref_diet: Diet[];
  pref_about_partner: string;
}

export function emptyDraft(): OnboardingDraft {
  return {
    profile_category: null,
    name: '',
    gender: null,
    date_of_birth: '',
    phone: '',
    email: '',
    phoneVerified: false,
    acceptedTerms: false,

    marital_status: null,
    number_of_children: '',
    children_living_status: null,
    height_cm: null,
    weight_kg: '',
    body_type: null,
    complexion: null,
    blood_group: null,

    religion: '',
    caste: '',
    sub_caste: '',
    mother_tongue: '',
    languages_known: [],
    gotra: '',

    highest_education: '',
    education_field: '',
    education_institution: '',
    employed_in: null,
    occupation: '',
    company_name: '',
    annual_income_range: '',

    country: 'India',
    state: '',
    city: '',
    pincode: '',
    family_type: null,
    family_status: null,
    father_occupation: '',
    mother_occupation: '',
    number_of_brothers: '',
    number_of_sisters: '',

    diet: null,
    smoking: null,
    drinking: null,
    hobbies: [],
    about_me: '',

    disability_type: null,
    disability_percentage: '',
    uses_wheelchair: false,
    uses_prosthetics: false,
    uses_hearing_aid: false,
    disability_description: '',
    udid_certificate_number: '',
    hearing_condition: null,
    speech_condition: null,
    knows_sign_language: false,
    preferred_communication_method: '',
    skin_condition: null,
    vitiligo_coverage: null,
    vitiligo_affected_areas: '',
    vitiligo_stable: null,

    // Sensible starting window rather than 18–75, which returns everything and
    // therefore tells the match scorer nothing.
    pref_min_age: 24,
    pref_max_age: 34,
    pref_min_height_cm: 145,
    pref_max_height_cm: 190,
    pref_categories: [],
    pref_states: [],
    pref_religions: [],
    pref_education: [],
    pref_marital_status: [],
    pref_diet: [],
    pref_about_partner: '',
  };
}

/* ==========================================================================
   Persistence
   ========================================================================== */

export function loadDraft(): OnboardingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    // Merge over a fresh draft so a stored draft from an older build, missing
    // newly added keys, cannot produce undefined fields at render time.
    return { ...emptyDraft(), ...parsed };
  } catch {
    return null;
  }
}

export function saveDraft(draft: OnboardingDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked. The wizard still works; only resume-later is lost.
  }
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(DRAFT_STORAGE_KEY);
  } catch {
    // Non-fatal.
  }
}

/* ==========================================================================
   Mapping to API payloads
   ========================================================================== */

/** Drops empty strings, nulls and empty arrays so we never blank a saved field. */
function compact<T extends Record<string, unknown>>(input: T): Partial<T> {
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' && value.trim() === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    output[key] = value;
  }
  return output as Partial<T>;
}

/** Parses an optional integer field, returning undefined when not usable. */
function optInt(value: string): number | undefined {
  if (value.trim() === '') return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Builds the `PUT /profile/update` body for a given step.
 *
 * Per-step rather than one big payload, because the wizard saves as the member
 * advances. Sending the whole draft each time would overwrite fields the member
 * edited elsewhere in another tab.
 */
export function toProfilePayload(draft: OnboardingDraft, step: number): ProfileUpdatePayload {
  switch (step) {
    case 2:
      return compact({
        marital_status: draft.marital_status,
        number_of_children: optInt(draft.number_of_children),
        children_living_status: draft.children_living_status,
        height_cm: draft.height_cm,
        weight_kg: optInt(draft.weight_kg),
        body_type: draft.body_type,
        complexion: draft.complexion,
        blood_group: draft.blood_group,
      });

    case 3:
      return compact({
        religion: draft.religion,
        caste: draft.caste,
        sub_caste: draft.sub_caste,
        mother_tongue: draft.mother_tongue,
        languages_known: draft.languages_known,
        gotra: draft.gotra,
      });

    case 4:
      return compact({
        highest_education: draft.highest_education,
        education_field: draft.education_field,
        education_institution: draft.education_institution,
        employed_in: draft.employed_in,
        occupation: draft.occupation,
        company_name: draft.company_name,
        annual_income_range: draft.annual_income_range,
      });

    case 5:
      return compact({
        country: draft.country,
        state: draft.state,
        city: draft.city,
        pincode: draft.pincode,
        family_type: draft.family_type,
        family_status: draft.family_status,
        father_occupation: draft.father_occupation,
        mother_occupation: draft.mother_occupation,
        number_of_brothers: optInt(draft.number_of_brothers),
        number_of_sisters: optInt(draft.number_of_sisters),
      });

    case 6:
      return compact({
        diet: draft.diet,
        smoking: draft.smoking,
        drinking: draft.drinking,
        hobbies: draft.hobbies,
        about_me: draft.about_me,
      });

    case 7: {
      // Only send the block that belongs to the member's community. Writing
      // vitiligo fields onto a Divyangjan profile (or vice versa) would put data
      // in columns their own profile view never reads.
      switch (draft.profile_category) {
        case 'physically_challenged':
          return compact({
            disability_type: draft.disability_type,
            disability_percentage: optInt(draft.disability_percentage),
            // Booleans are sent as-is: `false` is a real answer here, so these
            // deliberately bypass compact().
            disability_description: draft.disability_description,
            udid_certificate_number: draft.udid_certificate_number,
          }) as ProfileUpdatePayload;

        case 'hearing_speech_impaired':
          return compact({
            hearing_condition: draft.hearing_condition,
            speech_condition: draft.speech_condition,
            preferred_communication_method: draft.preferred_communication_method,
          }) as ProfileUpdatePayload;

        case 'vitiligo_skin_condition':
          return compact({
            skin_condition: draft.skin_condition,
            vitiligo_coverage: draft.vitiligo_coverage,
            vitiligo_affected_areas: draft.vitiligo_affected_areas,
          }) as ProfileUpdatePayload;

        default:
          return {};
      }
    }

    default:
      return {};
  }
}

/**
 * Booleans for step 7, kept separate because `false` is meaningful and must not be
 * stripped by `compact()`.
 */
export function toProfileBooleans(draft: OnboardingDraft): ProfileUpdatePayload {
  switch (draft.profile_category) {
    case 'physically_challenged':
      return {
        uses_wheelchair: draft.uses_wheelchair,
        uses_prosthetics: draft.uses_prosthetics,
      };
    case 'hearing_speech_impaired':
      return {
        uses_hearing_aid: draft.uses_hearing_aid,
        knows_sign_language: draft.knows_sign_language,
      };
    case 'vitiligo_skin_condition':
      return draft.vitiligo_stable === null ? {} : { vitiligo_stable: draft.vitiligo_stable };
    default:
      return {};
  }
}

/** Builds the `PUT /profile/partner-preferences` body. */
export function toPreferencesPayload(draft: OnboardingDraft): PartnerPreferenceRecord {
  return compact({
    min_age: draft.pref_min_age,
    max_age: draft.pref_max_age,
    min_height_cm: draft.pref_min_height_cm,
    max_height_cm: draft.pref_max_height_cm,
    accepted_categories: draft.pref_categories,
    preferred_states: draft.pref_states,
    religion_preferences: draft.pref_religions,
    education_preferences: draft.pref_education,
    marital_status_preferences: draft.pref_marital_status,
    diet_preferences: draft.pref_diet,
    about_partner: draft.pref_about_partner,
  });
}

/* ==========================================================================
   Validation
   ========================================================================== */

export type StepErrors = Record<string, string>;

/** Age check mirroring Laravel's `before:-18 years`, so we can explain it kindly. */
export function isAtLeast18(dateOfBirth: string): boolean {
  const dob = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(dob.getTime())) return false;
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 18);
  return dob.getTime() <= cutoff.getTime();
}

/**
 * Validates a step.
 *
 * ONLY STEP 1 HAS REQUIRED FIELDS. Everything after it is optional by design: a
 * member who does not want to state their caste, income or complexion should be
 * able to finish and still be findable. Blocking progress on optional data is how
 * a wizard becomes an interrogation.
 */
export function validateStep(step: number, draft: OnboardingDraft, password: string): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    if (!draft.profile_category) errors.profile_category = 'Choose the community that fits you.';
    if (draft.name.trim().length < 3) errors.name = 'Your name needs at least 3 characters.';
    if (!draft.gender) errors.gender = 'Choose how you identify.';
    if (!draft.date_of_birth) errors.date_of_birth = 'Enter your date of birth.';
    else if (!isAtLeast18(draft.date_of_birth)) errors.date_of_birth = 'You must be at least 18 to join.';
    if (!/^[6-9]\d{9}$/.test(draft.phone.replace(/\D/g, ''))) {
      errors.phone = 'Enter a 10-digit Indian mobile number.';
    }
    if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      errors.email = 'Enter a valid email address, or leave it blank.';
    }
    if (password.length < 6) errors.password = 'Use at least 6 characters.';
    if (!draft.acceptedTerms) errors.acceptedTerms = 'Please accept the terms and privacy policy.';
  }

  if (step === 8 && draft.pref_min_age > draft.pref_max_age) {
    errors.pref_age = 'The minimum age cannot be above the maximum.';
  }

  return errors;
}
