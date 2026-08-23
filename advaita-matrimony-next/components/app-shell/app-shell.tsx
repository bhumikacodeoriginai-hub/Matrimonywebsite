'use client';

/**
 * The authenticated app shell: sidebar, topbar, mobile tab bar.
 *
 * Client-side because it needs `usePathname` for active state, local state for the
 * mobile drawer, and a slow poll for the unread badge. Everything inside it
 * (the pages themselves) stays server-rendered.
 *
 * BADGE COUNTS ARE REAL
 * `messages` comes from `GET /chat/unread-count`. `interests` comes from the
 * pending count the server layout already fetched, passed in as a prop so the
 * shell does not duplicate the request. The unread count is then refreshed on a
 * slow poll (60s, paused while the tab is hidden) because there is no push
 * transport — see lib/hooks/use-poll.ts.
 *
 * ACCESSIBILITY
 *  • The sidebar is a real <nav> with an accessible name; on mobile it becomes a
 *    dialog with a focus trap, Escape-to-close and an inert background.
 *  • The current item carries `aria-current="page"` and an edge marker, so active
 *    state is not communicated by colour alone.
 *  • The mobile tab bar and the sidebar are separate landmarks with distinct
 *    names, so a screen-reader user is not told about the same links twice
 *    without knowing which is which.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '../brand/logo';
import { Avatar } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { Sheet } from '../ui/overlay';
import { ThemeToggle } from '../theme-toggle';
import { useDialog } from '../../lib/hooks/use-dialog';
import { POLL_INTERVALS, usePoll } from '../../lib/hooks/use-poll';
import { fetchUnreadCount, logout } from '../../lib/api/actions';
import { formatCount, metaLine } from '../../lib/format';
import { PROFILE_CATEGORY_LABELS } from '../../lib/enums';
import {
  MOBILE_PRIMARY_ITEMS,
  MOBILE_SECONDARY_SECTIONS,
  NAV_SECTIONS,
  isNavItemActive,
  titleForPath,
  type NavBadge,
  type NavItem,
} from './nav-items';
import type { ProfileCategory } from '../../lib/api/types';
import styles from './shell.module.css';

export interface ShellMember {
  name: string;
  avatar: string | null;
  category: ProfileCategory | null;
  city: string | null;
  isPremium: boolean;
}

export interface AppShellProps {
  member: ShellMember;
  /** Pending interests awaiting the member's response. */
  pendingInterests: number;
  /** Unread messages at render time; refreshed client-side afterwards. */
  initialUnread: number;
  /** Unseen notification count, for the bell dot. */
  unseenNotifications?: number;
  children: ReactNode;
}

export function AppShell({
  member,
  pendingInterests,
  initialUnread,
  unseenNotifications = 0,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unread, setUnread] = useState(initialUnread);
  const [signingOut, setSigningOut] = useState(false);

  /* The drawer is a dialog on mobile: trap focus, lock scroll, Escape closes. */
  const { ref: drawerRef } = useDialog<HTMLElement>(drawerOpen, () => setDrawerOpen(false));

  /* Close the drawer on navigation — leaving it open over the new page is jarring. */
  useEffect(() => {
    setDrawerOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  /* No push transport exists, so poll politely. */
  usePoll(
    useCallback(async () => {
      setUnread(await fetchUnreadCount());
    }, []),
    POLL_INTERVALS.unreadBadge,
  );

  const badgeValue = (badge: NavBadge | undefined): number => {
    if (badge === 'messages') return unread;
    if (badge === 'interests') return pendingInterests;
    return 0;
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    await logout();
    // `replace` so Back cannot return to an authenticated page.
    router.replace('/');
  };

  const renderNavLink = (item: NavItem) => {
    const active = isNavItemActive(item.href, pathname);
    const count = badgeValue(item.badge);

    return (
      <Link
        key={item.href}
        href={item.href}
        className={[styles.navLink, active ? styles.navLinkActive : ''].filter(Boolean).join(' ')}
        aria-current={active ? 'page' : undefined}
      >
        <span className={styles.navIcon} aria-hidden="true">
          <Icon name={item.icon} />
        </span>
        <span className={styles.navLabel}>{item.label}</span>
        {count > 0 && (
          <>
            <span className={styles.navBadge} aria-hidden="true">
              {formatCount(count)}
            </span>
            {/* The visible pill is decorative; this is what gets announced. */}
            <span className="sr-only">
              ({formatCount(count)} {item.badge === 'messages' ? 'unread' : 'awaiting your reply'})
            </span>
          </>
        )}
      </Link>
    );
  };

  return (
    <div className={styles.shell}>
      {/* -------- Sidebar / mobile drawer -------- */}
      {drawerOpen && (
        <div className={styles.scrim} onClick={() => setDrawerOpen(false)} aria-hidden="true" />
      )}

      <nav
        ref={drawerRef}
        className={[styles.sidebar, drawerOpen ? styles.sidebarOpen : ''].filter(Boolean).join(' ')}
        aria-label="Main"
        // Only a dialog while it is a drawer; on desktop it is a plain landmark.
        role={drawerOpen ? 'dialog' : undefined}
        aria-modal={drawerOpen ? true : undefined}
        tabIndex={drawerOpen ? -1 : undefined}
      >
        <div className={styles.sidebarHead}>
          <Logo size="sm" tagline={null} />
        </div>

        <div className={styles.sidebarScroll}>
          {NAV_SECTIONS.map((section, index) => (
            <div key={section.title ?? `group-${index}`} className={styles.navGroup}>
              {section.title && <p className={styles.navGroupTitle}>{section.title}</p>}
              {section.items.map(renderNavLink)}
            </div>
          ))}
        </div>

        <div className={styles.sidebarFoot}>
          <Link href="/profile" className={styles.meCard}>
            <Avatar
              src={member.avatar}
              name={member.name}
              size="md"
              ring={member.isPremium ? 'premium' : 'default'}
              decorative
            />
            <span className={styles.meText}>
              <span className={styles.meName}>{member.name}</span>
              <span className={styles.meMeta}>
                {metaLine(
                  member.category ? PROFILE_CATEGORY_LABELS[member.category] : null,
                  member.city,
                ) || 'View your profile'}
              </span>
            </span>
            {member.isPremium && <Badge tone="premium" icon="crown">{''}</Badge>}
          </Link>

          <Button
            variant="ghost"
            size="sm"
            icon="logout"
            block
            onClick={() => void handleSignOut()}
            loading={signingOut}
            loadingLabel="Signing out"
          >
            Sign out
          </Button>
        </div>
      </nav>

      {/* -------- Main column -------- */}
      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
          >
            <Icon name="menu" />
          </button>

          {/* The page's own <h1> is in the content; this is a navigational
              label, so it is a <p> to avoid two competing top-level headings. */}
          <p className={styles.topbarTitle}>{titleForPath(pathname)}</p>

          <div className={styles.topbarActions}>
            <Link
              href="/search"
              className={styles.iconButton}
              aria-label="Search profiles"
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Icon name="search" />
            </Link>

            <Link
              href="/notifications"
              className={[styles.iconButton, unseenNotifications > 0 ? styles.iconButtonDot : '']
                .filter(Boolean)
                .join(' ')}
              aria-label={
                unseenNotifications > 0
                  ? `Notifications (${formatCount(unseenNotifications)} new)`
                  : 'Notifications'
              }
              style={{ display: 'grid', placeItems: 'center' }}
            >
              <Icon name="bell" />
            </Link>

            <ThemeToggle className={styles.iconButton} />
          </div>
        </header>

        <main id="main" className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </main>
      </div>

      {/* -------- Mobile tab bar -------- */}
      <nav className={styles.mobileNav} aria-label="Quick navigation">
        {MOBILE_PRIMARY_ITEMS.map((item) => {
          const active = isNavItemActive(item.href, pathname);
          const count = badgeValue(item.badge);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[styles.mobileNavItem, active ? styles.mobileNavItemActive : '']
                .filter(Boolean)
                .join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.mobileNavIcon} aria-hidden="true">
                <Icon name={item.icon} />
              </span>
              <span className={styles.mobileNavLabel}>{item.label}</span>
              {count > 0 && (
                <>
                  <span className={styles.mobileNavBadge} aria-hidden="true">
                    {count > 9 ? '9+' : count}
                  </span>
                  <span className="sr-only">({formatCount(count)} new)</span>
                </>
              )}
            </Link>
          );
        })}

        <button
          type="button"
          className={styles.mobileNavItem}
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
        >
          <span className={styles.mobileNavIcon} aria-hidden="true">
            <Icon name="more" />
          </span>
          <span className={styles.mobileNavLabel}>More</span>
        </button>
      </nav>

      {/* Everything that does not fit the five mobile slots. */}
      <Sheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        title="Everything else"
        description="Your connections, account and support."
      >
        <div className={styles.moreGrid}>
          {MOBILE_SECONDARY_SECTIONS.map((section, index) => (
            <div key={section.title ?? `more-${index}`}>
              {section.title && <p className={styles.moreGroupTitle}>{section.title}</p>}
              {section.items.map((item) => {
                const count = badgeValue(item.badge);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={styles.moreItem}
                    onClick={() => setMoreOpen(false)}
                  >
                    <span className={styles.moreItemIcon} aria-hidden="true">
                      <Icon name={item.icon} />
                    </span>
                    <span className={styles.moreItemText}>
                      <span className={styles.moreItemLabel}>{item.label}</span>
                      {item.description && (
                        <span className={styles.moreItemDescription}>{item.description}</span>
                      )}
                    </span>
                    {count > 0 && (
                      <Badge tone="accent">
                        {formatCount(count)}
                        <span className="sr-only"> new</span>
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}

          <Button
            variant="secondary"
            icon="logout"
            block
            onClick={() => void handleSignOut()}
            loading={signingOut}
          >
            Sign out
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
