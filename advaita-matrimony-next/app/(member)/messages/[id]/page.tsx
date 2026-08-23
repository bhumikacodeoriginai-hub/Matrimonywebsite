import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '../../../../components/member/page-header';
import { MessagesClient } from '../../../../components/member/messages-client';
import { getConversations, getMessages, getMyProfile } from '../../../../lib/api/queries';
import styles from '../../../../components/member/member.module.css';

export const metadata: Metadata = { title: 'Conversation' };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isSafeInteger(id) || id < 1) notFound();

  const [me, conversations, messages] = await Promise.all([
    getMyProfile(),
    getConversations(),
    getMessages(id),
  ]);
  const conversation = conversations?.data.find((item) => item.id === id);
  if (!conversation) notFound();

  return (
    <div className={styles.page}>
      <PageHeader
        title={conversation.other_user.name}
        subtitle="Keep early conversations here until you feel ready to take the next step."
      />
      <MessagesClient
        initialConversations={conversations}
        selectedConversation={conversation}
        initialMessages={messages}
        currentUserId={me.user.id}
      />
    </div>
  );
}
