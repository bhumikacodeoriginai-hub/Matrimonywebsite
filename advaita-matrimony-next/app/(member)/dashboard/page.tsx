/**
 * Member dashboard — a personal matchmaking home.
 *
 * EVERY NUMBER ON THIS PAGE COMES FROM THE API. The previous version of this
 * screen showed "146 profile views", "12 shortlisted", three hard-coded people and
 * a 68% completion bar, none of which existed. All of it is gone.
 *
 * Where the API cannot answer a question, the section says so plainly instead of
 * inventing a figure. Two examples, both visible in the UI:
 *
 *  • "Who shortlisted you" — there is no endpoint. `GET /shortlist` returns the
 *    people YOU saved, not the people who saved you. The tile explains that rather
 *    than showing a number.
 *  • "Recently joined" — there is no created-at ordering available. `GET /search`
 *    always orders by `last_active_at`, so the section is honestly labelled
 *    "Recently active" instead.
 *
 * A Server Component. All the data is fetched here, in parallel, and only the
 * genuinely interactive pieces (cards, interest buttons) are client components.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '../../../components/ui/button';
import { Alert, EmptyState, Note } from '../../../components/ui/feedback';
import { Badge, VerifiedBadge } from '../../../components/ui/badge';
import { Icon } from '../../../components/ui/icon';
import { ProgressBar, ProgressRing } from '../../../components/ui/progress';
import { StatTile } from '../../../components/ui/metric';
import { ProfileCard, ProfileRow } from '../../../components/profile/profile-card';
import { InterestActions } from '../../../components/dashboard/interest-actions';
import {
  getMutualMatches,
  getMyProfile,
  getProfileViewers,
  getReceivedInterests,
  getRecommendations,
  getMySubscription,
  searchProfiles,
} from '../../../lib/api/queries';
import { otherParty, pendingReceived } from '../../../lib/interests';
import { strengthActions, strengthLabel, visibilityNotice } from '../../../lib/profile-strength';
import { hasAnyPreference, preferenceGaps, SCORE_DISCLOSURE } from '../../../lib/compatibility';
import {
  firstName,
  formatCount,
  greeting,
  metaLine,
  parseUsage,
  pluralise,
  relativeTime,
} from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../../lib/enums';
import styles from '../../../components/dashboard/dashboard.module.css';

export const metadata: Metadata = { title: 'Home' };

export default async function DashboardPage() {
  /**
   * Everything in parallel. Sequentially these would stack into a visible delay,
   * and each one is independent.
   *
   * `getMyProfile` is the only call allowed to throw — without it there is no
   * dashboard. The rest resolve to null/empty and their sections degrade.
   */
  const [me, recommendations, received, viewers, matches, subscription, recentlyActive] = await Promise.all([
    getMyProfile(),
    getRecommendations(),
    getReceivedInterests(1),
    getProfileViewers(1),
    getMutualMatches(1),
    getMySubscription(),
    // No "recently joined" ordering exists; /search always sorts by last activity.
    searchProfiles({ recently_active: true, with_photo: true, per_page: 8 }),
  ]);

  const preferences = me.user.partner_preferences;
  const actions = strengthActions(me);
  const notice = visibilityNotice(me);
  const gaps = preferenceGaps(preferences);
  const pending = received ? pendingReceived(received.data) : [];

  const completion = me.profile_completion;
  const viewerTotal = viewers?.total ?? 0;
  const interestTotal = received?.total ?? 0;
  const matchTotal = matches?.total ?? 0;

  return (
    <div className={styles.page}>
      {/* ==================== Welcome ==================== */}
      <section className={styles.welcome} aria-labelledby="welcome-heading">
        <div className={`${styles.welcomeGlow} motion-decoration`} aria-hidden="true" />

        <div className={styles.welcomeCopy}>
          <h1 id="welcome-heading" className={styles.greeting}>
            {greeting()}, <em>{firstName(me.user.name)}</em>
          </h1>

          <p className={styles.welcomeLine}>
            {recommendations.length > 0
              ? `We found ${pluralise(recommendations.length, 'profile')} matching the preferences you saved.`
              : hasAnyPreference(preferences ?? {})
                ? 'No new matches right now. Widening your age range or adding more states usually helps.'
                : 'Set your partner preferences and we can start matching profiles to them.'}
          </p>

          <div className={styles.welcomeActions}>
            <ButtonLink href="/discover" variant="premium" trailingIcon="arrow-right">
              Discover profiles
            </ButtonLink>
            {actions.length > 0 && (
              <ButtonLink href={actions[0]!.href} variant="secondary">
                {actions[0]!.label}
              </ButtonLink>
            )}
          </div>
        </div>

        <div className={styles.welcomeRing}>
          <ProgressRing value={completion} size={116} aria-label="Profile completeness" />
          <p className={styles.welcomeRingCaption}>Profile {strengthLabel(completion)}</p>
        </div>
      </section>

      {/* Profile visibility: the single most important thing to tell a new member. */}
      {notice.tone !== 'live' && (
        <Alert
          tone={notice.tone === 'pending' ? 'warning' : 'error'}
          title={
            notice.tone === 'pending' ? 'Your profile is being reviewed' : 'Your profile needs attention'
          }
        >
          {notice.message}
        </Alert>
      )}

      {/* ==================== Main split ==================== */}
      <div className={styles.split}>
        {/* ---------- Left column ---------- */}
        <div className={styles.column}>
          {/* -------- Daily recommendations -------- */}
          <section className={styles.section} aria-labelledby="recommendations-heading">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <h2 id="recommendations-heading" className={styles.sectionTitle}>
                  Matched to your preferences
                </h2>
                <p className={styles.sectionSubtitle}>
                  Ordered by how closely each profile fits what you saved.
                </p>
              </div>
              <Link href="/discover" className="text-brand" style={{ fontWeight: 700, fontSize: 13 }}>
                See all →
              </Link>
            </div>

            {recommendations.length === 0 ? (
              <EmptyState
                icon="compass"
                title="No matches yet"
                body={
                  hasAnyPreference(preferences ?? {})
                    ? 'Nothing fits your current preferences. Try widening your age range, or adding more states.'
                    : 'We match profiles against the preferences you save. Add yours and this fills up.'
                }
              >
                <ButtonLink href="/profile/preferences">Set your preferences</ButtonLink>
                <ButtonLink href="/search" variant="secondary">
                  Search instead
                </ButtonLink>
              </EmptyState>
            ) : (
              <>
                <div className={`${styles.cardGrid} ${styles.cardRail}`}>
                  {recommendations.slice(0, 6).map((profile, index) => (
                    <ProfileCard key={profile.id} profile={profile} preferences={preferences} index={index} />
                  ))}
                </div>

                {/* The disclosure sits with the scores it explains. */}
                <Note icon="info">{SCORE_DISCLOSURE}</Note>
              </>
            )}
          </section>

          {/* -------- Interests awaiting a reply -------- */}
          <section className={styles.section} aria-labelledby="interests-heading">
            <div className={styles.sectionHead}>
              <div className={styles.sectionTitleGroup}>
                <h2 id="interests-heading" className={styles.sectionTitle}>
                  Interests waiting for you
                </h2>
                <p className={styles.sectionSubtitle}>Accepting one opens a conversation between you.</p>
              </div>
              {pending.length > 0 && (
                <Badge tone="accent" size="lg">
                  {formatCount(pending.length)} waiting
                </Badge>
              )}
            </div>

            {pending.length === 0 ? (
              <EmptyState
                icon="sparkle"
                title="Nothing waiting right now"
                body="When someone sends you an interest it appears here, and you decide whether to open a conversation."
              >
                <ButtonLink href="/interests" variant="secondary">
                  See all interests
                </ButtonLink>
              </EmptyState>
            ) : (
              <ul className={styles.list}>
                {pending.slice(0, 4).map((interest) => {
                  const person = otherParty(interest, me.user.id);
                  if (!person) return null;
                  return (
                    <li key={interest.id}>
                      <ProfileRow
                        id={person.id}
                        name={person.name}
                        photo={person.primary_photo?.thumbnail_path ?? null}
                        meta={
                          metaLine(
                            person.profile?.city,
                            person.profile?.occupation,
                            relativeTime(interest.created_at),
                          ) || relativeTime(interest.created_at)
                        }
                        badge={
                          person.profile?.profile_category ? (
                            <Badge tone="neutral">
                              {PROFILE_CATEGORY_LABELS[person.profile.profile_category]}
                            </Badge>
                          ) : undefined
                        }
                        actions={<InterestActions interestId={interest.id} senderName={person.name} />}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* -------- Recently active -------- */}
          {recentlyActive && recentlyActive.data.length > 0 && (
            <section className={styles.section} aria-labelledby="recent-heading">
              <div className={styles.sectionHead}>
                <div className={styles.sectionTitleGroup}>
                  <h2 id="recent-heading" className={styles.sectionTitle}>
                    Recently active
                  </h2>
                  {/*
                    Deliberately NOT "Recently joined": /search has no created-at
                    ordering, it always sorts by last activity. Naming it
                    accurately costs nothing and claiming otherwise would be false.
                  */}
                  <p className={styles.sectionSubtitle}>
                    Members who have been on Advaita in the last few days.
                  </p>
                </div>
              </div>

              <div className={`${styles.cardGrid} ${styles.cardRail}`}>
                {recentlyActive.data.slice(0, 4).map((profile, index) => (
                  /* No score here: /search does not return match_score, so a
                     badge would be fabricated. `preferences` is left null. */
                  <ProfileCard key={profile.id} profile={profile} preferences={null} index={index} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------- Right rail ---------- */}
        <div className={styles.column}>
          {/* -------- Profile strength -------- */}
          <section className={styles.railCard} aria-labelledby="strength-heading">
            <div className={styles.railCardHead}>
              <h2 id="strength-heading" className={styles.railCardTitle}>
                Profile strength
              </h2>
              <Badge tone={completion >= 70 ? 'verified' : 'pending'}>{strengthLabel(completion)}</Badge>
            </div>

            <ProgressBar
              value={completion}
              label="Completeness"
              tone={completion >= 70 ? 'verified' : 'brand'}
            />

            {actions.length === 0 ? (
              <Note icon="check-circle">Nothing outstanding. Your profile has everything we ask for.</Note>
            ) : (
              <ul className={styles.list}>
                {actions.slice(0, 3).map((action) => (
                  <li key={action.id}>
                    <Link href={action.href} className={styles.action}>
                      <span
                        className={[
                          styles.actionIcon,
                          action.priority === 'critical'
                            ? styles.actionCritical
                            : action.priority === 'high'
                              ? styles.actionHigh
                              : styles.actionMedium,
                        ].join(' ')}
                        aria-hidden="true"
                      >
                        <Icon name={action.priority === 'critical' ? 'alert' : 'plus'} />
                      </span>
                      <span className={styles.actionText}>
                        <span className={styles.actionLabel}>{action.label}</span>
                        <span className={styles.actionBenefit}>{action.benefit}</span>
                      </span>
                      <span className={styles.actionChevron} aria-hidden="true">
                        <Icon name="chevron-right" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* -------- Performance -------- */}
          <section className={styles.section} aria-labelledby="performance-heading">
            <h2 id="performance-heading" className={styles.railCardTitle}>
              Your activity
            </h2>

            <div className={styles.statGrid}>
              {/* Real totals from the paginators. No invented deltas: the API
                  exposes no historical comparison, so `delta` is never passed. */}
              <StatTile
                label="Profile views"
                value={viewerTotal}
                icon="eye"
                tone="brand"
                footnote="All time"
              />
              <StatTile
                label="Interests received"
                value={interestTotal}
                icon="sparkle"
                tone="accent"
                footnote="All time"
              />
              <StatTile label="Mutual matches" value={matchTotal} icon="heart" tone="verified" />
              <StatTile label="Profile complete" value={completion} suffix="%" icon="user" tone="premium" />
            </div>

            {/*
              "Who shortlisted you" is a requested metric with no endpoint behind
              it: GET /shortlist returns the people the MEMBER saved, not the
              members who saved them. Rather than omit it silently or invent a
              number, the gap is stated.
            */}
            <div className={styles.unavailable}>
              <p className={styles.unavailableTitle}>
                <Icon name="star" />
                Who shortlisted you
              </p>
              <p className={styles.unavailableBody}>
                Not available yet — we can see the profiles you have saved, but not who has saved you. It is
                on the list.
              </p>
            </div>
          </section>

          {/* -------- Who viewed me -------- */}
          <section className={styles.railCard} aria-labelledby="viewers-heading">
            <div className={styles.railCardHead}>
              <h2 id="viewers-heading" className={styles.railCardTitle}>
                Who viewed you
              </h2>
              <Link href="/viewers" style={{ fontSize: 12, fontWeight: 700 }}>
                All
              </Link>
            </div>

            {!viewers || viewers.data.length === 0 ? (
              <Note icon="eye">
                No views yet. Profiles with a photo and a completed introduction get looked at far more.
              </Note>
            ) : (
              <ul className={styles.list}>
                {viewers.data.slice(0, 4).map((view) => (
                  <li key={view.id}>
                    <ProfileRow
                      id={view.viewer.id}
                      name={view.viewer.name}
                      photo={view.viewer.primary_photo?.thumbnail_path ?? null}
                      meta={
                        metaLine(view.viewer.profile?.city, relativeTime(view.created_at)) ||
                        relativeTime(view.created_at)
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* -------- Preference gaps -------- */}
          {gaps.length > 0 && (
            <section className={styles.railCard} aria-labelledby="gaps-heading">
              <div className={styles.railCardHead}>
                <h2 id="gaps-heading" className={styles.railCardTitle}>
                  Improve your matches
                </h2>
              </div>
              <p className={styles.sectionSubtitle}>
                Your match percentages are calculated from these. Each one you add makes them more meaningful.
              </p>
              <ul className={styles.list}>
                {gaps.slice(0, 3).map((gap) => (
                  <li key={String(gap.field)}>
                    <Link href="/profile/preferences" className={styles.action}>
                      <span className={`${styles.actionIcon} ${styles.actionMedium}`} aria-hidden="true">
                        <Icon name="sliders" />
                      </span>
                      <span className={styles.actionText}>
                        <span className={styles.actionLabel}>{gap.label}</span>
                        <span className={styles.actionBenefit}>{gap.benefit}</span>
                      </span>
                      <span className={styles.actionChevron} aria-hidden="true">
                        <Icon name="chevron-right" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* -------- Membership -------- */}
          {subscription?.has_subscription ? (
            <section className={styles.planCard} aria-labelledby="plan-heading">
              <div className={styles.railCardHead}>
                <h2 id="plan-heading" className={styles.planName}>
                  {subscription.data.package_name}
                </h2>
                <Badge tone="premium" icon="crown">
                  Active
                </Badge>
              </div>

              <p className={styles.sectionSubtitle}>
                {subscription.data.days_remaining} days remaining · renews nothing automatically
              </p>

              <div className={styles.usageList}>
                {(
                  [
                    ['Contacts viewed', subscription.data.usage.contacts],
                    ['Interests sent', subscription.data.usage.interests],
                    ['Messages', subscription.data.usage.messages],
                  ] as const
                ).map(([label, raw]) => {
                  const { used, limit } = parseUsage(raw);
                  return (
                    <div key={label} className={styles.usageRow}>
                      <p className={styles.usageLabel}>
                        <span>{label}</span>
                        <span className={styles.usageValue}>
                          {limit === null ? `${used} · unlimited` : raw}
                        </span>
                      </p>
                      {limit !== null && limit > 0 && (
                        <ProgressBar
                          value={(used / limit) * 100}
                          size="slim"
                          valueText={null}
                          tone={used / limit > 0.85 ? 'danger' : 'premium'}
                          aria-label={`${label}: ${raw}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <ButtonLink href="/subscription" variant="secondary" size="sm" block>
                Manage membership
              </ButtonLink>
            </section>
          ) : (
            <section className={styles.railCard} aria-labelledby="upgrade-heading">
              <div className={styles.railCardHead}>
                <h2 id="upgrade-heading" className={styles.railCardTitle}>
                  Free membership
                </h2>
                <VerifiedBadge
                  basis={me.user.phone_verified_at ? 'Mobile number verified' : 'Not yet verified'}
                />
              </div>
              <p className={styles.sectionSubtitle}>
                Searching, receiving interests and messaging your matches are all included. A paid plan adds
                contact visibility and higher interest limits.
              </p>
              <ButtonLink href="/subscription" variant="premium" size="sm" block trailingIcon="arrow-right">
                Compare plans
              </ButtonLink>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
