/**
 * Discover — every profile matched against the member's saved preferences.
 *
 * Backed by `GET /matches/recommended`, which is the only endpoint that returns a
 * compatibility score. It is not paginated and is capped at 20 server-side, so
 * there is no pager here; "see more" means searching instead, and the page says so.
 */

import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { EmptyState, Note } from '../../../components/ui/feedback';
import { PageHeader, ResultBar } from '../../../components/member/page-header';
import { ProfileCard } from '../../../components/profile/profile-card';
import { getMyProfile, getRecommendations } from '../../../lib/api/queries';
import { SCORE_DISCLOSURE, hasAnyPreference, preferenceGaps } from '../../../lib/compatibility';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Discover' };

export default async function DiscoverPage() {
  const [me, recommendations] = await Promise.all([getMyProfile(), getRecommendations()]);

  const preferences = me.user.partner_preferences;
  const hasPreferences = hasAnyPreference(preferences ?? {});
  const gaps = preferenceGaps(preferences);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Discover"
        subtitle="Profiles matched against the preferences you saved, closest fit first."
        actions={
          <>
            <ButtonLink href="/search" variant="secondary" icon="sliders">
              Advanced search
            </ButtonLink>
            <ButtonLink href="/profile/preferences" variant="ghost" icon="settings">
              Edit preferences
            </ButtonLink>
          </>
        }
      />

      {/* Without saved preferences the score is a hard-coded 50 for everyone, so
          the honest thing is to explain that rather than show a meaningless grid. */}
      {!hasPreferences && (
        <Note icon="alert">
          You have not saved any partner preferences yet, so these profiles are not actually ranked — every
          one scores the same.{' '}
          <a href="/profile/preferences" style={{ fontWeight: 800 }}>
            Set your preferences
          </a>{' '}
          and this page becomes useful.
        </Note>
      )}

      {recommendations.length === 0 ? (
        <EmptyState
          icon="compass"
          title="Nothing matches your preferences right now"
          body={
            hasPreferences
              ? 'This usually means the preferences are narrow. Widening the age range or adding more states tends to help most.'
              : 'We match profiles against the preferences you save. Add yours and this page fills up.'
          }
        >
          <ButtonLink href="/profile/preferences">
            {hasPreferences ? 'Widen your preferences' : 'Set your preferences'}
          </ButtonLink>
          <ButtonLink href="/search" variant="secondary">
            Search all profiles
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <ResultBar count={recommendations.length} label="profiles matched to you" />

          <div className={styles.cardGrid}>
            {recommendations.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} preferences={preferences} index={index} />
            ))}
          </div>

          <Note icon="info">{SCORE_DISCLOSURE}</Note>

          {/* The endpoint caps at 20; do not imply there is a page 2. */}
          <Note icon="search">
            This list shows your closest matches, not every member. Use{' '}
            <a href="/search" style={{ fontWeight: 800 }}>
              advanced search
            </a>{' '}
            to browse everyone.
          </Note>

          {gaps.length > 0 && (
            <Note icon="sliders">
              Adding {gaps[0]!.label.toLowerCase()} to your preferences would make these percentages more
              meaningful.
            </Note>
          )}
        </>
      )}
    </div>
  );
}
