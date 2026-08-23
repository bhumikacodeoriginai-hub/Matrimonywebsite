/**
 * Shortlisted — profiles the member saved.
 *
 * `GET /shortlist` is an inline route closure returning a paginator of shortlist
 * rows with the saved user eager-loaded. Note the direction: this is who YOU saved.
 * There is no endpoint for who saved you, which the dashboard states openly rather
 * than implying otherwise.
 */

import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState, Note } from '../../../components/ui/feedback';
import { PageHeader, Pager, ResultBar } from '../../../components/member/page-header';
import { ProfileRow } from '../../../components/profile/profile-card';
import { ShortlistRemoveButton } from '../../../components/member/shortlist-remove-button';
import { getShortlist } from '../../../lib/api/queries';
import { ageFromDate, metaLine } from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../../lib/enums';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Shortlisted' };

export default async function ShortlistedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  const shortlist = await getShortlist(page);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Shortlisted"
        subtitle="Profiles you saved to come back to. Only you can see this list."
      />

      {!shortlist || shortlist.data.length === 0 ? (
        <EmptyState
          icon="star"
          title="Nothing shortlisted yet"
          body="Tap the star on any profile to save it here. It is private — the member is never told."
        >
          <ButtonLink href="/discover">Discover profiles</ButtonLink>
        </EmptyState>
      ) : (
        <>
          <ResultBar count={shortlist.total} label="profiles saved" />

          <ul className={styles.list}>
            {shortlist.data.map((entry) => {
              const person = entry.profile;
              if (!person) return null;
              const age = ageFromDate(person.date_of_birth);

              return (
                <li key={entry.id}>
                  <ProfileRow
                    id={person.id}
                    name={age ? `${person.name}, ${age}` : person.name}
                    photo={person.primary_photo?.thumbnail_path ?? null}
                    meta={
                      metaLine(person.profile?.city, person.profile?.state, person.unique_id) ||
                      person.unique_id
                    }
                    badge={
                      person.profile?.profile_category ? (
                        <Badge tone="neutral">
                          {PROFILE_CATEGORY_LABELS[person.profile.profile_category]}
                        </Badge>
                      ) : undefined
                    }
                    actions={<ShortlistRemoveButton userId={person.id} name={person.name} />}
                  />
                </li>
              );
            })}
          </ul>

          <Pager
            currentPage={shortlist.current_page}
            lastPage={shortlist.last_page}
            total={shortlist.total}
            basePath="/shortlisted"
          />
        </>
      )}

      <Note icon="lock">
        Shortlisting is completely private. The member is not notified, and it does not appear anywhere on
        their profile.
      </Note>
    </div>
  );
}
