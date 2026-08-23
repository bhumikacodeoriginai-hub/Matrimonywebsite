/**
 * Human labels for every database enum, plus the option lists the API does not
 * provide (`GET /filter-options` only returns categories, religions, marital
 * statuses, education levels and states).
 *
 * LANGUAGE POLICY — this file is where inclusion is either honoured or quietly
 * broken, so the rules are explicit:
 *
 *  • Person-first and factual. "Uses a wheelchair", never "wheelchair-bound".
 *  • No pathologising verbs. Nothing "suffers from" anything.
 *  • Vitiligo and disability are described as attributes, never as problems,
 *    warnings or qualifiers. No "despite", no "still", no euphemism either —
 *    euphemism reads as shame.
 *  • The same visual and typographic weight as any other field. These labels are
 *    rendered by the same components, with the same colours, as "Occupation".
 *
 * If you add a label here, read it out loud as though describing yourself.
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
  PhotoPrivacyLevel,
  ProfileCategory,
  ProfileStatus,
  SkinCondition,
  SpeechCondition,
  UdidVerificationStatus,
  VitiligoCoverage,
} from './api/types';

/** Turns an enum value into its label, degrading gracefully for unknown values. */
export function labelOf<T extends string>(map: Record<string, string>, value: T | null | undefined): string {
  if (!value) return '—';
  return map[value] ?? humanise(value);
}

/** Fallback for values the server adds before the frontend knows about them. */
export function humanise(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/** Converts a label map into `{ value, label }[]` for select/chip components. */
export function optionsOf<T extends string>(map: Record<T, string>): { value: T; label: string }[] {
  return (Object.keys(map) as T[]).map((value) => ({ value, label: map[value] }));
}

/* ==========================================================================
   Communities
   ========================================================================== */

export const PROFILE_CATEGORY_LABELS: Record<ProfileCategory, string> = {
  general: 'General',
  physically_challenged: 'Divyangjan',
  hearing_speech_impaired: 'Hearing & Speech',
  vitiligo_skin_condition: 'Vitiligo',
};

/** One neutral sentence per community, used on the community picker. */
export const PROFILE_CATEGORY_DESCRIPTIONS: Record<ProfileCategory, string> = {
  general: 'Matrimony for everyone, with the same privacy and verification.',
  physically_challenged: 'For Divyangjan members, with optional UDID verification.',
  hearing_speech_impaired: 'For the Deaf and hard-of-hearing community, sign language welcomed.',
  vitiligo_skin_condition: 'For members with vitiligo and other skin conditions.',
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Man',
  female: 'Woman',
  other: 'Non-binary',
};

export const PROFILE_STATUS_LABELS: Record<ProfileStatus, string> = {
  pending: 'Awaiting review',
  approved: 'Active',
  rejected: 'Needs changes',
  suspended: 'Suspended',
};

/* ==========================================================================
   Accessibility & health attributes
   ========================================================================== */

export const DISABILITY_TYPE_LABELS: Record<DisabilityType, string> = {
  none: 'Not applicable',
  locomotor_impairment: 'Locomotor impairment',
  cerebral_palsy: 'Cerebral palsy',
  muscular_dystrophy: 'Muscular dystrophy',
  polio_affected: 'Post-polio',
  amputation: 'Amputation',
  dwarfism: 'Dwarfism',
  spinal_cord_injury: 'Spinal cord injury',
  other_physical: 'Another physical disability',
};

export const UDID_STATUS_LABELS: Record<UdidVerificationStatus, string> = {
  not_uploaded: 'Not added',
  pending: 'With our team',
  verified: 'Verified',
  rejected: 'Could not be verified',
};

export const HEARING_CONDITION_LABELS: Record<HearingCondition, string> = {
  normal: 'No hearing difference',
  partial_hearing_loss: 'Partial hearing loss',
  complete_hearing_loss: 'Complete hearing loss',
  deaf_since_birth: 'Deaf since birth',
};

export const SPEECH_CONDITION_LABELS: Record<SpeechCondition, string> = {
  normal: 'No speech difference',
  speech_impaired: 'Speech difference',
  mute: 'Non-speaking',
  stuttering: 'Stammer',
};

export const SKIN_CONDITION_LABELS: Record<SkinCondition, string> = {
  normal: 'Not applicable',
  vitiligo: 'Vitiligo',
  leucoderma: 'Leucoderma',
  other_skin_condition: 'Another skin condition',
};

export const VITILIGO_COVERAGE_LABELS: Record<VitiligoCoverage, string> = {
  minimal: 'Minimal',
  moderate: 'Moderate',
  extensive: 'Extensive',
  universal: 'Universal',
};

/** Free-text-ish field on the server; these are the common answers. */
export const COMMUNICATION_METHODS = [
  'Indian Sign Language',
  'American Sign Language',
  'Lip reading',
  'Written / chat',
  'Speech',
  'Speech with hearing aid',
  'Interpreter',
] as const;

/* ==========================================================================
   Personal
   ========================================================================== */

export const MARITAL_STATUS_LABELS: Record<MaritalStatus, string> = {
  never_married: 'Never married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  separated: 'Separated',
};

export const CHILDREN_LIVING_LABELS: Record<ChildrenLivingStatus, string> = {
  not_applicable: 'Not applicable',
  living_with_me: 'Living with me',
  not_living_with_me: 'Not living with me',
};

export const BODY_TYPE_LABELS: Record<BodyType, string> = {
  slim: 'Slim',
  average: 'Average',
  athletic: 'Athletic',
  heavy: 'Heavy',
};

/**
 * `complexion` exists as a column and is therefore supported, but it is NOT
 * offered as a search filter anywhere in this redesign, and it is never shown as
 * a badge. Colourism is not a feature. It appears only as an optional
 * self-described field the member can leave blank.
 */
export const COMPLEXION_LABELS: Record<Complexion, string> = {
  very_fair: 'Very fair',
  fair: 'Fair',
  wheatish: 'Wheatish',
  dark: 'Dark',
};

export const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/* ==========================================================================
   Education & career
   ========================================================================== */

export const EMPLOYED_IN_LABELS: Record<EmployedIn, string> = {
  government: 'Government / public sector',
  private: 'Private sector',
  business: 'Business',
  self_employed: 'Self-employed',
  not_working: 'Not working',
  student: 'Student',
};

/** Mirrors `SearchController::filterOptions()` so offline forms still work. */
export const EDUCATION_LEVELS = [
  'Below 10th',
  '10th',
  '12th',
  'Diploma',
  'Bachelors',
  'Masters',
  'Doctorate',
  'Professional Degree',
  'Trade School',
  'Vocational Training',
  'Self Taught',
  'Other',
] as const;

export const INCOME_RANGES = [
  'Below ₹2 Lakh',
  '₹2–5 Lakh',
  '₹5–10 Lakh',
  '₹10–15 Lakh',
  '₹15–25 Lakh',
  '₹25–50 Lakh',
  'Above ₹50 Lakh',
  'Prefer not to say',
] as const;

/* ==========================================================================
   Family & lifestyle
   ========================================================================== */

export const FAMILY_TYPE_LABELS: Record<FamilyType, string> = {
  joint: 'Joint family',
  nuclear: 'Nuclear family',
};

export const FAMILY_STATUS_LABELS: Record<FamilyStatus, string> = {
  middle_class: 'Middle class',
  upper_middle_class: 'Upper middle class',
  rich: 'Affluent',
  affluent: 'High net worth',
};

export const DIET_LABELS: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  non_vegetarian: 'Non-vegetarian',
  eggetarian: 'Eggetarian',
  vegan: 'Vegan',
  jain: 'Jain',
};

export const HABIT_LABELS: Record<Habit, string> = {
  no: 'No',
  occasionally: 'Occasionally',
  yes: 'Yes',
};

export const HOBBY_SUGGESTIONS = [
  'Reading',
  'Cooking',
  'Travel',
  'Music',
  'Singing',
  'Dancing',
  'Photography',
  'Painting',
  'Writing',
  'Gardening',
  'Cricket',
  'Football',
  'Badminton',
  'Chess',
  'Yoga',
  'Fitness',
  'Cycling',
  'Trekking',
  'Films',
  'Theatre',
  'Volunteering',
  'Temple visits',
  'Podcasts',
  'Board games',
  'Coding',
] as const;

export const LANGUAGE_SUGGESTIONS = [
  'Kannada',
  'Hindi',
  'English',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Punjabi',
  'Odia',
  'Assamese',
  'Urdu',
  'Konkani',
  'Tulu',
  'Sanskrit',
  'Indian Sign Language',
] as const;

/* ==========================================================================
   Religion, community, language — mirrors + fills the API's gaps
   ========================================================================== */

export const RELIGIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'] as const;

/**
 * The API exposes no caste list. These are offered as *suggestions* on a
 * free-text field — never as a required choice, and caste is never used to rank
 * or score matches anywhere in this frontend.
 */
export const CASTE_SUGGESTIONS = [
  'Brahmin',
  'Lingayat',
  'Vokkaliga',
  'Kuruba',
  'Devanga',
  'Reddy',
  'Naidu',
  'Nair',
  'Maratha',
  'Rajput',
  'Agarwal',
  'Kayastha',
  'Ezhava',
  'Mudaliar',
  'Chettiar',
  'Yadav',
  'Jat',
  'Kamma',
  'Scheduled Caste',
  'Scheduled Tribe',
  'Does not matter',
] as const;

export const MOTHER_TONGUES = [
  'Kannada',
  'Hindi',
  'Tamil',
  'Telugu',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Bengali',
  'Punjabi',
  'Odia',
  'Assamese',
  'Urdu',
  'Konkani',
  'Tulu',
  'English',
  'Other',
] as const;

/** `SearchController::getIndianStates()`, verbatim. */
export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
] as const;

/* ==========================================================================
   Photos
   ========================================================================== */

export const PHOTO_PRIVACY_LABELS: Record<PhotoPrivacyLevel, string> = {
  public: 'Visible to everyone',
  members_only: 'Visible to members',
  request_access: 'Only on request',
};

export const PHOTO_PRIVACY_DESCRIPTIONS: Record<PhotoPrivacyLevel, string> = {
  public: 'Anyone browsing Advaita can see this photo.',
  members_only: 'Signed-in members can see it. Guests cannot.',
  request_access: 'Shown blurred until you approve each request.',
};

/* ==========================================================================
   Physical ranges (no API source — used by sliders)
   ========================================================================== */

export const HEIGHT_RANGE_CM = { min: 120, max: 215 } as const;
export const AGE_RANGE = { min: 18, max: 75 } as const;
export const WEIGHT_RANGE_KG = { min: 30, max: 150 } as const;
