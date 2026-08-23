/**
 * Another member's profile.
 *
 * ⚠️ THIS ROUTE HAS A SIDE EFFECT. `GET /profiles/{userId}` records a ProfileView
 * on every single call, with no de-duplication server-side. So:
 *   • it must never be prefetched or called speculatively, and
 *   • `dynamic = 'force-dynamic'` is required — a cached render would silently
 *     stop registering views, or replay someone else's.
 *
 * PRIVACY: the endpoint returns the entire profiles row, including the member's
 * UDID certificate number, document path, disability percentage and precise
 * coordinates. Rendering goes through `buildProfileSections`, which is the gate
 * that keeps those out of the DOM — see lib/profile-display.ts.
 */

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ButtonLink } from '../../../../components/ui/button';
import {
  Badge,
  CategoryBadge,
  PremiumBadge,
  StatusDot,
  VerifiedBadge,
} from '../../../../components/ui/badge';
import { Alert, Note } from '../../../../components/ui/feedback';
import { Icon } from '../../../../components/ui/icon';
import { Chip } from '../../../../components/ui/badge';
import { PhotoGallery } from '../../../../components/profile/private-photo';
import { ProfileActions } from '../../../../components/profile/profile-actions';
import { getMyProfile, getPublicProfile, getSentInterests } from '../../../../lib/api/queries';
import { buildProfileSections } from '../../../../lib/profile-display';
import { ApiError } from '../../../../lib/api/client';
import { formatPhone, isMaskedPhone, metaLine } from '../../../../lib/format';
import styles from '../../../../components/profile/profile-detail.module.css';

/** Member profiles must never be indexed. */
export const metadata: Metadata = {
  title: 'Profile',
  robots: { index: false, follow: false },
};

/** Required: this route mutates state (records a view) on every request. */
export const dynamic = 'force-dynamic';

export default async function ProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Numeric ids only — anything else is a 404 rather than an upstream error.
  if (!/^\d+$/.test(id)) notFound();

  let profileData;
  try {
    profileData = await getPublicProfile(id);
  } catch (error) {
    if (error instanceof ApiError && (error.isNotFound || error.isForbidden)) {
      notFound();
    }
    throw error;
  }

  const [me, sent] = await Promise.all([getMyProfile(), getSentInterests(1)]);

  const profile = profileData.profile;
  const sections = buildProfileSections(profile, profileData.profile_category);

  /**
   * Has an interest already been sent? Checked against the first page of sent
   * interests only — the API has no "did I send to this user" endpoint, so this is
   * accurate for recent activity and simply falls back to showing the button
   * (which then resolves to "already sent" on a 409) for older ones.
   */
  const alreadySent = sent?.data.some((interest) => interest.receiver_id === profileData.id) ?? false;

  const contactVisible = profileData.contact_visible;
  const phoneMasked = isMaskedPhone(profileData.phone);

  return (
    <div className={styles.page}>
      <Link href="/discover" style={{ fontSize: 13, fontWeight: 700, display: 'inline-flex', gap: 6 }}>
        <Icon name="chevron-left" /> Back to discover
      </Link>

      <div className={styles.top}>
        {/* -------- Gallery -------- */}
        <PhotoGallery photos={profileData.photos} memberId={profileData.id} memberName={profileData.name} />

        {/* -------- Summary -------- */}
        <div className={styles.summary}>
          <div className={styles.identity}>
            <div className={styles.badges}>
              <CategoryBadge category={profileData.profile_category} />
              {profileData.is_premium && <PremiumBadge />}
              {/*
                The API exposes no blanket "identity verified" flag, so the badge
                names its real basis rather than implying a full ID check.
              */}
              <VerifiedBadge basis="Profile reviewed and approved by our team" />
            </div>

            <h1 className={styles.name}>
              {profileData.name}
              {profileData.age !== null && `, ${profileData.age}`}
            </h1>

            <p className={styles.subline}>
              {metaLine(profile.occupation, profile.city, profile.state) || profileData.category_display}
            </p>

            <p className={styles.uniqueId}>
              {profileData.unique_id} · <StatusDot state="offline" label={profileData.last_active} />
            </p>
          </div>

          {/* Sticky on desktop, fixed above the tab bar on mobile. */}
          <ProfileActions
            memberId={profileData.id}
            memberName={profileData.name}
            interestSent={alreadySent}
          />

          {/* -------- Fast facts -------- */}
          <div className={styles.facts}>
            {[
              { icon: 'ruler' as const, label: 'Height', value: profile.height_cm },
              { icon: 'graduation' as const, label: 'Education', value: profile.highest_education },
              { icon: 'pin' as const, label: 'Location', value: metaLine(profile.city, profile.state) },
              { icon: 'globe' as const, label: 'Mother tongue', value: profile.mother_tongue },
            ]
              .filter((fact) => fact.value)
              .map((fact) => (
                <div key={fact.label} className={styles.fact}>
                  <p className={styles.factLabel}>
                    <Icon name={fact.icon} />
                    {fact.label}
                  </p>
                  <p className={styles.factValue}>
                    {fact.label === 'Height'
                      ? // Height needs formatting; the rest are already strings.
                        (buildHeight(profile.height_cm) ?? '—')
                      : String(fact.value)}
                  </p>
                </div>
              ))}
          </div>

          {/* -------- Contact -------- */}
          <div className={styles.contactCard}>
            <p className={styles.factLabel}>
              <Icon name="phone" />
              Contact details
            </p>

            {contactVisible && !phoneMasked ? (
              <>
                <div className={styles.contactRow}>
                  <span className={styles.contactValue}>+91 {formatPhone(profileData.phone)}</span>
                  <ButtonLink href={`tel:+91${profileData.phone}`} variant="secondary" size="sm" icon="phone">
                    Call
                  </ButtonLink>
                </div>
                {profileData.email && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactValue}>{profileData.email}</span>
                  </div>
                )}
                <Note icon="shield">
                  Please be respectful with these details. Sharing them elsewhere breaks our terms.
                </Note>
              </>
            ) : (
              <>
                <div className={styles.contactRow}>
                  <span className={`${styles.contactValue} ${styles.contactMasked}`}>
                    {formatPhone(profileData.phone)}
                  </span>
                  <Badge tone="premium" icon="lock">
                    Hidden
                  </Badge>
                </div>
                <p className={styles.safetyText}>
                  Contact details are shown to members on a paid plan. You can still send an interest and
                  message each other once it is accepted — that never costs anything.
                </p>
                <ButtonLink href="/subscription" variant="premium" size="sm" trailingIcon="arrow-right">
                  See plans
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>

      {/* -------- Sections -------- */}
      <div className={styles.sections}>
        {sections.length === 0 ? (
          <Alert tone="info" title="This profile is still being filled in">
            {profileData.name} has not added much yet. Sending an interest is still the best way to start.
          </Alert>
        ) : (
          sections.map((section) => (
            <section key={section.id} id={section.id} className={styles.section}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon} aria-hidden="true">
                  <Icon name={section.icon} />
                </span>
                {section.title}
              </h2>

              {section.prose && <p className={styles.prose}>{section.prose}</p>}

              {section.rows.length > 0 && (
                <dl className={styles.rows}>
                  {section.rows.map((entry) => (
                    <div key={entry.key} className={styles.row}>
                      <dt className={styles.rowKey}>{entry.key}</dt>
                      <dd className={styles.rowValue}>{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {section.tags && section.tags.length > 0 && (
                <div className={styles.tags}>
                  {section.tags.map((tag) => (
                    <Chip key={tag}>{tag}</Chip>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>

      {/* -------- Safety footer -------- */}
      <div className={styles.safetyRow}>
        <p className={styles.safetyText}>
          Advaita never asks members for money, and neither should anyone here. Meet in a public place, tell
          someone where you are going, and take your time. If something feels wrong, block them and email
          safety@advaitamatrimony.com.
        </p>
        <ButtonLink href="/help" variant="secondary" size="sm" icon="life-buoy">
          Safety guidance
        </ButtonLink>
      </div>

      {/* The viewer's own id is needed by nothing on this page, but fetching the
          profile confirms the session is healthy before we show actions. */}
      <span className="sr-only">Viewing as {me.user.name}</span>
    </div>
  );
}

/** Local helper so the fast-facts block stays readable. */
function buildHeight(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const cm = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(cm) || cm <= 0) return null;
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  const display = inches === 12 ? `${feet + 1}'0"` : `${feet}'${inches}"`;
  return `${display} · ${Math.round(cm)} cm`;
}
