/**
 * Matches — interests that both sides accepted.
 *
 * `GET /interests/mutual` returns rows where the member may be EITHER the sender or
 * the receiver, with both parties eager-loaded, so `otherParty()` picks the right
 * person (see lib/interests.ts).
 *
 * Every match has a conversation, because acceptance is what creates one. The
 * conversation id is not on the interest record, so it is resolved by mapping the
 * member's conversation list by the other user's id — one extra request, and it is
 * what makes the Message button go somewhere real.
 */

import type { Metadata } from 'next';
import { ButtonLink } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/feedback';
import { PageHeader, Pager, ResultBar } from '../../../components/member/page-header';
import { ProfileRow } from '../../../components/profile/profile-card';
import { getConversations, getMutualMatches, getMyProfile } from '../../../lib/api/queries';
import { otherParty } from '../../../lib/interests';
import { metaLine, relativeTime } from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../../lib/enums';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Matches' };

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  const [me, matches, conversations] = await Promise.all([
    getMyProfile(),
    getMutualMatches(page),
    getConversations(1),
  ]);

  /** other user id → conversation id, so Message links go to the real thread. */
  const conversationByUser = new Map<number, number>();
  conversations?.data.forEach((conversation) => {
    conversationByUser.set(conversation.other_user.id, conversation.id);
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Matches"
        subtitle="People who accepted your interest, or whose interest you accepted. You can message each of them."
      />

      {!matches || matches.data.length === 0 ? (
        <EmptyState
          icon="heart"
          title="No matches yet"
          body="A match happens when an interest is accepted by either side. Sending a few is the fastest way to get there."
        >
          <ButtonLink href="/discover">Discover profiles</ButtonLink>
          <ButtonLink href="/interests?tab=received" variant="secondary">
            Check your interests
          </ButtonLink>
        </EmptyState>
      ) : (
        <>
          <ResultBar count={matches.total} label="mutual matches" />

          <ul className={styles.list}>
            {matches.data.map((interest) => {
              const person = otherParty(interest, me.user.id);
              if (!person) return null;
              const conversationId = conversationByUser.get(person.id);

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
                        `matched ${relativeTime(interest.responded_at ?? interest.created_at)}`,
                      ) || 'Matched'
                    }
                    badge={
                      person.profile?.profile_category ? (
                        <Badge tone="neutral">
                          {PROFILE_CATEGORY_LABELS[person.profile.profile_category]}
                        </Badge>
                      ) : undefined
                    }
                    actions={
                      conversationId ? (
                        <ButtonLink
                          href={`/messages/${conversationId}`}
                          variant="accent"
                          size="sm"
                          icon="message"
                        >
                          Message
                        </ButtonLink>
                      ) : (
                        /* The conversation exists but is not on page 1 of the
                           list; send them to Messages rather than guess an id. */
                        <ButtonLink href="/messages" variant="secondary" size="sm" icon="message">
                          Messages
                        </ButtonLink>
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>

          <Pager
            currentPage={matches.current_page}
            lastPage={matches.last_page}
            total={matches.total}
            basePath="/matches"
          />
        </>
      )}
    </div>
  );
}
