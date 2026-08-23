/**
 * Who viewed my profile.
 *
 * ONE HONEST NOTE ON THE DATA: `ProfileController::viewProfile` records a
 * ProfileView on EVERY call with no de-duplication, so a member who opens your
 * profile three times appears three times. Rather than silently de-duplicate
 * client-side (which would make the count disagree with the total the API reports),
 * the page groups repeat views per member and says how many times.
 *
 * Also worth knowing: `GET /profile/viewers` is currently ungated server-side — it
 * is not restricted to paid plans, whatever the plan comparison implies. We show it
 * to everyone rather than pretending to gate it in the UI, and the discrepancy is
 * recorded in docs/BACKEND_GAPS.md.
 */

import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState, Note } from '../../../components/ui/feedback';
import { PageHeader, Pager, ResultBar } from '../../../components/member/page-header';
import { ProfileRow } from '../../../components/profile/profile-card';
import { getProfileViewers } from '../../../lib/api/queries';
import { metaLine, pluralise, relativeTime } from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../../lib/enums';
import type { ProfileViewRecord } from '../../../lib/api/types';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Who viewed me' };

interface GroupedViewer {
  view: ProfileViewRecord;
  count: number;
}

/** Collapses repeat views per member, keeping the most recent. */
function groupViewers(views: ProfileViewRecord[]): GroupedViewer[] {
  const map = new Map<number, GroupedViewer>();
  for (const view of views) {
    const existing = map.get(view.viewer_id);
    if (existing) {
      existing.count += 1;
      // Keep whichever timestamp is newer.
      if (new Date(view.created_at) > new Date(existing.view.created_at)) existing.view = view;
    } else {
      map.set(view.viewer_id, { view, count: 1 });
    }
  }
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.view.created_at).getTime() - new Date(a.view.created_at).getTime(),
  );
}

export default async function ViewersPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  const viewers = await getProfileViewers(page);
  const grouped = viewers ? groupViewers(viewers.data) : [];

  return (
    <div className={styles.page}>
      <PageHeader title="Who viewed me" subtitle="Members who opened your profile, most recent first." />

      {!viewers || grouped.length === 0 ? (
        <EmptyState
          icon="eye"
          title="No views yet"
          body="Profiles with a photo and a completed introduction are viewed far more often. Both take a couple of minutes."
        >
          <ButtonLink href="/profile/photos">Add a photo</ButtonLink>
          <ButtonLink href="/profile/edit#about" variant="secondary">
            Write your introduction
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <ResultBar count={viewers.total} label="profile views" />

          <ul className={styles.list}>
            {grouped.map(({ view, count }) => (
              <li key={view.viewer_id}>
                <ProfileRow
                  id={view.viewer.id}
                  name={view.viewer.name}
                  photo={view.viewer.primary_photo?.thumbnail_path ?? null}
                  meta={
                    metaLine(
                      view.viewer.profile?.city,
                      view.viewer.profile?.state,
                      relativeTime(view.created_at),
                    ) || relativeTime(view.created_at)
                  }
                  badge={
                    <>
                      {view.viewer.profile?.profile_category && (
                        <Badge tone="neutral">
                          {PROFILE_CATEGORY_LABELS[view.viewer.profile.profile_category]}
                        </Badge>
                      )}
                      {/* Repeat views are interesting, so they are surfaced
                          rather than quietly merged away. */}
                      {count > 1 && <Badge tone="accent">{pluralise(count, 'view')}</Badge>}
                    </>
                  }
                />
              </li>
            ))}
          </ul>

          <Pager
            currentPage={viewers.current_page}
            lastPage={viewers.last_page}
            total={viewers.total}
            basePath="/viewers"
          />

          <Note icon="info">
            The total counts every visit, so a member who opened your profile more than once is grouped here
            with a view count.
          </Note>
        </>
      )}
    </div>
  );
}
