'use client';

/**
 * The public landing page.
 *
 * A Client Component because the whole surface responds to the language toggle.
 * Everything expensive stays out of it: no images, no video, no charting, no
 * animation library. The only JavaScript that does real work is the pointer
 * parallax in `HeroVisual` and the reveal observer mounted once by the root layout.
 *
 * REAL DATA: the membership section renders `GET /packages` — actual plan names,
 * prices, discounts and feature lists from the database, fetched on the server and
 * passed in. When the API is unreachable it says so rather than showing invented
 * prices. There are no hard-coded plans anywhere in this file.
 *
 * NO FABRICATED SOCIAL PROOF: the previous version claimed "10,000+ verified
 * profiles" and "500+ happy marriages". There is no endpoint that reports either
 * number, so both are gone. Nothing on this page states a figure we cannot source.
 */

import { ButtonLink } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icon, type IconName } from '../ui/icon';
import { Reveal, Enter } from '../ui/reveal';
import { SectionHeading } from '../ui/card';
import { Note } from '../ui/feedback';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { HeroVisual } from './hero-visual';
import { useLanguage } from './language-provider';
import { PROFILE_CATEGORY_DESCRIPTIONS, PROFILE_CATEGORY_LABELS } from '../../lib/enums';
import { formatRupees } from '../../lib/format';
import type { ProfileCategory, SubscriptionPackage } from '../../lib/api/types';
import styles from './landing.module.css';

export interface LandingPageProps {
  /** From `GET /packages`. Empty when the API could not be reached. */
  packages: SubscriptionPackage[];
  /** Server-side "everything is free" flag, also from `GET /packages`. */
  freeMode: boolean;
}

const COMMUNITY_ORDER: ProfileCategory[] = [
  'general',
  'physically_challenged',
  'hearing_speech_impaired',
  'vitiligo_skin_condition',
];

const COMMUNITY_ICONS: Record<ProfileCategory, IconName> = {
  general: 'users',
  physically_challenged: 'accessibility',
  hearing_speech_impaired: 'hand',
  vitiligo_skin_condition: 'sparkle',
};

export function LandingPage({ packages, freeMode }: LandingPageProps) {
  const { copy, language } = useLanguage();

  const trustItems: { icon: IconName; iconClass: string; title: string; body: string }[] = [
    {
      icon: 'shield-check',
      iconClass: styles.trustIconVerified,
      title: copy.trustVerified,
      body: copy.trustVerifiedBody,
    },
    {
      icon: 'lock',
      iconClass: styles.trustIconPrivacy,
      title: copy.trustPrivacy,
      body: copy.trustPrivacyBody,
    },
    {
      icon: 'message',
      iconClass: styles.trustIconAccent,
      title: copy.trustSecure,
      body: copy.trustSecureBody,
    },
    {
      icon: 'accessibility',
      iconClass: styles.trustIconPrivacy,
      title: copy.trustInclusive,
      body: copy.trustInclusiveBody,
    },
    {
      icon: 'sliders',
      iconClass: styles.trustIconAccent,
      title: copy.trustSearch,
      body: copy.trustSearchBody,
    },
    {
      icon: 'shield',
      iconClass: styles.trustIconPremium,
      title: copy.trustVerification,
      body: copy.trustVerificationBody,
    },
  ];

  const steps = [
    { title: copy.howStep1, body: copy.howStep1Body },
    { title: copy.howStep2, body: copy.howStep2Body },
    { title: copy.howStep3, body: copy.howStep3Body },
    { title: copy.howStep4, body: copy.howStep4Body },
  ];

  /**
   * Safety claims. Every one of these describes behaviour that exists in the
   * codebase — photo blurring, watermarking, admin approval, interest-gated chat,
   * contact masking, UDID review. Nothing aspirational is listed as though shipped.
   */
  const safetyItems: { icon: IconName; title: string; body: string }[] = [
    {
      icon: 'eye-off',
      title: 'Photos blurred by default',
      body: 'New photos are visible only to members, and you can require an approved request for each one.',
    },
    {
      icon: 'image',
      title: 'Automatic watermarking',
      body: 'Every uploaded photo is watermarked, which makes it far harder to reuse elsewhere.',
    },
    {
      icon: 'shield-check',
      title: 'Every profile reviewed',
      body: 'A person on our team approves each profile before it becomes searchable.',
    },
    {
      icon: 'phone',
      title: 'Contact details masked',
      body: 'Your number is hidden until you have a membership that shares it, and never shown to guests.',
    },
    {
      icon: 'message',
      title: 'Chat only after consent',
      body: 'Messaging unlocks when an interest is accepted. Nobody can message you out of the blue.',
    },
    {
      icon: 'ban',
      title: 'Block anyone, instantly',
      body: 'A blocked member cannot see your profile, view your photos or reach you again.',
    },
  ];

  return (
    <main id="main" className={styles.page} lang={language}>
      {/* Two decorative layers, removed under reduced motion and forced colours. */}
      <div className="aurora motion-decoration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="grain motion-decoration" aria-hidden="true" />

      <SiteHeader />

      {/* ================= Hero ================= */}
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Enter as="span" index={0} className={styles.eyebrow}>
              <span className={`${styles.eyebrowDot} motion-decoration`} aria-hidden="true" />
              {copy.heroEyebrow}
            </Enter>

            <Enter as="h1" index={1}>
              <span id="hero-title" className={styles.heroTitle}>
                {copy.heroTitleLine1}
                <br />
                <em className="shimmer">{copy.heroTitleEmphasis}</em> {copy.heroTitleLine2}
              </span>
            </Enter>

            <Enter index={2} className={styles.signature}>
              <span className={styles.signatureRule} aria-hidden="true">
                <span className={styles.signatureDot} />
              </span>
              <p className={styles.signatureText}>{copy.heroSignature}</p>
            </Enter>

            <Enter as="p" index={3} className={styles.heroBody}>
              {copy.heroBody}
            </Enter>

            <Enter index={4} className={styles.heroActions}>
              <ButtonLink href="/register" size="lg" trailingIcon="arrow-right" pip>
                {copy.createProfile}
              </ButtonLink>
              <ButtonLink href="/login" size="lg" variant="secondary" icon="search">
                {copy.findMatch}
              </ButtonLink>
            </Enter>

            <Enter index={5} className={styles.heroSecondaryActions}>
              {/* Browsing profiles requires an account — every profile route is
                  behind auth. The link says so instead of promising a preview
                  that would immediately redirect to sign-in. */}
              <a href="#communities" className={styles.textLink}>
                <Icon name="users" />
                {copy.exploreVerified}
              </a>
              <Badge tone="verified" icon="shield-check">
                {copy.trustVerified}
              </Badge>
            </Enter>
          </div>

          <Enter index={3} variant="fade">
            <HeroVisual />
          </Enter>
        </div>
      </section>

      {/* ================= Trust ================= */}
      <section className={styles.trustSection} aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          {copy.trustHeading}
        </h2>
        <div className={styles.trustGrid}>
          {trustItems.map((item, index) => (
            <Reveal key={item.title} index={index} className={styles.trustCard}>
              <span className={`${styles.trustIcon} ${item.iconClass}`} aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <h3 className={styles.trustTitle}>{item.title}</h3>
              <p className={styles.trustBody}>{item.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= Communities ================= */}
      <section id="communities" className={`${styles.section} ${styles.sectionAlt} defer-paint`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            overline={copy.communitiesEyebrow}
            title={
              <>
                {copy.communitiesTitle} <em>{copy.communitiesEmphasis}</em>
              </>
            }
            description={copy.communitiesBody}
          />

          <div className={styles.communityGrid}>
            {COMMUNITY_ORDER.map((category, index) => (
              <Reveal
                key={category}
                index={index}
                as="div"
                className={[styles.communityCard, index === 0 ? styles.communityCardFeature : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {/* The whole card is a link to registration, where the community
                    is chosen in step one. */}
                <span className={styles.communityIcon} aria-hidden="true">
                  <Icon name={COMMUNITY_ICONS[category]} />
                </span>
                <h3 className={styles.communityName}>{PROFILE_CATEGORY_LABELS[category]}</h3>
                <p className={styles.communityBody}>{PROFILE_CATEGORY_DESCRIPTIONS[category]}</p>
                <span className={styles.communityCta}>
                  {copy.createProfile}
                  <Icon name="arrow-right" />
                </span>
                {/* Stretched link: one accessible name for the whole tile. */}
                <a
                  href={`/register?community=${category}`}
                  aria-label={`${copy.createProfile} — ${PROFILE_CATEGORY_LABELS[category]}`}
                  className="inset"
                  style={{ borderRadius: 'inherit' }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= How it works ================= */}
      <section id="how-it-works" className={`${styles.section} defer-paint`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            overline={copy.howEyebrow}
            title={
              <>
                {copy.howTitle} <em>{copy.howEmphasis}</em>
              </>
            }
          />

          <ol className={styles.stepGrid}>
            {steps.map((step, index) => (
              <Reveal key={step.title} as="li" index={index} className={styles.stepCard}>
                <span className={styles.stepNumber} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= Safety ================= */}
      <section id="safety" className={`${styles.section} ${styles.sectionAlt} defer-paint`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            overline={copy.safetyEyebrow}
            title={
              <>
                {copy.safetyTitle} <em>{copy.safetyEmphasis}</em>
              </>
            }
            description={copy.safetyBody}
          />

          <div className={styles.safetyGrid}>
            {safetyItems.map((item, index) => (
              <Reveal key={item.title} index={index} className={styles.safetyCard}>
                <span className={`${styles.trustIcon} ${styles.trustIconPrivacy}`} aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <h3 className={styles.safetyTitle}>{item.title}</h3>
                <p className={styles.safetyBody}>{item.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Membership ================= */}
      <section id="membership" className={`${styles.section} defer-paint`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            overline={copy.pricingEyebrow}
            title={
              <>
                {copy.pricingTitle} <em>{copy.pricingEmphasis}</em>
              </>
            }
            description={copy.pricingBody}
          />

          <div className={styles.pricingGrid}>
            {/* Free tier is not a database row — it is the absence of a
                subscription — so it is described here rather than fetched. */}
            <Reveal index={0} className={styles.planCard}>
              <h3 className={styles.planName}>{copy.pricingFreeTitle}</h3>
              <div className={styles.planPriceRow}>
                <span className={styles.planPrice}>{copy.pricingFreePrice}</span>
              </div>
              <p className={styles.planBody}>{copy.pricingFreeBody}</p>
              <ul className={styles.planFeatures}>
                {[
                  'Create and edit your profile',
                  'Search and filter profiles',
                  'Receive and accept interests',
                  'Chat with accepted matches',
                ].map((feature) => (
                  <li key={feature} className={styles.planFeature}>
                    <span className={styles.planFeatureIcon} aria-hidden="true">
                      <Icon name="check" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/register" variant="secondary" block>
                {copy.pricingStartFree}
              </ButtonLink>
            </Reveal>

            {packages.map((plan, index) => (
              <Reveal
                key={plan.id}
                index={index + 1}
                className={[styles.planCard, plan.is_popular ? styles.planCardFeatured : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {plan.is_popular && (
                  <span className={styles.planBadge}>
                    <Badge tone="premium" icon="crown">
                      {copy.pricingRecommended}
                    </Badge>
                  </span>
                )}

                <h3 className={styles.planName}>{plan.name}</h3>

                <div className={styles.planPriceRow}>
                  <span className={styles.planPrice}>{formatRupees(plan.effective_price)}</span>
                  <span className={styles.planPeriod}>
                    / {plan.duration_days} {copy.pricingDays}
                  </span>
                  {plan.discounted_price !== null && plan.discount_percentage > 0 && (
                    <>
                      <span className={styles.planWas}>{formatRupees(plan.price)}</span>
                      <span className={styles.planSave}>{plan.discount_percentage}% off</span>
                    </>
                  )}
                </div>

                {plan.description && <p className={styles.planBody}>{plan.description}</p>}

                <ul className={styles.planFeatures}>
                  {plan.features.map((feature) => (
                    <li key={feature} className={styles.planFeature}>
                      <span className={styles.planFeatureIcon} aria-hidden="true">
                        <Icon name="check" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Checkout needs an account, so the CTA goes to registration and
                    carries the chosen plan through. */}
                <ButtonLink
                  href={`/register?plan=${plan.slug}`}
                  variant={plan.is_popular ? 'premium' : 'secondary'}
                  block
                >
                  {copy.pricingChoose} {plan.name}
                </ButtonLink>
              </Reveal>
            ))}
          </div>

          {packages.length === 0 && <Note icon="info">{copy.pricingUnavailable}</Note>}

          {freeMode && (
            <Note icon="sparkle">Every paid feature is currently open to all members at no cost.</Note>
          )}
        </div>
      </section>

      {/* ================= Final CTA ================= */}
      <section className={styles.section} style={{ paddingTop: 0 }}>
        <Reveal className={styles.finalCta} direction="scale">
          <h2 className={styles.finalCtaTitle}>
            {copy.ctaTitle} <em>{copy.ctaEmphasis}</em>
          </h2>
          <p className={styles.finalCtaBody}>{copy.ctaBody}</p>
          <div className={styles.finalCtaActions}>
            <ButtonLink href="/register" size="lg" variant="premium" trailingIcon="arrow-right">
              {copy.createProfile}
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              {copy.login}
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <SiteFooter />
    </main>
  );
}
