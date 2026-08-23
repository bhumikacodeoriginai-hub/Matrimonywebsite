'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { EmptyState, Note } from '../ui/feedback';
import { Icon, type IconName } from '../ui/icon';
import { countUnseen, lastSeenAt, markAllSeen, type DerivedNotification } from '../../lib/notifications';
import { relativeTime } from '../../lib/format';
import styles from './account.module.css';

const ICONS: Record<DerivedNotification['kind'], IconName> = {
  interest_received: 'sparkle',
  interest_accepted: 'heart-filled',
  profile_viewed: 'eye',
  messages_unread: 'message',
  profile_status: 'shield-check',
};

export function NotificationsClient({ items }: { items: DerivedNotification[] }) {
  const [seenAt, setSeenAt] = useState(0);

  useEffect(() => {
    setSeenAt(lastSeenAt());
    markAllSeen();
  }, []);

  const unseen = countUnseen(items, seenAt);

  return (
    <div className={styles.stack}>
      {unseen > 0 && (
        <div className={styles.panelHeader}>
          <Badge tone="accent">{unseen} new on this device</Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSeenAt(Date.now());
              markAllSeen();
            }}
          >
            Mark all seen
          </Button>
        </div>
      )}

      {items.length === 0 ? (
        <div className={styles.panel}>
          <EmptyState
            icon="bell"
            title="Nothing new yet"
            body="When someone sends you an interest, views your profile or accepts a connection, it will appear here."
          >
            <Link href="/discover" className="text-brand">
              Discover profiles
            </Link>
          </EmptyState>
        </div>
      ) : (
        <ul className={styles.notificationList}>
          {items.map((item) => {
            const isNew = seenAt > 0 && new Date(item.timestamp).getTime() > seenAt;
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={[styles.notification, isNew ? styles.notificationNew : '']
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className={styles.notificationIcon} aria-hidden="true">
                    {item.photo ? (
                      <Avatar src={item.photo} name="" size="sm" decorative />
                    ) : (
                      <Icon name={ICONS[item.kind]} />
                    )}
                  </span>
                  <span>
                    <span className={styles.notificationTitle}>
                      {isNew && <span className={styles.dot} aria-hidden="true" />}
                      {item.title}
                    </span>
                    <span className={styles.notificationBody}>{item.body}</span>
                  </span>
                  <time className={styles.notificationTime} dateTime={item.timestamp}>
                    {relativeTime(item.timestamp)}
                  </time>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Note icon="info">
        This centre is derived from real interests, profile views and unread messages. The API does not yet
        have a server notification feed, read state or push delivery, so the read marker is stored on this
        device only.
      </Note>
    </div>
  );
}
