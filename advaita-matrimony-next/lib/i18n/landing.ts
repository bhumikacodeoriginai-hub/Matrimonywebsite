/**
 * Landing-page copy, in English and Kannada.
 *
 * WHY A DICTIONARY RATHER THAN INLINE TERNARIES
 * The previous implementation interleaved `isKannada ? '…' : '…'` throughout the
 * markup, which made both languages unreviewable and guaranteed drift. Here the
 * two languages sit side by side: a missing or stale translation is visible at a
 * glance, and the type system enforces that every key exists in both.
 *
 * SCOPE — stated honestly. This covers the public landing page, header, footer and
 * legal-page shells: the surfaces a prospective member reads before signing up.
 * The authenticated product (dashboard, search, messaging) is English-only for now.
 * Half-translating an app is worse than not starting, because a member who trusts
 * the Kannada toggle then hits a wall. Extending this properly means a real i18n
 * setup with locale routing; it is specified in docs/BACKEND_GAPS.md.
 */

export type Language = 'en' | 'kn';

export const LANGUAGE_STORAGE_KEY = 'advaita:language';

export interface LandingCopy {
  /* -- Navigation -- */
  navCommunities: string;
  navSafety: string;
  navHowItWorks: string;
  navPricing: string;
  navMenu: string;
  navClose: string;

  /* -- Primary actions -- */
  login: string;
  findMatch: string;
  createProfile: string;
  exploreVerified: string;

  /* -- Hero -- */
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleEmphasis: string;
  heroTitleLine2: string;
  heroBody: string;
  heroSignature: string;

  /* -- Trust indicators -- */
  trustHeading: string;
  trustVerified: string;
  trustVerifiedBody: string;
  trustPrivacy: string;
  trustPrivacyBody: string;
  trustSecure: string;
  trustSecureBody: string;
  trustInclusive: string;
  trustInclusiveBody: string;
  trustSearch: string;
  trustSearchBody: string;
  trustVerification: string;
  trustVerificationBody: string;

  /* -- Communities -- */
  communitiesEyebrow: string;
  communitiesTitle: string;
  communitiesEmphasis: string;
  communitiesBody: string;

  /* -- How it works -- */
  howEyebrow: string;
  howTitle: string;
  howEmphasis: string;
  howStep1: string;
  howStep1Body: string;
  howStep2: string;
  howStep2Body: string;
  howStep3: string;
  howStep3Body: string;
  howStep4: string;
  howStep4Body: string;

  /* -- Safety -- */
  safetyEyebrow: string;
  safetyTitle: string;
  safetyEmphasis: string;
  safetyBody: string;

  /* -- Pricing -- */
  pricingEyebrow: string;
  pricingTitle: string;
  pricingEmphasis: string;
  pricingBody: string;
  pricingFreeTitle: string;
  pricingFreeBody: string;
  pricingFreePrice: string;
  pricingRecommended: string;
  pricingChoose: string;
  pricingStartFree: string;
  pricingUnavailable: string;
  pricingDays: string;

  /* -- Final CTA -- */
  ctaTitle: string;
  ctaEmphasis: string;
  ctaBody: string;

  /* -- Footer -- */
  footerTagline: string;
  footerTerms: string;
  footerPrivacy: string;
  footerRefund: string;
  footerRights: string;
  footerLanguage: string;
}

const en: LandingCopy = {
  navCommunities: 'Communities',
  navSafety: 'Safety',
  navHowItWorks: 'How it works',
  navPricing: 'Membership',
  navMenu: 'Open menu',
  navClose: 'Close menu',

  login: 'Log in',
  findMatch: 'Find your match',
  createProfile: 'Create profile',
  exploreVerified: 'Explore verified profiles',

  heroEyebrow: 'Inclusive matrimony, built on consent',
  heroTitleLine1: 'Two journeys.',
  heroTitleEmphasis: 'One',
  heroTitleLine2: 'beginning.',
  heroBody:
    'A matrimony platform where privacy is the default, every profile is reviewed by a person, and your community is a fact about you — never a footnote.',
  heroSignature: 'Meet with intention, not pressure.',

  trustHeading: 'What you can count on',
  trustVerified: 'Reviewed profiles',
  trustVerifiedBody: 'Every profile is checked by our team before it appears in search.',
  trustPrivacy: 'Privacy protected',
  trustPrivacyBody: 'Photos stay blurred and contact details hidden until you decide otherwise.',
  trustSecure: 'Secure conversations',
  trustSecureBody: 'Messaging opens only after you both accept an interest.',
  trustInclusive: 'Genuinely inclusive',
  trustInclusiveBody: 'Four communities, one platform, the same features and respect for each.',
  trustSearch: 'Search that fits you',
  trustSearchBody: 'Filter on what actually matters to you, including accessibility.',
  trustVerification: 'Optional verification',
  trustVerificationBody:
    'Add UDID or mobile verification for a trust badge. Only our reviewers see documents.',

  communitiesEyebrow: 'Our communities',
  communitiesTitle: 'One platform.',
  communitiesEmphasis: 'Four communities.',
  communitiesBody:
    'Choose the space that fits you. Each one has the same search, the same privacy controls and the same review process — the difference is the details you can share, not the quality of what you get.',

  howEyebrow: 'How it works',
  howTitle: 'Four steps, at',
  howEmphasis: 'your pace.',
  howStep1: 'Create your profile',
  howStep1Body: 'A guided set-up in ten short steps. Save and return whenever you like.',
  howStep2: 'Set your preferences',
  howStep2Body: 'Tell us the age, places, communities and background you are looking for.',
  howStep3: 'Review your matches',
  howStep3Body: 'See how each profile lines up with the preferences you set, and why.',
  howStep4: 'Talk when you are ready',
  howStep4Body: 'Send an interest. Messaging opens once it is accepted — never before.',

  safetyEyebrow: 'Privacy & safety',
  safetyTitle: 'Your details are yours to',
  safetyEmphasis: 'give away.',
  safetyBody: 'Not ours to publish. Here is exactly how that works in practice.',

  pricingEyebrow: 'Membership',
  pricingTitle: 'Start free.',
  pricingEmphasis: 'Upgrade if it helps.',
  pricingBody: 'Creating a profile, searching and receiving interests never costs anything.',
  pricingFreeTitle: 'Free',
  pricingFreeBody: 'Everything you need to create a profile, search and receive interests.',
  pricingFreePrice: '₹0',
  pricingRecommended: 'Most chosen',
  pricingChoose: 'Choose',
  pricingStartFree: 'Start free',
  pricingUnavailable: 'Plan details are loading. Please check back shortly.',
  pricingDays: 'days',

  ctaTitle: 'Your story deserves a',
  ctaEmphasis: 'considered beginning.',
  ctaBody: 'Create a free profile in a few minutes. You decide what to share, and when.',

  footerTagline: 'Two journeys. One beginning.',
  footerTerms: 'Terms',
  footerPrivacy: 'Privacy',
  footerRefund: 'Refunds',
  footerRights: 'All rights reserved.',
  footerLanguage: 'Language',
};

const kn: LandingCopy = {
  navCommunities: 'ಸಮುದಾಯಗಳು',
  navSafety: 'ಸುರಕ್ಷತೆ',
  navHowItWorks: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
  navPricing: 'ಸದಸ್ಯತ್ವ',
  navMenu: 'ಮೆನು ತೆರೆಯಿರಿ',
  navClose: 'ಮೆನು ಮುಚ್ಚಿ',

  login: 'ಲಾಗಿನ್',
  findMatch: 'ನಿಮ್ಮ ಜೊತೆ ಹುಡುಕಿ',
  createProfile: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ',
  exploreVerified: 'ಪರಿಶೀಲಿತ ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ನೋಡಿ',

  heroEyebrow: 'ಸಮ್ಮತಿಯ ಮೇಲೆ ನಿರ್ಮಿತ, ಎಲ್ಲರನ್ನೂ ಒಳಗೊಂಡ ವಿವಾಹ ವೇದಿಕೆ',
  heroTitleLine1: 'ಎರಡು ಪಯಣ.',
  heroTitleEmphasis: 'ಒಂದು',
  heroTitleLine2: 'ಆರಂಭ.',
  heroBody:
    'ಗೌಪ್ಯತೆ ಇಲ್ಲಿ ಪೂರ್ವನಿಯೋಜಿತ. ಪ್ರತಿ ಪ್ರೊಫೈಲ್ ಅನ್ನು ನಮ್ಮ ತಂಡ ಪರಿಶೀಲಿಸುತ್ತದೆ. ನಿಮ್ಮ ಸಮುದಾಯ ನಿಮ್ಮ ಬಗ್ಗೆ ಒಂದು ಸತ್ಯ — ಅಡಿಟಿಪ್ಪಣಿ ಅಲ್ಲ.',
  heroSignature: 'ಒತ್ತಡವಿಲ್ಲದೆ, ಉದ್ದೇಶದಿಂದ ಭೇಟಿ.',

  trustHeading: 'ನೀವು ನಂಬಬಹುದಾದ ವಿಷಯಗಳು',
  trustVerified: 'ಪರಿಶೀಲಿತ ಪ್ರೊಫೈಲ್‌ಗಳು',
  trustVerifiedBody: 'ಹುಡುಕಾಟದಲ್ಲಿ ಕಾಣುವ ಮೊದಲು ಪ್ರತಿ ಪ್ರೊಫೈಲ್ ಅನ್ನು ನಮ್ಮ ತಂಡ ಪರಿಶೀಲಿಸುತ್ತದೆ.',
  trustPrivacy: 'ಗೌಪ್ಯತೆ ಸಂರಕ್ಷಿತ',
  trustPrivacyBody: 'ನೀವು ನಿರ್ಧರಿಸುವವರೆಗೆ ಫೋಟೋಗಳು ಮಸುಕಾಗಿರುತ್ತವೆ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು ಮರೆಯಾಗಿರುತ್ತವೆ.',
  trustSecure: 'ಸುರಕ್ಷಿತ ಸಂವಾದ',
  trustSecureBody: 'ಇಬ್ಬರೂ ಆಸಕ್ತಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ ನಂತರವೇ ಸಂದೇಶ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ.',
  trustInclusive: 'ನಿಜವಾಗಿಯೂ ಎಲ್ಲರನ್ನೂ ಒಳಗೊಂಡ',
  trustInclusiveBody: 'ನಾಲ್ಕು ಸಮುದಾಯಗಳು, ಒಂದೇ ವೇದಿಕೆ, ಪ್ರತಿಯೊಂದಕ್ಕೂ ಸಮಾನ ಸೌಲಭ್ಯ ಮತ್ತು ಗೌರವ.',
  trustSearch: 'ನಿಮಗೆ ಹೊಂದುವ ಹುಡುಕಾಟ',
  trustSearchBody: 'ನಿಮಗೆ ನಿಜವಾಗಿ ಮುಖ್ಯವಾದುದನ್ನು ಫಿಲ್ಟರ್ ಮಾಡಿ — ಸುಲಭ ಪ್ರವೇಶ ಸೇರಿದಂತೆ.',
  trustVerification: 'ಐಚ್ಛಿಕ ಪರಿಶೀಲನೆ',
  trustVerificationBody: 'UDID ಅಥವಾ ಮೊಬೈಲ್ ಪರಿಶೀಲನೆ ಸೇರಿಸಿ. ದಾಖಲೆಗಳನ್ನು ನಮ್ಮ ಪರಿಶೀಲಕರು ಮಾತ್ರ ನೋಡುತ್ತಾರೆ.',

  communitiesEyebrow: 'ನಮ್ಮ ಸಮುದಾಯಗಳು',
  communitiesTitle: 'ಒಂದೇ ವೇದಿಕೆ.',
  communitiesEmphasis: 'ನಾಲ್ಕು ಸಮುದಾಯ.',
  communitiesBody:
    'ನಿಮಗೆ ಹೊಂದುವ ಸ್ಥಳವನ್ನು ಆರಿಸಿ. ಪ್ರತಿಯೊಂದಕ್ಕೂ ಒಂದೇ ಹುಡುಕಾಟ, ಒಂದೇ ಗೌಪ್ಯತೆ ನಿಯಂತ್ರಣ ಮತ್ತು ಒಂದೇ ಪರಿಶೀಲನಾ ಪ್ರಕ್ರಿಯೆ. ವ್ಯತ್ಯಾಸ ನೀವು ಹಂಚಿಕೊಳ್ಳಬಹುದಾದ ವಿವರಗಳಲ್ಲಿ ಮಾತ್ರ.',

  howEyebrow: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
  howTitle: 'ನಾಲ್ಕು ಹೆಜ್ಜೆ,',
  howEmphasis: 'ನಿಮ್ಮ ವೇಗದಲ್ಲಿ.',
  howStep1: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಿ',
  howStep1Body: 'ಹತ್ತು ಸಣ್ಣ ಹೆಜ್ಜೆಗಳ ಮಾರ್ಗದರ್ಶಿ. ಉಳಿಸಿ, ಯಾವಾಗ ಬೇಕಾದರೂ ಮರಳಿ ಬನ್ನಿ.',
  howStep2: 'ನಿಮ್ಮ ಆದ್ಯತೆ ಹೊಂದಿಸಿ',
  howStep2Body: 'ನೀವು ಹುಡುಕುತ್ತಿರುವ ವಯಸ್ಸು, ಸ್ಥಳ, ಸಮುದಾಯ ಮತ್ತು ಹಿನ್ನೆಲೆ ತಿಳಿಸಿ.',
  howStep3: 'ನಿಮ್ಮ ಜೊತೆಗಳನ್ನು ನೋಡಿ',
  howStep3Body: 'ನಿಮ್ಮ ಆದ್ಯತೆಗಳಿಗೆ ಪ್ರತಿ ಪ್ರೊಫೈಲ್ ಹೇಗೆ ಹೊಂದುತ್ತದೆ ಮತ್ತು ಏಕೆ ಎಂದು ನೋಡಿ.',
  howStep4: 'ಸಿದ್ಧವಾದಾಗ ಮಾತನಾಡಿ',
  howStep4Body: 'ಆಸಕ್ತಿ ಕಳುಹಿಸಿ. ಸ್ವೀಕರಿಸಿದ ನಂತರವೇ ಸಂದೇಶ ತೆರೆಯುತ್ತದೆ — ಮೊದಲು ಎಂದಿಗೂ ಇಲ್ಲ.',

  safetyEyebrow: 'ಗೌಪ್ಯತೆ ಮತ್ತು ಸುರಕ್ಷತೆ',
  safetyTitle: 'ನಿಮ್ಮ ವಿವರಗಳು ನೀವು',
  safetyEmphasis: 'ಹಂಚಿಕೊಳ್ಳುವುದು.',
  safetyBody: 'ನಾವು ಪ್ರಕಟಿಸುವುದಲ್ಲ. ಇದು ಪ್ರಾಯೋಗಿಕವಾಗಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂಬುದು ಇಲ್ಲಿದೆ.',

  pricingEyebrow: 'ಸದಸ್ಯತ್ವ',
  pricingTitle: 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ.',
  pricingEmphasis: 'ಸಹಾಯವಾದರೆ ಅಪ್‌ಗ್ರೇಡ್ ಮಾಡಿ.',
  pricingBody: 'ಪ್ರೊಫೈಲ್ ರಚಿಸುವುದು, ಹುಡುಕುವುದು ಮತ್ತು ಆಸಕ್ತಿ ಸ್ವೀಕರಿಸುವುದು ಯಾವಾಗಲೂ ಉಚಿತ.',
  pricingFreeTitle: 'ಉಚಿತ',
  pricingFreeBody: 'ಪ್ರೊಫೈಲ್ ರಚಿಸಲು, ಹುಡುಕಲು ಮತ್ತು ಆಸಕ್ತಿ ಸ್ವೀಕರಿಸಲು ಬೇಕಾದ ಎಲ್ಲವೂ.',
  pricingFreePrice: '₹0',
  pricingRecommended: 'ಹೆಚ್ಚು ಆಯ್ಕೆಯಾದದ್ದು',
  pricingChoose: 'ಆರಿಸಿ',
  pricingStartFree: 'ಉಚಿತವಾಗಿ ಪ್ರಾರಂಭಿಸಿ',
  pricingUnavailable: 'ಯೋಜನೆಯ ವಿವರಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ. ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಪರಿಶೀಲಿಸಿ.',
  pricingDays: 'ದಿನಗಳು',

  ctaTitle: 'ನಿಮ್ಮ ಕಥೆಗೆ ಅರ್ಹವಾದದ್ದು',
  ctaEmphasis: 'ಚಿಂತನಶೀಲ ಆರಂಭ.',
  ctaBody: 'ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ಉಚಿತ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ. ಏನನ್ನು, ಯಾವಾಗ ಹಂಚಿಕೊಳ್ಳಬೇಕು ಎಂದು ನೀವೇ ನಿರ್ಧರಿಸಿ.',

  footerTagline: 'ಎರಡು ಪಯಣ. ಒಂದು ಆರಂಭ.',
  footerTerms: 'ನಿಯಮಗಳು',
  footerPrivacy: 'ಗೌಪ್ಯತೆ',
  footerRefund: 'ಮರುಪಾವತಿ',
  footerRights: 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
  footerLanguage: 'ಭಾಷೆ',
};

export const LANDING_COPY: Record<Language, LandingCopy> = { en, kn };

/** Language label shown on the toggle — always the OTHER language's own name. */
export const LANGUAGE_SWITCH_LABEL: Record<Language, string> = {
  en: 'ಕನ್ನಡ',
  kn: 'English',
};

/** BCP-47 tag for the `lang` attribute, so screen readers switch voice. */
export const LANGUAGE_TAG: Record<Language, string> = {
  en: 'en',
  kn: 'kn',
};
