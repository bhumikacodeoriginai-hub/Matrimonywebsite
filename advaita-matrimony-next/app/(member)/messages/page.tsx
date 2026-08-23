import type { Metadata } from 'next';
import { PageHeader } from '../../../components/member/page-header';
import { MessagesClient } from '../../../components/member/messages-client';
import { getConversations, getMyProfile } from '../../../lib/api/queries';
import styles from '../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Messages' };

export default async function MessagesPage() {
  const [me, conversations] = await Promise.all([getMyProfile(), getConversations()]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Messages"
        subtitle="Private conversations with members where interest has been accepted by both of you."
      />
      <MessagesClient initialConversations={conversations} currentUserId={me.user.id} />
    </div>
  );
}
