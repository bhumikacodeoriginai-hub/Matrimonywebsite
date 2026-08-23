/**
 * Badge, StatusDot and Chip.
 *
 * COLOUR IS NEVER THE ONLY SIGNAL (WCAG 1.4.1). Every badge carries an icon or
 * words; every selected chip gets a tick. A green pill that means "verified" only
 * to people who can see green is not a verification badge, it is decoration.
 */

import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import { PROFILE_CATEGORY_LABELS } from '../../lib/enums';
import type { ProfileCategory } from '../../lib/api/types';
import styles from './badge.module.css';

export type BadgeTone = 'neutral' | 'brand' | 'accent' | 'verified' | 'premium' | 'pending' | 'danger';

export interface BadgeProps {
  tone?: BadgeTone;
  icon?: IconName;
  /** Opaque fill — use over photographs, where a tint vanishes. */
  solid?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
  children: ReactNode;
  /** Exposed for forced-colors handling in base.css. */
  status?: string;
  title?: string;
}

export function Badge({
  tone = 'neutral',
  icon,
  solid = false,
  size = 'sm',
  className,
  children,
  status,
  title,
}: BadgeProps) {
  const classes = [
    styles.badge,
    styles[tone],
    solid ? styles.solid : '',
    size === 'lg' ? styles.lg : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} data-status={status ?? tone} title={title}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} />
        </span>
      )}
      {children}
    </span>
  );
}

/* ==========================================================================
   Purpose-built badges
   ========================================================================== */

/**
 * Trust badge. The tick is the signal; the colour only reinforces it.
 *
 * NOTE ON MEANING: the API exposes no per-profile "identity verified" flag. What
 * we actually know is whether the member's phone was verified and, for Divyangjan
 * members, whether a UDID document was accepted. So callers must pass the real
 * basis, and `title` states it, rather than implying a blanket verification we
 * cannot back up.
 */
export function VerifiedBadge({
  basis = 'Mobile number verified',
  solid = false,
  size,
}: {
  basis?: string;
  solid?: boolean;
  size?: 'sm' | 'lg';
}) {
  return (
    <Badge tone="verified" icon="shield-check" solid={solid} size={size} status="verified" title={basis}>
      Verified
    </Badge>
  );
}

export function PremiumBadge({ solid = false, size }: { solid?: boolean; size?: 'sm' | 'lg' }) {
  return (
    <Badge tone="premium" icon="crown" solid={solid} size={size} status="premium" title="Premium member">
      Premium
    </Badge>
  );
}

/**
 * Community badge.
 *
 * Rendered in the SAME neutral tone as every other metadata badge — never in a
 * warning colour, never with a "special" treatment. A member's community is a
 * fact about them, like their city.
 */
export function CategoryBadge({
  category,
  solid = false,
}: {
  category: ProfileCategory | null | undefined;
  solid?: boolean;
}) {
  if (!category) return null;
  return (
    <Badge tone="neutral" solid={solid} status="category">
      {PROFILE_CATEGORY_LABELS[category]}
    </Badge>
  );
}

/* ==========================================================================
   StatusDot
   ========================================================================== */

export type PresenceState = 'online' | 'recent' | 'offline';

/**
 * Presence indicator.
 *
 * The API gives `is_online` plus a human `last_active` string. It does NOT give a
 * machine-readable last-seen timestamp on card payloads, so "recent" must be
 * decided by the caller from whatever it actually has. We do not guess.
 */
export function StatusDot({
  state,
  label,
  showLabel = true,
}: {
  state: PresenceState;
  /** Overrides the default wording, e.g. the server's "2 hours ago". */
  label?: string;
  showLabel?: boolean;
}) {
  const dotClass = [
    styles.dot,
    state === 'online' ? styles.dotOnline : '',
    state === 'recent' ? styles.dotRecent : '',
  ]
    .filter(Boolean)
    .join(' ');

  const text =
    label ?? (state === 'online' ? 'Online now' : state === 'recent' ? 'Active recently' : 'Offline');

  return (
    <span className={styles.dotWrap}>
      <span className={dotClass} aria-hidden="true" />
      {showLabel ? <span>{text}</span> : <span className="sr-only">{text}</span>}
    </span>
  );
}

/* ==========================================================================
   Chip
   ========================================================================== */

export interface ChipProps {
  children: ReactNode;
  /** Selectable chip — renders a <button> with aria-pressed. */
  onSelect?: () => void;
  selected?: boolean;
  /** Removable filter chip — renders a static label plus a remove button. */
  onRemove?: () => void;
  /** Describes what removal does, for screen readers. */
  removeLabel?: string;
  icon?: IconName;
  className?: string;
  disabled?: boolean;
}

export function Chip({
  children,
  onSelect,
  selected = false,
  onRemove,
  removeLabel,
  icon,
  className,
  disabled = false,
}: ChipProps) {
  /* -- Removable (active filter) -- */
  if (onRemove) {
    return (
      <span className={[styles.chip, styles.chipRemovable, className].filter(Boolean).join(' ')}>
        {icon && (
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
        )}
        {children}
        <button
          type="button"
          className={`${styles.chipRemove} inline-control`}
          onClick={onRemove}
          aria-label={removeLabel ?? `Remove filter`}
        >
          <Icon name="close" />
        </button>
      </span>
    );
  }

  /* -- Selectable -- */
  if (onSelect) {
    return (
      <button
        type="button"
        className={[styles.chip, selected ? styles.chipSelected : '', className].filter(Boolean).join(' ')}
        onClick={onSelect}
        aria-pressed={selected}
        disabled={disabled}
      >
        {/* Tick makes selection visible without relying on the colour change. */}
        {selected ? (
          <span className={styles.chipTick} aria-hidden="true">
            <Icon name="check" />
          </span>
        ) : (
          icon && (
            <span className={styles.icon}>
              <Icon name={icon} />
            </span>
          )
        )}
        {children}
      </button>
    );
  }

  /* -- Static tag -- */
  return (
    <span className={[styles.chip, styles.chipStatic, className].filter(Boolean).join(' ')}>
      {icon && (
        <span className={styles.icon}>
          <Icon name={icon} />
        </span>
      )}
      {children}
    </span>
  );
}

/**
 * Chip container.
 *
 * Pass `label` when the group is a genuine set of related controls — it renders a
 * real group with an accessible name so a screen reader announces "Communities,
 * group" before the options, instead of a bare run of buttons.
 */
export function ChipGroup({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  const classes = [styles.chipGroup, className].filter(Boolean).join(' ');

  if (!label) return <div className={classes}>{children}</div>;

  return (
    <div className={classes} role="group" aria-label={label}>
      {children}
    </div>
  );
}
