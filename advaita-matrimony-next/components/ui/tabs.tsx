'use client';

/**
 * Tabs, in two flavours.
 *
 * `TabLinks` — tabs that are LINKS, changing a URL query (`?tab=received`).
 *   Use this whenever the tab represents state worth sharing, bookmarking or
 *   restoring after a reload, which in this product is nearly always. They are
 *   real anchors, so middle-click and "open in new tab" work, and no ARIA tab
 *   pattern is needed or wanted: `aria-current="page"` is the correct semantic.
 *
 * `Tabs` — the ARIA tab pattern for genuinely ephemeral, in-page switching
 *   (e.g. toggling between a chart and its table). Implements the full keyboard
 *   contract: Left/Right/Home/End move between tabs, and only the selected tab is
 *   in the tab order (roving tabindex), so Tab moves out of the list to the panel
 *   rather than through every tab.
 *
 * Choosing the wrong one is the usual mistake: applying the ARIA tab pattern to
 * links makes them stop behaving like links.
 */

import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import { formatCount } from '../../lib/format';
import styles from './tabs.module.css';

/* ==========================================================================
   TabLinks
   ========================================================================== */

export interface TabLinkItem {
  href: string;
  label: string;
  icon?: IconName;
  count?: number;
  /** Draws the count in the accent colour — for items awaiting a response. */
  alert?: boolean;
}

export function TabLinks({
  items,
  activeHref,
  label,
  pill = false,
  className,
}: {
  items: TabLinkItem[];
  /** The currently active href, compared exactly. */
  activeHref: string;
  /** Accessible name for the navigation, e.g. "Interest views". */
  label: string;
  pill?: boolean;
  className?: string;
}) {
  return (
    <nav
      className={[styles.tablist, pill ? styles.pillList : '', className].filter(Boolean).join(' ')}
      aria-label={label}
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={[styles.tab, active ? styles.tabActive : ''].filter(Boolean).join(' ')}
            aria-current={active ? 'page' : undefined}
          >
            {item.icon && <Icon name={item.icon} />}
            {item.label}
            {item.count !== undefined && item.count > 0 && (
              <span className={[styles.count, item.alert ? styles.countAlert : ''].filter(Boolean).join(' ')}>
                {/* The number is decorative here; the accessible name below
                    spells it out so it is not read as a bare digit. */}
                <span aria-hidden="true">{formatCount(item.count)}</span>
                <span className="sr-only">
                  {' '}
                  ({formatCount(item.count)} {item.count === 1 ? 'item' : 'items'})
                </span>
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/* ==========================================================================
   Tabs (ARIA pattern)
   ========================================================================== */

export interface TabItem {
  id: string;
  label: string;
  icon?: IconName;
  count?: number;
  content: ReactNode;
}

export function Tabs({
  items,
  label,
  defaultId,
  pill = false,
  className,
}: {
  items: TabItem[];
  label: string;
  defaultId?: string;
  pill?: boolean;
  className?: string;
}) {
  const baseId = useId();
  const [active, setActive] = useState(defaultId ?? items[0]?.id ?? '');
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  );

  const focusTab = (index: number) => {
    const target = items[(index + items.length) % items.length];
    if (!target) return;
    setActive(target.id);
    tabRefs.current.get(target.id)?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        focusTab(activeIndex + 1);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        focusTab(activeIndex - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(items.length - 1);
        break;
      default:
        break;
    }
  };

  const activeItem = items[activeIndex];

  return (
    <div className={className}>
      <div
        className={[styles.tablist, pill ? styles.pillList : ''].filter(Boolean).join(' ')}
        role="tablist"
        aria-label={label}
      >
        {items.map((item) => {
          const selected = item.id === active;
          return (
            <button
              key={item.id}
              ref={(node: HTMLButtonElement | null) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${item.id}`}
              /* Roving tabindex: Tab leaves the list instead of walking it. */
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, selected ? styles.tabActive : ''].filter(Boolean).join(' ')}
              onClick={() => setActive(item.id)}
              onKeyDown={onKeyDown}
            >
              {item.icon && <Icon name={item.icon} />}
              {item.label}
              {item.count !== undefined && item.count > 0 && (
                <span className={styles.count}>
                  <span aria-hidden="true">{formatCount(item.count)}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeItem && (
        <div
          className={styles.panel}
          role="tabpanel"
          id={`${baseId}-panel-${activeItem.id}`}
          aria-labelledby={`${baseId}-tab-${activeItem.id}`}
          /* Focusable so keyboard users can Tab straight from the tab into the
             panel content, which is the expected behaviour for this pattern. */
          tabIndex={0}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}
