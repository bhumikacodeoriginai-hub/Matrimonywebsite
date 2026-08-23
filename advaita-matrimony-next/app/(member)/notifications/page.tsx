import type { Metadata } from 'next';
import { PageHeader } from '../../../components/member/page-header';
import { NotificationsClient } from '../../../components/member/notifications-client';
import {
  getMyProfile,
  getProfileViewers,
  getReceivedInterests,
  getSentInterests,
  getUnreadCount,
} from '../../../lib/api/queries';
import { buildFeed } from '../../../lib/notifications';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Notifications' };

export default async function NotificationsPage() {
  const [me, received, sent, viewers, unread] = await Promise.all([
    getMyProfile(),
    getReceivedInterests(1),
    getSentInterests(1),
    getProfileViewers(1),
    getUnreadCount(),
  ]);

  const items = buildFeed({
    myUserId: me.user.id,
    receivedInterests: received?.data ?? [],
    sentInterests: sent?.data ?? [],
    viewers: viewers?.data ?? [],
    unreadMessages: unread,
    profileStatus: me.user.profile_status,
    profileStatusChangedAt: null,
  });

  return (
    <div className={styles.page}>
      <PageHeader
        title="Notifications"
        subtitle="A clear view of the activity that matters, without invented social proof or noisy prompts."
      />
      <NotificationsClient items={items} />
    </div>
  );
}
