/**
 * Helpers for interest records.
 *
 * `GET /interests/mutual` returns accepted interests where the member may be
 * EITHER the sender or the receiver, with both sides eager-loaded. Picking "the
 * other person" is therefore the client's job — this is that job, in one place,
 * so no screen gets it subtly wrong.
 */

import type { InterestRecord, UserSummary } from './api/types';
import { ageFromDate } from './format';

/** The person on the other side of an interest, from `myUserId`'s point of view. */
export function otherParty(interest: InterestRecord, myUserId: number): UserSummary | null {
  if (interest.sender_id === myUserId) return interest.receiver ?? null;
  if (interest.receiver_id === myUserId) return interest.sender ?? null;
  // Defensive: if ids do not line up, prefer whichever side is present.
  return interest.receiver ?? interest.sender ?? null;
}

/** True when the member initiated this interest. */
export function didISend(interest: InterestRecord, myUserId: number): boolean {
  return interest.sender_id === myUserId;
}

/**
 * Flattens a `UserSummary` into the fields cards need.
 * `UserSummary` carries `date_of_birth` rather than a computed age, unlike the
 * discovery card shape — so age is derived here.
 */
export function summaryToCard(summary: UserSummary): {
  id: number;
  name: string;
  uniqueId: string;
  age: number | null;
  photo: string | null;
  city: string | null;
  state: string | null;
  occupation: string | null;
  education: string | null;
  category: UserSummary['profile'] extends null ? null : string | null;
} {
  return {
    id: summary.id,
    name: summary.name,
    uniqueId: summary.unique_id,
    age: ageFromDate(summary.date_of_birth),
    photo: summary.primary_photo?.thumbnail_path ?? null,
    city: summary.profile?.city ?? null,
    state: summary.profile?.state ?? null,
    occupation: summary.profile?.occupation ?? null,
    education: summary.profile?.highest_education ?? null,
    category: summary.profile?.profile_category ?? null,
  };
}

/** Interests still awaiting the member's decision. */
export function pendingReceived(interests: InterestRecord[]): InterestRecord[] {
  return interests.filter((interest) => interest.status === 'pending');
}
