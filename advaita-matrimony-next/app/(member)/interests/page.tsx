/**
 * Interests — received and sent.
 *
 * Tabs are LINKS driven by `?tab=`, not client state, so the view is shareable and
 * survives a reload. See components/ui/tabs.tsx for why that matters.
 *
 * A received interest is the one place in the product where accepting has a real
 * consequence: it is the only action that creates a conversation. The page says so.
 */

import type { Metadata } from 'next';
import { Badge } from '../../../components/ui/badge';
import { ButtonLink } from '../../../components/ui/button';
import { EmptyState, Note } from '../../../components/ui/feedback';
import { TabLinks } from '../../../components/ui/tabs';
import { PageHeader, Pager, ResultBar } from '../../../components/member/page-header';
import { ProfileRow } from '../../../components/profile/profile-card';
import { InterestActions } from '../../../components/dashboard/interest-actions';
import { getMyProfile, getReceivedInterests, getSentInterests } from '../../../lib/api/queries';
import { otherParty } from '../../../lib/interests';
import { metaLine, relativeTime } from '../../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../../lib/enums';
import type { InterestStatus } from '../../../lib/api/types';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Interests' };

const STATUS_LABEL: Record<InterestStatus, string> = {
  pending: 'Waiting for a reply',
  accepted: 'Accepted',
  rejected: 'Declined',
};

const STATUS_TONE: Record<InterestStatus, 'pending' | 'verified' | 'neutral'> = {
  pending: 'pending',
  accepted: 'verified',
  rejected: 'neutral',
};

export default async function InterestsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'sent' ? 'sent' : 'received';
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  const [me, received, sent] = await Promise.all([
    getMyProfile(),
    getReceivedInterests(tab === 'received' ? page : 1),
    getSentInterests(tab === 'sent' ? page : 1),
  ]);

  const active = tab === 'received' ? received : sent;
  const pendingCount = received?.data.filter((item) => item.status === 'pending').length ?? 0;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Interests"
        subtitle="Accepting an interest is what opens a conversation between you — nothing else does."
      />

      <TabLinks
        label="Interest direction"
        activeHref={tab === 'sent' ? '/interests?tab=sent' : '/interests?tab=received'}
        items={[
          {
            href: '/interests?tab=received',
            label: 'Received',
            icon: 'sparkle',
            count: pendingCount,
            alert: pendingCount > 0,
          },
          { href: '/interests?tab=sent', label: 'Sent', icon: 'send', count: sent?.total ?? 0 },
        ]}
      />

      {!active || active.data.length === 0 ? (
        tab === 'received' ? (
          <EmptyState
            icon="sparkle"
            title="No interests yet"
            body="When someone sends you an interest it appears here. A completed profile with a photo receives noticeably more."
          >
            <ButtonLink href="/profile/edit">Complete your profile</ButtonLink>
            <ButtonLink href="/discover" variant="secondary">
              Discover profiles
            </ButtonLink>
          </EmptyState>
        ) : (
          <EmptyState
            icon="send"
            title="You have not sent any interests"
            body="Sending an interest is how a conversation starts. It costs nothing, and they simply accept or decline."
          >
            <ButtonLink href="/discover">Find someone to message</ButtonLink>
          </EmptyState>
        )
      ) : (
        <>
          <ResultBar
            count={active.total}
            label={tab === 'received' ? 'interests received' : 'interests sent'}
          />

          <ul className={styles.list}>
            {active.data.map((interest) => {
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
                        relativeTime(interest.responded_at ?? interest.created_at),
                      ) || relativeTime(interest.created_at)
                    }
                    badge={
                      <>
                        {person.profile?.profile_category && (
                          <Badge tone="neutral">
                            {PROFILE_CATEGORY_LABELS[person.profile.profile_category]}
                          </Badge>
                        )}
                        <Badge tone={STATUS_TONE[interest.status]}>{STATUS_LABEL[interest.status]}</Badge>
                      </>
                    }
                    actions={
                      /* Only a received, still-pending interest is actionable. */
                      tab === 'received' && interest.status === 'pending' ? (
                        <InterestActions interestId={interest.id} senderName={person.name} />
                      ) : interest.status === 'accepted' ? (
                        <ButtonLink href="/messages" variant="secondary" size="sm" icon="message">
                          Messages
                        </ButtonLink>
                      ) : undefined
                    }
                  />

                  {/* The sender's note, when they left one. */}
                  {interest.message?.trim() && (
                    <p
                      style={{
                        margin: 'var(--space-2) 0 0 var(--space-5)',
                        paddingInlineStart: 'var(--space-4)',
                        borderInlineStart: '2px solid var(--border-strong)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-sm)',
                        lineHeight: 'var(--leading-relaxed)',
                      }}
                    >
                      “{interest.message.trim()}”
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <Pager
            currentPage={active.current_page}
            lastPage={active.last_page}
            total={active.total}
            basePath="/interests"
            query={`tab=${tab}`}
          />
        </>
      )}

      {tab === 'sent' && (
        <Note icon="info">
          There is no way to withdraw an interest once it is sent. If you would rather not be contacted, you
          can block the member from their profile.
        </Note>
      )}
    </div>
  );
}
