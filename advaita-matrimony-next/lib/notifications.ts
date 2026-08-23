/**
 * Notification feed.
 *
 * ⚠️ THERE IS NO NOTIFICATIONS ENDPOINT. The API has no notifications table, no
 * feed route, no read/unread state, and no push transport (`ChatController` has a
 * `// TODO: Send push notification` and nothing more).
 *
 * Rather than ship a fake bell with invented items, this module DERIVES a feed
 * from data that genuinely exists:
 *
 *   • received interests   → "sent you an interest" / "accepted your interest"
 *   • profile viewers      → "viewed your profile"
 *   • unread chat count    → "unread messages"
 *   • own profile status   → "profile approved" / "needs changes"
 *
 * Consequences the UI must be honest about, and is:
 *   • No per-item read state. "Unseen" is computed against a timestamp we keep in
 *     localStorage per device, so it will not follow the member across devices.
 *     The notification centre says so.
 *   • No real-time delivery. The badge refreshes on navigation and on a slow
 *     poll, not instantly.
 *   • Photo-access requests cannot appear at all — there is no endpoint to list
 *     them (only to create one).
 *
 * Building the real thing needs a server-side notifications table plus FCM/web
 * push. It is specified in docs/BACKEND_GAPS.md.
 */

import type { InterestRecord, ProfileViewRecord, ProfileStatus } from './api/types';
import { otherParty } from './interests';

export type NotificationKind =
  'interest_received' | 'interest_accepted' | 'profile_viewed' | 'messages_unread' | 'profile_status';

export interface DerivedNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** ISO timestamp used for ordering and unseen calculation. */
  timestamp: string;
  href: string;
  /** Relative photo path for the avatar, when a person is involved. */
  photo: string | null;
  /** Actionable notifications get a primary button in the centre. */
  actionable: boolean;
}

const STORAGE_KEY = 'advaita:notifications-seen-at';

/** Reads the per-device "last seen" marker. Returns epoch 0 when never set. */
export function lastSeenAt(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : 0;
    return Number.isFinite(parsed) ? parsed : 0;
  } catch {
    // Private mode / storage disabled — everything simply reads as seen.
    return 0;
  }
}

export function markAllSeen(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // Non-fatal.
  }
}

export function countUnseen(notifications: DerivedNotification[], seenAt: number): number {
  return notifications.filter((item) => new Date(item.timestamp).getTime() > seenAt).length;
}

export interface FeedInput {
  myUserId: number;
  receivedInterests: InterestRecord[];
  sentInterests: InterestRecord[];
  viewers: ProfileViewRecord[];
  unreadMessages: number;
  profileStatus: ProfileStatus;
  profileStatusChangedAt: string | null;
}

/** Builds the ordered feed. Newest first. */
export function buildFeed(input: FeedInput): DerivedNotification[] {
  const items: DerivedNotification[] = [];

  for (const interest of input.receivedInterests) {
    if (interest.status !== 'pending') continue;
    const person = otherParty(interest, input.myUserId);
    if (!person) continue;
    items.push({
      id: `interest-received-${interest.id}`,
      kind: 'interest_received',
      title: `${person.name} sent you an interest`,
      body: interest.message?.trim() || 'Open their profile to reply.',
      timestamp: interest.created_at,
      href: '/interests?tab=received',
      photo: person.primary_photo?.thumbnail_path ?? null,
      actionable: true,
    });
  }

  // An interest I sent that has since been accepted — chat is now open.
  for (const interest of input.sentInterests) {
    if (interest.status !== 'accepted') continue;
    const person = otherParty(interest, input.myUserId);
    if (!person) continue;
    items.push({
      id: `interest-accepted-${interest.id}`,
      kind: 'interest_accepted',
      title: `${person.name} accepted your interest`,
      body: 'You can message each other now.',
      timestamp: interest.responded_at ?? interest.created_at,
      href: '/messages',
      photo: person.primary_photo?.thumbnail_path ?? null,
      actionable: true,
    });
  }

  for (const view of input.viewers) {
    items.push({
      id: `view-${view.id}`,
      kind: 'profile_viewed',
      title: `${view.viewer.name} viewed your profile`,
      body:
        [view.viewer.profile?.city, view.viewer.profile?.state].filter(Boolean).join(', ') || 'Profile view',
      timestamp: view.created_at,
      href: '/viewers',
      photo: view.viewer.primary_photo?.thumbnail_path ?? null,
      actionable: false,
    });
  }

  if (input.unreadMessages > 0) {
    items.push({
      id: 'messages-unread',
      kind: 'messages_unread',
      title: `${input.unreadMessages} unread message${input.unreadMessages === 1 ? '' : 's'}`,
      body: 'Pick up where your conversations left off.',
      // Synthetic "now": this is a live count, not a historical event, so it
      // always sorts to the top and is never treated as stale.
      timestamp: new Date().toISOString(),
      href: '/messages',
      photo: null,
      actionable: true,
    });
  }

  if (input.profileStatus === 'approved' && input.profileStatusChangedAt) {
    items.push({
      id: 'profile-approved',
      kind: 'profile_status',
      title: 'Your profile is approved',
      body: 'You are now visible to members who match your preferences.',
      timestamp: input.profileStatusChangedAt,
      href: '/profile',
      photo: null,
      actionable: false,
    });
  }

  if (input.profileStatus === 'rejected' && input.profileStatusChangedAt) {
    items.push({
      id: 'profile-rejected',
      kind: 'profile_status',
      title: 'Your profile needs a few changes',
      body: 'Our review team has asked for an update before it goes live.',
      timestamp: input.profileStatusChangedAt,
      href: '/profile/edit',
      photo: null,
      actionable: true,
    });
  }

  return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Copy for the notification centre's own disclosure. */
export const FEED_DISCLOSURE =
  'Built from your interests, profile views and messages. Read state is stored on this device only, and updates when you open the app rather than instantly.';
