/**
 * Feedback primitives: Skeleton, Spinner, EmptyState, Alert, Note.
 *
 * LOADING STATES: skeletons are wrapped in a container with `aria-busy="true"`
 * and `aria-hidden` on the placeholder shapes, plus one polite "Loading…" for
 * assistive tech. Without that, a screen reader reads a dozen meaningless empty
 * boxes; with it, one clear announcement.
 *
 * EMPTY STATES: `EmptyState` requires a title AND a body, and strongly encourages
 * an action. An empty state that does not explain why it is empty or what to do
 * next is a dead end, and this product has many legitimately empty screens (no
 * interests yet, no messages yet, profile awaiting approval).
 */

import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import styles from './feedback.module.css';

/* ==========================================================================
   Skeleton
   ========================================================================== */

export interface SkeletonProps {
  /** Any CSS length. Match the real content's size to avoid layout shift. */
  width?: number | string;
  height?: number | string;
  circle?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Skeleton({ width, height, circle = false, radius, className }: SkeletonProps) {
  return (
    <span
      className={[styles.skeleton, circle ? styles.skelCircle : '', radius ? styles.skelCard : '', className]
        .filter(Boolean)
        .join(' ')}
      style={{
        width,
        height,
        display: 'block',
        borderRadius: circle ? undefined : radius ? `var(--radius-${radius})` : undefined,
      }}
      aria-hidden="true"
    />
  );
}

/** Several lines of placeholder prose, with a ragged last line. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={className} aria-hidden="true" style={{ display: 'block' }}>
      {Array.from({ length: lines }).map((_, index) => (
        <span
          key={index}
          className={[styles.skeleton, styles.skelText, index === lines - 1 ? styles.skelTextLast : '']
            .filter(Boolean)
            .join(' ')}
          style={{ display: 'block' }}
        />
      ))}
    </span>
  );
}

/**
 * Wrapper that makes a group of skeletons legible to assistive tech.
 * Always use this rather than bare <Skeleton>s in a list.
 */
export function LoadingRegion({
  label = 'Loading',
  children,
  className,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} aria-busy="true" role="status" aria-live="polite">
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

/* ==========================================================================
   Spinner
   ========================================================================== */

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      className={[styles.spinner, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

/** Centred spinner for a whole panel that is loading. */
export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className={styles.spinnerBlock} role="status" aria-live="polite">
      <Spinner size={26} />
      <span>{label}</span>
    </div>
  );
}

/* ==========================================================================
   EmptyState
   ========================================================================== */

export interface EmptyStateProps {
  icon?: IconName;
  /** What this list is. */
  title: string;
  /** Why it is empty, and what changes that. Required by design. */
  body: string;
  /** Primary and secondary actions. */
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon = 'sparkle', title, body, children, className }: EmptyStateProps) {
  return (
    <div className={[styles.empty, className].filter(Boolean).join(' ')}>
      <span className={styles.emptyIcon} aria-hidden="true">
        <Icon name={icon} />
      </span>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyBody}>{body}</p>
      {children && <div className={styles.emptyActions}>{children}</div>}
    </div>
  );
}

/* ==========================================================================
   Alert
   ========================================================================== */

export type AlertTone = 'info' | 'success' | 'warning' | 'error' | 'premium';

const TONE_CLASS: Record<AlertTone, string> = {
  info: styles.info,
  success: styles.success,
  warning: styles.warning,
  error: styles.error,
  premium: styles.premiumTone,
};

const TONE_ICON: Record<AlertTone, IconName> = {
  info: 'info',
  success: 'check-circle',
  warning: 'alert',
  error: 'alert',
  premium: 'crown',
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  icon?: IconName;
  /** Renders a dismiss button. */
  onDismiss?: () => void;
  /** Buttons or links below the text. */
  actions?: ReactNode;
  /**
   * Announce immediately rather than politely. Reserve for errors that block the
   * member right now — an assertive live region interrupts whatever is being read.
   */
  assertive?: boolean;
  className?: string;
}

export function Alert({
  tone = 'info',
  title,
  children,
  icon,
  onDismiss,
  actions,
  assertive = false,
  className,
}: AlertProps) {
  const isProblem = tone === 'error' || tone === 'warning';

  return (
    <div
      className={[styles.alert, TONE_CLASS[tone], className].filter(Boolean).join(' ')}
      // `alert` role implies assertive; use `status` for everything else so we do
      // not interrupt the member for informational content.
      role={assertive || isProblem ? 'alert' : 'status'}
      aria-live={assertive || isProblem ? 'assertive' : 'polite'}
    >
      <span className={styles.alertIcon} aria-hidden="true">
        <Icon name={icon ?? TONE_ICON[tone]} />
      </span>

      <div className={styles.alertBody}>
        {title && <span className={styles.alertTitle}>{title}</span>}
        <p className={styles.alertText}>{children}</p>
        {actions && <div className={styles.alertActions}>{actions}</div>}
      </div>

      {onDismiss && (
        <button
          type="button"
          className={styles.dismiss}
          onClick={onDismiss}
          aria-label="Dismiss this message"
        >
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   Note
   ========================================================================== */

/**
 * Quiet inline explanation. Used for the honest disclosures this product needs —
 * how a compatibility score is calculated, that notification read state is
 * per-device, that a blur is not a guarantee.
 */
export function Note({
  children,
  icon = 'info',
  className,
}: {
  children: ReactNode;
  icon?: IconName;
  className?: string;
}) {
  return (
    <p className={[styles.note, className].filter(Boolean).join(' ')}>
      <span className={styles.noteIcon} aria-hidden="true">
        <Icon name={icon} />
      </span>
      <span>{children}</span>
    </p>
  );
}
