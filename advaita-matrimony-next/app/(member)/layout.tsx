/**
 * Layout for every authenticated route.
 *
 * A route group, so URLs stay clean: `/dashboard`, `/search`, `/messages` — the
 * `(member)` segment is not part of the path.
 *
 * Runs on the server and does three things:
 *  1. Guards the whole group. No signed-in session, no render.
 *  2. Fetches the shell's data once — the member's own profile, the pending
 *     interest count, the unread message count — so every page underneath does
 *     not repeat it.
 *  3. Marks the entire group `noindex`. Member profiles, conversations and
 *     dashboards must never reach a search index.
 *
 * If `GET /profile/me` fails for any reason other than auth, we still render the
 * shell with what we know rather than showing an error page: a member should be
 * able to reach Settings and Help even when the profile endpoint is unhappy.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppShell, type ShellMember } from '../../components/app-shell/app-shell';
import { getMyProfileOptional, getReceivedInterests, getUnreadCount } from '../../lib/api/queries';
import { pendingReceived } from '../../lib/interests';
import { isAuthenticated } from '../../lib/auth/session';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Member data is per-request and must never be cached or statically rendered. */
export const dynamic = 'force-dynamic';

export default async function MemberLayout({ children }: { children: ReactNode }) {
  if (!(await isAuthenticated())) {
    // No `next` param here: a layout does not know which child route was
    // requested. Deep links are preserved by SessionWatcher on the client, which
    // does know the pathname.
    redirect('/login');
  }

  // Fetched in parallel — three sequential round trips would show in the TTFB of
  // every authenticated page.
  const [me, received, unread] = await Promise.all([
    getMyProfileOptional(),
    getReceivedInterests(1),
    getUnreadCount(),
  ]);

  const member: ShellMember = {
    name: me?.user.name ?? 'Your profile',
    avatar: me?.user.photos.find((photo) => photo.is_primary)?.thumbnail_path ?? null,
    category: me?.user.profile?.profile_category ?? null,
    city: me?.user.profile?.city ?? null,
    isPremium: me?.user.is_premium ?? false,
  };

  /**
   * Counted from the first page only. `GET /interests/received` returns every
   * status mixed together and paginates at 20, so there is no way to ask the API
   * for "how many are pending" — the badge is therefore accurate up to 20 and
   * conservative beyond it. A `pending_count` on that endpoint would fix it;
   * recorded in docs/BACKEND_GAPS.md.
   */
  const pendingInterests = received ? pendingReceived(received.data).length : 0;

  return (
    <AppShell member={member} pendingInterests={pendingInterests} initialUnread={unread}>
      {children}
    </AppShell>
  );
}
