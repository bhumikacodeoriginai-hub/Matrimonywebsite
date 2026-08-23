/**
 * Types mirroring the Laravel API in `advaita-matrimony-web`.
 *
 * These are transcribed from the actual controllers, models and migrations —
 * not from the README (which is out of date and, notably, mislabels the
 * recommendation score as "AI"). Where the server is inconsistent, the type
 * reflects the server, and a comment records the inconsistency.
 *
 * Two server behaviours you must keep in mind when consuming these:
 *
 *  1. The response envelope is NOT uniform. Most endpoints return
 *     `{ success, data }`, but several put their payload at the top level
 *     (`token`, `user`, `photo`, `count`, `is_new_user`, `has_subscription`,
 *     `free_mode`). Each type below documents which shape it is.
 *
 *  2. `PUT /profile/update` and `PUT /profile/partner-preferences` perform NO
 *     server-side validation and mass-assign whatever they receive. The enum
 *     unions here are therefore the only thing standing between a typo and a
 *     MySQL truncation error. Treat them as load-bearing.
 */

/* ==========================================================================
   Enums — transcribed from database/migrations/..._create_profiles_table.php
   ========================================================================== */

export type ProfileCategory =
  'general' | 'physically_challenged' | 'hearing_speech_impaired' | 'vitiligo_skin_condition';

export type Gender = 'male' | 'female' | 'other';

export type ProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type DisabilityType =
  | 'none'
  | 'locomotor_impairment'
  | 'cerebral_palsy'
  | 'muscular_dystrophy'
  | 'polio_affected'
  | 'amputation'
  | 'dwarfism'
  | 'spinal_cord_injury'
  | 'other_physical';

export type UdidVerificationStatus = 'not_uploaded' | 'pending' | 'verified' | 'rejected';

export type HearingCondition =
  'normal' | 'partial_hearing_loss' | 'complete_hearing_loss' | 'deaf_since_birth';

export type SpeechCondition = 'normal' | 'speech_impaired' | 'mute' | 'stuttering';

export type SkinCondition = 'normal' | 'vitiligo' | 'leucoderma' | 'other_skin_condition';

export type VitiligoCoverage = 'minimal' | 'moderate' | 'extensive' | 'universal';

export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'separated';

export type ChildrenLivingStatus = 'not_applicable' | 'living_with_me' | 'not_living_with_me';

export type BodyType = 'slim' | 'average' | 'athletic' | 'heavy';

export type Complexion = 'very_fair' | 'fair' | 'wheatish' | 'dark';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type EmployedIn = 'government' | 'private' | 'business' | 'self_employed' | 'not_working' | 'student';

export type FamilyType = 'joint' | 'nuclear';

export type FamilyStatus = 'middle_class' | 'upper_middle_class' | 'rich' | 'affluent';

export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan' | 'jain';

export type Habit = 'no' | 'occasionally' | 'yes';

export type PhotoPrivacyLevel = 'public' | 'members_only' | 'request_access';

export type PhotoStatus = 'pending' | 'approved' | 'rejected';

export type InterestStatus = 'pending' | 'accepted' | 'rejected';

export type MessageType = 'text' | 'image' | 'audio';

/* ==========================================================================
   Shared envelopes
   ========================================================================== */

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiMessage {
  success: boolean;
  message: string;
}

/** Laravel's standard paginator, as nested under `data` by every list endpoint. */
export interface Paginated<T> {
  current_page: number;
  data: T[];
  first_page_url: string | null;
  from: number | null;
  last_page: number;
  last_page_url: string | null;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

/* ==========================================================================
   Auth
   ========================================================================== */

/** `AuthController::getUserData()` — returned by verify-otp, register and login. */
export interface AuthUser {
  id: number;
  unique_id: string;
  name: string;
  email: string | null;
  phone: string;
  gender: Gender;
  age: number | null;
  /** `primaryPhoto.thumbnail_path` — a RELATIVE public-disk path, or null. */
  avatar: string | null;
  profile_status: ProfileStatus;
  is_premium: boolean;
  profile_category: ProfileCategory | null;
  profile_completion: number;
  subscription: {
    package_name: string;
    expires_at: string;
    days_remaining: number;
  } | null;
}

/** Token is TOP-LEVEL, not under `data`. */
export interface LoginResponse {
  success: true;
  message: string;
  token: string;
  user: AuthUser;
  /** Only present on verify-otp. */
  is_new_user?: boolean;
}

/** verify-otp for an unknown phone: no token, registration must follow. */
export interface OtpNewUserResponse {
  success: true;
  message: string;
  is_new_user: true;
  phone_verified: true;
}

export type VerifyOtpResponse = LoginResponse | OtpNewUserResponse;

export interface SendOtpPayload {
  phone: string;
  /**
   * NOTE: `AuthController::verifyOtp` calls `OtpService::verifyOtp($phone,$otp)`
   * without forwarding a purpose, so it always checks purpose='login'. An OTP
   * requested as 'registration' can therefore NEVER be verified. We always send
   * 'login'. Do not "fix" this client-side — it needs a server change.
   */
  purpose?: 'login';
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface RegisterPayload {
  phone: string;
  name: string;
  email?: string;
  gender: Gender;
  /** YYYY-MM-DD, must be at least 18 years ago (server: `before:-18 years`). */
  date_of_birth: string;
  password: string;
  /** Server rule is `confirmed`, so this field is mandatory in practice. */
  password_confirmation: string;
  profile_category: ProfileCategory;
}

export interface PasswordLoginPayload {
  /** Email or 10-digit phone. */
  login: string;
  password: string;
}

/* ==========================================================================
   Profile
   ========================================================================== */

/**
 * The `profiles` row. Every field is optional because `GET /profile/me` returns
 * the raw Eloquent model of a freshly-created (near-empty) profile.
 *
 * `height_cm` / `weight_kg` are `decimal(5,2)` columns and therefore arrive as
 * STRINGS ("165.00"), not numbers. Use `toNumber()` from lib/format.ts.
 */
export interface ProfileRecord {
  id?: number;
  user_id?: number;
  profile_category?: ProfileCategory | null;

  // Accessibility / disability — displayed only with explicit consent.
  disability_type?: DisabilityType | null;
  disability_percentage?: number | null;
  udid_verification_status?: UdidVerificationStatus | null;
  udid_certificate_number?: string | null;
  udid_document_path?: string | null;
  uses_wheelchair?: boolean | null;
  uses_prosthetics?: boolean | null;
  uses_hearing_aid?: boolean | null;
  disability_description?: string | null;

  hearing_condition?: HearingCondition | null;
  speech_condition?: SpeechCondition | null;
  knows_sign_language?: boolean | null;
  preferred_communication_method?: string | null;

  skin_condition?: SkinCondition | null;
  vitiligo_coverage?: VitiligoCoverage | null;
  vitiligo_affected_areas?: string | null;
  vitiligo_stable?: boolean | null;

  religion?: string | null;
  caste?: string | null;
  sub_caste?: string | null;
  mother_tongue?: string | null;
  marital_status?: MaritalStatus | null;
  number_of_children?: number | null;
  children_living_status?: ChildrenLivingStatus | null;

  height_cm?: string | number | null;
  weight_kg?: string | number | null;
  body_type?: BodyType | null;
  complexion?: Complexion | null;
  blood_group?: BloodGroup | null;

  highest_education?: string | null;
  education_institution?: string | null;
  education_field?: string | null;
  employed_in?: EmployedIn | null;
  occupation?: string | null;
  company_name?: string | null;
  annual_income_range?: string | null;

  country?: string | null;
  state?: string | null;
  city?: string | null;
  pincode?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;

  family_type?: FamilyType | null;
  family_status?: FamilyStatus | null;
  father_occupation?: string | null;
  mother_occupation?: string | null;
  number_of_brothers?: number | null;
  number_of_sisters?: number | null;
  family_details?: string | null;

  diet?: Diet | null;
  smoking?: Habit | null;
  drinking?: Habit | null;

  gotra?: string | null;
  rashi?: string | null;
  nakshatra?: string | null;
  manglik?: boolean | null;
  birth_time?: string | null;
  birth_place?: string | null;

  about_me?: string | null;
  partner_preferences_text?: string | null;
  hobbies?: string[] | null;
  languages_known?: string[] | null;
}

/** Writable subset of `profiles` plus the three `users` columns update accepts. */
export type ProfileUpdatePayload = Partial<
  Omit<ProfileRecord, 'id' | 'user_id'> & {
    name: string;
    email: string;
    date_of_birth: string;
  }
>;

export interface PartnerPreferenceRecord {
  id?: number;
  user_id?: number;
  min_age?: number | null;
  max_age?: number | null;
  min_height_cm?: number | null;
  max_height_cm?: number | null;
  accepted_categories?: ProfileCategory[] | null;
  preferred_states?: string[] | null;
  religion_preferences?: string[] | null;
  caste_preferences?: string[] | null;
  mother_tongue_preferences?: string[] | null;
  education_preferences?: string[] | null;
  occupation_preferences?: string[] | null;
  income_preferences?: string[] | null;
  marital_status_preferences?: MaritalStatus[] | null;
  diet_preferences?: Diet[] | null;
  smoking_preference?: Habit | null;
  drinking_preference?: Habit | null;
  accepts_disability?: boolean | null;
  accepts_vitiligo?: boolean | null;
  about_partner?: string | null;
}

export interface PhotoRecord {
  id: number;
  user_id: number;
  original_path: string;
  watermarked_path: string | null;
  blurred_path: string | null;
  thumbnail_path: string | null;
  is_primary: boolean;
  privacy_level: PhotoPrivacyLevel;
  status: PhotoStatus;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

/** `GET /profile/me` — the raw User model with relations, under `data`. */
export interface MyProfileResponse {
  user: {
    id: number;
    unique_id: string;
    name: string;
    email: string | null;
    phone: string;
    gender: Gender;
    date_of_birth: string | null;
    profile_status: ProfileStatus;
    is_premium: boolean;
    premium_expires_at: string | null;
    is_online: boolean;
    last_active_at: string | null;
    phone_verified_at: string | null;
    created_at: string;
    profile: ProfileRecord | null;
    photos: PhotoRecord[];
    partner_preferences: PartnerPreferenceRecord | null;
    active_subscription: {
      id: number;
      package_id: number;
      starts_at: string;
      expires_at: string;
      status: string;
      profile_views_used: number;
      contacts_used: number;
      messages_used: number;
      interests_used: number;
      package: SubscriptionPackage;
    } | null;
  };
  profile_completion: number;
}

/** A photo as exposed on someone ELSE's profile. */
export interface ViewablePhoto {
  id: number;
  /** Relative public-disk path: watermarked when authorised, blurred when not. */
  url: string;
  is_blurred: boolean;
  is_primary: boolean;
}

/** `GET /profiles/{userId}` under `data`. */
export interface PublicProfileResponse {
  id: number;
  unique_id: string;
  name: string;
  age: number | null;
  gender: Gender;
  profile_category: ProfileCategory | null;
  category_display: string;
  is_premium: boolean;
  /** Human string, e.g. "2 hours ago". */
  last_active: string;
  /**
   * SECURITY NOTE: the server currently serialises the ENTIRE profiles row here,
   * including `udid_certificate_number`, `udid_document_path` and
   * `disability_percentage`, with no privacy gate. The UI must not render those
   * fields; see components/profile/sensitive-details.tsx. Flagged in
   * docs/SECURITY_FINDINGS.md for a server-side fix.
   */
  profile: ProfileRecord;
  photos: ViewablePhoto[];
  /** Full number when the viewer is premium, else masked "9876****10". */
  phone: string;
  email: string | null;
  contact_visible: boolean;
}

/* ==========================================================================
   Discovery
   ========================================================================== */

/** Card shape shared by recommendations and search. */
export interface ProfileCardData {
  id: number;
  unique_id: string;
  name: string;
  age: number | null;
  gender: Gender;
  city: string | null;
  state: string | null;
  profile_category: ProfileCategory | null;
  category_display: string;
  highest_education: string | null;
  occupation: string | null;
  /** `primaryPhoto.thumbnail_path`, relative, or null. */
  photo: string | null;
  is_premium: boolean;
  last_active: string;
  /**
   * Present ONLY on `GET /matches/recommended`. Search results have no score,
   * so the UI must not render a compatibility badge there.
   *
   * This is rule-based preference matching (MatchService::calculateMatchScore),
   * NOT machine learning. Never label it "AI".
   */
  match_score?: number;
}

export interface SearchFilters {
  gender?: Gender;
  min_age?: number;
  max_age?: number;
  profile_category?: ProfileCategory | ProfileCategory[];
  disability_type?: DisabilityType;
  skin_condition?: SkinCondition;
  state?: string;
  city?: string;
  religion?: string;
  caste?: string;
  marital_status?: MaritalStatus;
  /** Maps to `profiles.highest_education` server-side. */
  education?: string;
  min_height?: number;
  max_height?: number;
  mother_tongue?: string;
  premium_only?: boolean;
  with_photo?: boolean;
  recently_active?: boolean;
  per_page?: number;
  page?: number;
}

export interface FilterOptions {
  profile_categories: { value: ProfileCategory; label: string }[];
  religions: string[];
  marital_statuses: { value: MaritalStatus; label: string }[];
  education_levels: string[];
  states: string[];
}

/* ==========================================================================
   Relationships
   ========================================================================== */

/** Compact user summary eager-loaded onto interests, viewers and shortlists. */
export interface UserSummary {
  id: number;
  name: string;
  unique_id: string;
  gender: Gender;
  date_of_birth: string | null;
  primary_photo: PhotoRecord | null;
  profile: {
    id: number;
    user_id: number;
    profile_category: ProfileCategory | null;
    city: string | null;
    state: string | null;
    highest_education?: string | null;
    occupation?: string | null;
  } | null;
}

export interface InterestRecord {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: InterestStatus;
  message: string | null;
  responded_at: string | null;
  created_at: string;
  sender?: UserSummary;
  receiver?: UserSummary;
}

export interface ProfileViewRecord {
  id: number;
  viewer_id: number;
  viewed_id: number;
  created_at: string;
  updated_at: string;
  viewer: UserSummary;
}

/* ==========================================================================
   Chat
   ========================================================================== */

export interface ConversationSummary {
  id: number;
  other_user: {
    id: number;
    name: string;
    unique_id: string;
    photo: string | null;
    is_online: boolean;
    last_active: string | null;
  };
  last_message: {
    body: string | null;
    type: MessageType;
    sent_by_me: boolean;
    /** Human string, e.g. "5 minutes ago". */
    time: string;
  } | null;
  unread_count: number;
  updated_at: string | null;
}

export interface MessageRecord {
  id: number;
  conversation_id: number;
  sender_id: number;
  body: string | null;
  type: MessageType;
  attachment_path: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/* ==========================================================================
   Subscriptions & payments
   ========================================================================== */

export interface SubscriptionPackage {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discounted_price: number | null;
  effective_price: number;
  discount_percentage: number;
  duration_days: number;
  is_popular: boolean;
  features: string[];
  /** -1 means unlimited. */
  limits: {
    profile_views: number;
    contacts: number;
    messages: number;
    interests: number;
  };
  includes: {
    photo_access: boolean;
    advanced_search: boolean;
    chat: boolean;
    video_call: boolean;
    profile_highlight: boolean;
    priority_support: boolean;
  };
}

/** `GET /packages` puts `free_mode` at the TOP level, beside `data`. */
export interface PackagesResponse {
  success: true;
  free_mode: boolean;
  data: SubscriptionPackage[];
}

export interface MySubscriptionActive {
  success: true;
  has_subscription: true;
  data: {
    package_name: string;
    starts_at: string;
    expires_at: string;
    days_remaining: number;
    /** Pre-formatted "used/limit" strings; limit is the literal "∞" if -1. */
    usage: {
      profile_views: string;
      contacts: string;
      messages: string;
      interests: string;
    };
  };
}

export interface MySubscriptionNone {
  success: true;
  has_subscription: false;
  message: string;
}

export type MySubscriptionResponse = MySubscriptionActive | MySubscriptionNone;

/** Razorpay order — all fields TOP-LEVEL, `amount` in paise. */
export interface RazorpayOrder {
  success: true;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  payment_id: number;
  user_name: string;
  user_email: string | null;
  user_phone: string;
}

export interface RazorpayVerifyPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PhonePeOrder {
  success: true;
  redirect_url: string;
  transaction_id: string;
}

export interface PaymentRecord {
  id: number;
  user_id: number;
  package_id: number;
  amount: number;
  status: string;
  gateway: string | null;
  gateway_payment_id: string | null;
  created_at: string;
  package: { id: number; name: string; duration_days: number } | null;
}
