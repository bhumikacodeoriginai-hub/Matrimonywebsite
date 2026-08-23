'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/avatar';
import { ButtonLink } from '../ui/button';
import { EmptyState, Note } from '../ui/feedback';
import { Icon } from '../ui/icon';
import { fetchConversations, fetchMessages, sendMessage } from '../../lib/api/actions';
import { usePoll } from '../../lib/hooks/use-poll';
import { attachmentUrl, photoUrl } from '../../lib/api/media';
import { dayLabel, formatClock, relativeTime } from '../../lib/format';
import type { ConversationSummary, MessageRecord, Paginated } from '../../lib/api/types';
import styles from './messages.module.css';

interface MessagesClientProps {
  initialConversations: Paginated<ConversationSummary> | null;
  selectedConversation?: ConversationSummary | null;
  initialMessages?: Paginated<MessageRecord> | null;
  currentUserId: number;
}

function orderedMessages(data: MessageRecord[] | undefined): MessageRecord[] {
  return [...(data ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function MessagesClient({
  initialConversations,
  selectedConversation = null,
  initialMessages = null,
  currentUserId,
}: MessagesClientProps) {
  const [conversations, setConversations] = useState(initialConversations?.data ?? []);
  const [messages, setMessages] = useState(orderedMessages(initialMessages?.data));
  const [messageDraft, setMessageDraft] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedId = selectedConversation?.id ?? null;

  const refreshConversations = useCallback(async () => {
    const result = await fetchConversations();
    if (result) setConversations(result.data);
  }, []);

  const refreshMessages = useCallback(async () => {
    if (!selectedId) return;
    const result = await fetchMessages(selectedId);
    if (result) {
      setMessages(orderedMessages(result.data));
      setError(null);
    } else {
      setError('Messages could not be refreshed. We will try again shortly.');
    }
  }, [selectedId]);

  useEffect(() => {
    setMessages(orderedMessages(initialMessages?.data));
    setMessageDraft('');
    setAttachment(null);
    setError(null);
  }, [initialMessages, selectedId]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, selectedId]);

  usePoll(refreshConversations, 20_000, true);
  usePoll(refreshMessages, 8_000, Boolean(selectedId));

  const selectedFromList = useMemo(
    () =>
      conversations.find((conversation) => conversation.id === selectedId) ?? selectedConversation ?? null,
    [conversations, selectedConversation, selectedId],
  );

  const handleAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.startsWith('audio/')) {
      setError('Please attach an image or audio file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Attachments must be smaller than 10 MB.');
      return;
    }
    setAttachment(file);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId || (!messageDraft.trim() && !attachment) || sending) return;

    setSending(true);
    setError(null);
    const result = await sendMessage(selectedId, { body: messageDraft, attachment });
    setSending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessages((current) => [...current, result.data]);
    setMessageDraft('');
    setAttachment(null);
    await refreshConversations();
  };

  const list =
    conversations.length > 0 ? (
      <div className={styles.conversationList} aria-label="Your conversations">
        {conversations.map((conversation) => {
          const person = conversation.other_user;
          const active = conversation.id === selectedId;
          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className={[styles.conversationLink, active ? styles.conversationActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Avatar src={person.photo} name={person.name} size="md" decorative />
              <span className={styles.conversationCopy}>
                <span className={styles.conversationName}>
                  {person.name}
                  {person.is_online && <span className="sr-only">, online</span>}
                </span>
                <span className={styles.conversationPreview}>
                  {conversation.last_message?.body ??
                    (conversation.last_message?.type === 'image' ? 'Photo' : 'Conversation started')}
                </span>
              </span>
              <span>
                <span className={styles.conversationTime}>
                  {conversation.last_message?.time ?? relativeTime(conversation.updated_at)}
                </span>
                {conversation.unread_count > 0 && (
                  <span className={styles.unread} aria-label={`${conversation.unread_count} unread`}>
                    {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    ) : (
      <div className={styles.emptyPanel}>
        <EmptyState
          icon="message"
          title="Your conversations will appear here"
          body="Accept an interest to open a private conversation. We only show messages created through that connection."
        >
          <ButtonLink href="/discover" variant="secondary">
            Discover profiles
          </ButtonLink>
        </EmptyState>
      </div>
    );

  return (
    <div className={styles.messagesLayout} data-has-thread={selectedId ? 'true' : 'false'}>
      <section className={`${styles.panel} ${styles.listPanel}`} aria-label="Conversations">
        {list}
      </section>

      <section className={`${styles.panel} ${styles.threadPanel}`} aria-label="Conversation">
        {selectedFromList ? (
          <div className={styles.thread}>
            <header className={styles.conversationHeader}>
              <Link href="/messages" className={styles.backLink} aria-label="Back to conversations">
                <Icon name="chevron-left" />
              </Link>
              <Avatar
                src={photoUrl(selectedFromList.other_user.photo)}
                name={selectedFromList.other_user.name}
                size="md"
                decorative
              />
              <div className={styles.conversationHeaderCopy}>
                <h2 className={styles.conversationHeaderName}>{selectedFromList.other_user.name}</h2>
                <p className={styles.conversationHeaderStatus}>
                  {selectedFromList.other_user.is_online
                    ? 'Online now'
                    : selectedFromList.other_user.last_active
                      ? `Last active ${selectedFromList.other_user.last_active}`
                      : 'Private conversation'}
                </p>
              </div>
            </header>

            <div className={styles.messageScroll} ref={scrollRef} aria-live="polite">
              {messages.length === 0 ? (
                <EmptyState
                  icon="sparkle"
                  title="Start with something real"
                  body={`Say hello to ${selectedFromList.other_user.name}. Keep early conversations on Advaita until trust is established.`}
                />
              ) : (
                messages.map((message, index) => {
                  const mine = message.sender_id === currentUserId;
                  const previous = messages[index - 1];
                  const showDay = !previous || dayLabel(previous.created_at) !== dayLabel(message.created_at);
                  const attachmentHref = attachmentUrl(message.attachment_path);
                  return (
                    <div key={message.id}>
                      {showDay && <div className={styles.dayDivider}>{dayLabel(message.created_at)}</div>}
                      <div
                        className={[styles.bubbleRow, mine ? styles.bubbleRowMine : '']
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <article
                          className={[styles.bubble, mine ? styles.bubbleMine : ''].filter(Boolean).join(' ')}
                        >
                          {message.body && <p className={styles.messageText}>{message.body}</p>}
                          {attachmentHref && (
                            <a
                              className={styles.attachment}
                              href={attachmentHref}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Icon name={message.type === 'audio' ? 'mic' : 'image'} />
                              {message.type === 'audio' ? 'Listen to audio' : 'Open image'}
                            </a>
                          )}
                          <time className={styles.messageMeta} dateTime={message.created_at}>
                            {formatClock(message.created_at)}
                            {mine && (message.is_read ? ' · Seen' : ' · Sent')}
                          </time>
                        </article>
                      </div>
                    </div>
                  );
                })
              )}
              {error && <Note icon="alert">{error}</Note>}
            </div>

            <form className={styles.composer} onSubmit={handleSubmit}>
              <label className={styles.iconButton} aria-label="Attach an image or audio file">
                <Icon name="paperclip" />
                <input
                  type="file"
                  accept="image/*,audio/*"
                  onChange={handleAttachment}
                  style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
                />
              </label>
              <textarea
                className={styles.composerInput}
                value={messageDraft}
                onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setMessageDraft(event.target.value)}
                placeholder="Write a thoughtful message…"
                aria-label="Message"
                rows={1}
                maxLength={2000}
              />
              <button
                className={styles.sendButton}
                type="submit"
                disabled={sending || (!messageDraft.trim() && !attachment)}
              >
                <span className="sendLabel">Send</span>
                <span className="sr-only">Send message</span>
              </button>
              <p className={styles.composerHint}>
                {attachment ? `${attachment.name} attached · ` : ''}No typing indicator or instant delivery
                yet — this screen checks for new messages periodically.
              </p>
            </form>
          </div>
        ) : (
          <div className={styles.emptyPanel}>
            <EmptyState
              icon="message"
              title="A calmer way to connect"
              body="Choose a conversation to pick up where you left off. Every chat here began with a mutual interest."
            >
              <ButtonLink href="/interests" variant="secondary">
                Review interests
              </ButtonLink>
            </EmptyState>
          </div>
        )}
      </section>
    </div>
  );
}
