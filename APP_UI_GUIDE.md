# Advaita Matrimony client UI direction

## Experience promise
Advaita should feel like a calm, premium relationship product—not a directory. Use cinematic editorial imagery, generous whitespace, purposeful motion, and clear trust signals. Every surface must work in English and Kannada.

## Shared product patterns
- **Trust first:** verified badge, approval state, safe contact masking, photo-request state, and community identity are visible before a user acts.
- **Inclusive communities:** General, Divyangjan, Hearing & Speech, and Vitiligo are first-class filters and onboarding choices; none should look like an afterthought.
- **Privacy by default:** blurred photos, request-to-view, watermarking, OTP login, and masked contact details are represented as friendly controls rather than warning-heavy copy.
- **Motion with control:** animated profile rails and transitions are allowed, but every motion surface needs pause behavior and a reduced-motion fallback.
- **Language continuity:** persist `advaita-language` as `en` or `kn` across web and Flutter so a user never has to reselect Kannada after moving between surfaces.

## Flutter handoff
The shared mobile language layer lives in `advaita-matrimony-flutter/lib/localization/app_localizations.dart`. New screens should use `AppStrings.of(context)` for visible labels and `AppLanguageProvider` for the language toggle. The web preview uses the same language key in local storage.

## RFP-aligned demo states
The client walkthrough should show: OTP verification, category selection, advanced search, profile approval, privacy/photo request, a protected contact state, Razorpay/PhonePe plan selection, and a Kannada/English toggle. These are preview states until connected to the API and admin workflows.
