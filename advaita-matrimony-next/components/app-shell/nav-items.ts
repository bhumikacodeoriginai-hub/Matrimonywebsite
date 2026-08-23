/**
 * Navigation for the authenticated product.
 *
 * One source of truth, consumed by the desktop sidebar, the mobile tab bar and the
 * "more" sheet. Defining these in two places is how a nav item ends up reachable on
 * desktop and orphaned on mobile.
 *
 * `badge` names a live counter the shell fills in (unread messages, pending
 * interests). Only counters we can actually source from the API are listed.
 */

import type { IconName } from '../ui/icon';

export type NavBadge = 'messages' | 'interests';

export interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  /** Live count to show beside the label, when the shell has one. */
  badge?: NavBadge;
  /** Shown in the mobile tab bar (max 4 + More). */
  primary?: boolean;
  /** One-line description, used by the mobile "more" sheet. */
  description?: string;
}

export interface NavSection {
  /** Group heading. `null` renders the group without one. */
  title: string | null;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: null,
    items: [
      {
        href: '/dashboard',
        label: 'Home',
        icon: 'home',
        primary: true,
        description: 'Your daily recommendations and activity',
      },
      {
        href: '/discover',
        label: 'Discover',
        icon: 'compass',
        primary: true,
        description: 'Browse profiles matched to your preferences',
      },
      {
        href: '/search',
        label: 'Search',
        icon: 'search',
        primary: true,
        description: 'Filter by age, location, education and more',
      },
    ],
  },
  {
    title: 'Connections',
    items: [
      {
        href: '/matches',
        label: 'Matches',
        icon: 'heart',
        description: 'Interests you both accepted',
      },
      {
        href: '/interests',
        label: 'Interests',
        icon: 'sparkle',
        badge: 'interests',
        description: 'Interests sent to you and by you',
      },
      {
        href: '/shortlisted',
        label: 'Shortlisted',
        icon: 'star',
        description: 'Profiles you saved for later',
      },
      {
        href: '/messages',
        label: 'Messages',
        icon: 'message',
        badge: 'messages',
        primary: true,
        description: 'Conversations with your matches',
      },
      {
        href: '/viewers',
        label: 'Who viewed me',
        icon: 'eye',
        description: 'Members who opened your profile',
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        href: '/profile',
        label: 'My profile',
        icon: 'user',
        description: 'How your profile looks to others',
      },
      {
        href: '/notifications',
        label: 'Notifications',
        icon: 'bell',
        description: 'Everything that happened recently',
      },
      {
        href: '/subscription',
        label: 'Membership',
        icon: 'crown',
        description: 'Your plan, usage and payments',
      },
      {
        href: '/settings',
        label: 'Settings',
        icon: 'settings',
        description: 'Privacy, photos and account',
      },
      {
        href: '/help',
        label: 'Help & safety',
        icon: 'life-buoy',
        description: 'Guidance, reporting and support',
      },
    ],
  },
];

/** Flat list, for lookups. */
export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

/** The four tabs in the mobile bar. The fifth slot is always "More". */
export const MOBILE_PRIMARY_ITEMS: NavItem[] = ALL_NAV_ITEMS.filter((item) => item.primary);

/** Everything that does not fit the mobile bar, shown in the "more" sheet. */
export const MOBILE_SECONDARY_SECTIONS: NavSection[] = NAV_SECTIONS.map((section) => ({
  title: section.title,
  items: section.items.filter((item) => !item.primary),
})).filter((section) => section.items.length > 0);

/**
 * Active-state matching.
 *
 * `/messages` must stay highlighted while reading `/messages/42`, so this is a
 * prefix match — but `/` would prefix-match everything, and `/profile` must not
 * light up for `/profiles/9` (someone else's profile), hence the boundary check.
 */
export function isNavItemActive(itemHref: string, pathname: string): boolean {
  if (pathname === itemHref) return true;
  return pathname.startsWith(`${itemHref}/`);
}

/** Page title for the topbar, derived from the route. */
export function titleForPath(pathname: string): string {
  const match = ALL_NAV_ITEMS.filter((item) => isNavItemActive(item.href, pathname)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
  return match?.label ?? 'Advaita';
}
