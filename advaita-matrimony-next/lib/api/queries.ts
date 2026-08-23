/**
 * Server-side data loaders.
 *
 * One function per real endpoint, each documenting the envelope it unwraps
 * (the API is inconsistent about this — see lib/api/types.ts).
 *
 * SERVER-ONLY: imports lib/api/server.ts → lib/auth/session.ts → next/headers.
 * Client Components must use lib/api/actions.ts instead.
 */

import { publicFetch, serverFetch, serverFetchOptional } from './server';
import type {
  ApiSuccess,
  ConversationSummary,
  FilterOptions,
  InterestRecord,
  MessageRecord,
  MyProfileResponse,
  MySubscriptionResponse,
  PackagesResponse,
  Paginated,
  PaymentRecord,
  ProfileCardData,
  ProfileViewRecord,
  PublicProfileResponse,
  SearchFilters,
  SubscriptionPackage,
  UserSummary,
} from './types';

/* ==========================================================================
   Profile
   ========================================================================== */

/** `GET /profile/me` → `{ success, data: { user, profile_completion } }` */
export async function getMyProfile(): Promise<MyProfileResponse> {
  const response = await serverFetch<ApiSuccess<MyProfileResponse>>('/profile/me');
  return response.data;
}

/** Same, but null instead of throwing — for panels that may degrade. */
export async function getMyProfileOptional(): Promise<MyProfileResponse | null> {
  const response = await serverFetchOptional<ApiSuccess<MyProfileResponse>>('/profile/me');
  return response?.data ?? null;
}

/**
 * `GET /profiles/{userId}` → `{ success, data }`
 *
 * Side effect: the server records a ProfileView on EVERY call, with no
 * de-duplication. Do not call this speculatively (prefetch, hover preview) or
 * you will inflate the other member's "who viewed me" list.
 */
export async function getPublicProfile(userId: number | string): Promise<PublicProfileResponse> {
  const response = await serverFetch<ApiSuccess<PublicProfileResponse>>(`/profiles/${userId}`);
  return response.data;
}

/** `GET /profile/viewers` → `{ success, data: Paginated<ProfileViewRecord> }` */
export async function getProfileViewers(page = 1): Promise<Paginated<ProfileViewRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<ProfileViewRecord>>>('/profile/viewers', {
    query: { page },
  });
  return response?.data ?? null;
}

/* ==========================================================================
   Discovery
   ========================================================================== */

/**
 * `GET /matches/recommended` → `{ success, data: ProfileCardData[] }`
 *
 * NOT paginated — a plain array, capped at 20 server-side. `match_score` is
 * rule-based preference matching, never AI.
 */
export async function getRecommendations(): Promise<ProfileCardData[]> {
  const response = await serverFetchOptional<ApiSuccess<ProfileCardData[]>>('/matches/recommended');
  return response?.data ?? [];
}

/**
 * `GET /search` → `{ success, data: Paginated<ProfileCardData> }`
 *
 * Results carry NO `match_score`, so compatibility badges must not be rendered
 * for search output.
 */
export async function searchProfiles(filters: SearchFilters): Promise<Paginated<ProfileCardData> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<ProfileCardData>>>('/search', {
    query: filters as Record<string, string | number | boolean | undefined | (string | number)[]>,
  });
  return response?.data ?? null;
}

/** `GET /search/by-id?profile_id=ADV-XXXXXXXX` → `{ success, data }` or 404. */
export async function findProfileById(profileId: string): Promise<Partial<ProfileCardData> | null> {
  const response = await serverFetchOptional<ApiSuccess<Partial<ProfileCardData>>>('/search/by-id', {
    query: { profile_id: profileId },
  });
  return response?.data ?? null;
}

/** `GET /shortlist` → `{ success, data: Paginated<...> }` (inline route closure). */
export async function getShortlist(
  page = 1,
): Promise<Paginated<{ id: number; profile: UserSummary }> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<{ id: number; profile: UserSummary }>>>(
    '/shortlist',
    { query: { page } },
  );
  return response?.data ?? null;
}

/* ==========================================================================
   Interests
   ========================================================================== */

export async function getReceivedInterests(page = 1): Promise<Paginated<InterestRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<InterestRecord>>>('/interests/received', {
    query: { page },
  });
  return response?.data ?? null;
}

export async function getSentInterests(page = 1): Promise<Paginated<InterestRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<InterestRecord>>>('/interests/sent', {
    query: { page },
  });
  return response?.data ?? null;
}

/**
 * `GET /interests/mutual` — accepted interests where the member is EITHER side,
 * with both `sender` and `receiver` loaded. The caller must pick "the other
 * person" by comparing ids; `otherParty()` in lib/interests.ts does that.
 */
export async function getMutualMatches(page = 1): Promise<Paginated<InterestRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<InterestRecord>>>('/interests/mutual', {
    query: { page },
  });
  return response?.data ?? null;
}

/* ==========================================================================
   Chat
   ========================================================================== */

export async function getConversations(page = 1): Promise<Paginated<ConversationSummary> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<ConversationSummary>>>(
    '/chat/conversations',
    {
      query: { page },
    },
  );
  return response?.data ?? null;
}

/**
 * `GET /chat/conversations/{id}/messages`
 *
 * Returns NEWEST FIRST (`orderByDesc('created_at')`), 50 per page — reverse
 * before rendering. Also marks inbound messages as read as a side effect.
 */
export async function getMessages(
  conversationId: number | string,
  page = 1,
): Promise<Paginated<MessageRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<MessageRecord>>>(
    `/chat/conversations/${conversationId}/messages`,
    { query: { page } },
  );
  return response?.data ?? null;
}

/** `GET /chat/unread-count` → `{ success, count }` — note `count`, not `data`. */
export async function getUnreadCount(): Promise<number> {
  const response = await serverFetchOptional<{ success: true; count: number }>('/chat/unread-count');
  return response?.count ?? 0;
}

/* ==========================================================================
   Subscription & payments
   ========================================================================== */

/**
 * `GET /packages` — public, and static enough to cache. `free_mode` sits at the
 * top level beside `data`.
 */
export async function getPackages(): Promise<{ packages: SubscriptionPackage[]; freeMode: boolean }> {
  try {
    const response = await publicFetch<PackagesResponse>('/packages', { revalidate: 900 });
    return { packages: response.data ?? [], freeMode: response.free_mode === true };
  } catch {
    return { packages: [], freeMode: false };
  }
}

export async function getMySubscription(): Promise<MySubscriptionResponse | null> {
  return serverFetchOptional<MySubscriptionResponse>('/my-subscription');
}

export async function getPaymentHistory(page = 1): Promise<Paginated<PaymentRecord> | null> {
  const response = await serverFetchOptional<ApiSuccess<Paginated<PaymentRecord>>>('/payments/history', {
    query: { page },
  });
  return response?.data ?? null;
}

/* ==========================================================================
   Reference data
   ========================================================================== */

/**
 * `GET /filter-options` — public and entirely static (hard-coded server-side),
 * so it is cached for an hour. lib/enums.ts carries an identical fallback for
 * when the API is unreachable, which keeps search forms usable.
 */
export async function getFilterOptions(): Promise<FilterOptions | null> {
  try {
    const response = await publicFetch<ApiSuccess<FilterOptions>>('/filter-options', { revalidate: 3600 });
    return response.data;
  } catch {
    return null;
  }
}
