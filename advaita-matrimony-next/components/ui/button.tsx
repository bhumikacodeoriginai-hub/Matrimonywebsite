/**
 * Button and ButtonLink.
 *
 * Two components rather than one polymorphic `as` prop, because a button and a
 * link are genuinely different things and conflating them is how keyboard and
 * screen-reader behaviour gets broken. If it navigates, it is a link and Enter
 * must work; if it acts, it is a button and Space must work. The browser gives us
 * both for free as long as we use the right element.
 *
 * Both share button.module.css so a link styled as a button never drifts.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from './icon';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'accent' | 'premium' | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label. */
  icon?: IconName;
  /** Icon after the label. Nudges forward on hover. */
  trailingIcon?: IconName;
  /** Renders the trailing icon inside a gold circle (marketing CTAs). */
  pip?: boolean;
  block?: boolean;
  round?: boolean;
  className?: string;
  children?: ReactNode;
}

function classesFor({
  variant = 'primary',
  size = 'md',
  block,
  round,
  iconOnly,
  className,
}: CommonProps & { iconOnly?: boolean }): string {
  return [
    styles.base,
    styles[variant],
    styles[size],
    block ? styles.block : '',
    round ? styles.round : '',
    iconOnly ? styles.iconOnly : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function Content({
  icon,
  trailingIcon,
  pip,
  loading,
  children,
}: Pick<CommonProps, 'icon' | 'trailingIcon' | 'pip' | 'children'> & { loading?: boolean }) {
  return (
    <>
      {/* The spinner replaces the leading icon so width stays stable. */}
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        icon && (
          <span className={styles.icon}>
            <Icon name={icon} />
          </span>
        )
      )}

      {children && <span className={styles.label}>{children}</span>}

      {trailingIcon &&
        (pip ? (
          <span className={styles.pip} aria-hidden="true">
            <Icon name={trailingIcon} />
          </span>
        ) : (
          <span className={`${styles.icon} ${styles.trailing}`}>
            <Icon name={trailingIcon} />
          </span>
        ))}
    </>
  );
}

/* ==========================================================================
   Button
   ========================================================================== */

export interface ButtonProps extends CommonProps {
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  /**
   * Shows a spinner, blocks pointer events and sets `aria-busy`.
   * The label is intentionally NOT swapped for "Loading…": changing it would
   * re-announce the whole button and lose the member's place.
   */
  loading?: boolean;
  /** Announced while loading, for members who cannot see the spinner. */
  loadingLabel?: string;
  /** Required when there is no visible label. */
  'aria-label'?: string;
  'aria-pressed'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-describedby'?: string;
  id?: string;
  name?: string;
  value?: string;
  form?: string;
  title?: string;
  autoFocus?: boolean;
}

export function Button({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  loadingLabel = 'Working…',
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  pip,
  block,
  round,
  className,
  children,
  ...aria
}: ButtonProps) {
  const iconOnly = !children && Boolean(icon ?? trailingIcon);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading || undefined}
      className={classesFor({ variant, size, block, round, iconOnly, className })}
      {...aria}
    >
      <Content icon={icon} trailingIcon={trailingIcon} pip={pip} loading={loading}>
        {children}
      </Content>
      {/* Politely announced, so a slow save is not silent. */}
      {loading && <span className="sr-only">{loadingLabel}</span>}
    </button>
  );
}

/* ==========================================================================
   ButtonLink
   ========================================================================== */

export interface ButtonLinkProps extends CommonProps {
  href: string;
  /** Set for links leaving the app; adds the safe rel and an sr-only hint. */
  external?: boolean;
  prefetch?: boolean;
  onClick?: () => void;
  'aria-label'?: string;
  'aria-current'?: 'page' | 'step' | 'true';
  id?: string;
  title?: string;
  download?: boolean;
}

export function ButtonLink({
  href,
  external = false,
  prefetch,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  pip,
  block,
  round,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  const iconOnly = !children && Boolean(icon ?? trailingIcon);
  const classes = classesFor({ variant, size, block, round, iconOnly, className });

  if (external) {
    return (
      <a
        href={href}
        // noopener closes the reverse-tabnabbing hole; noreferrer avoids leaking
        // a member's profile URL to third parties.
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        onClick={onClick}
        {...rest}
      >
        <Content icon={icon} trailingIcon={trailingIcon} pip={pip}>
          {children}
        </Content>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link href={href} prefetch={prefetch} className={classes} onClick={onClick} {...rest}>
      <Content icon={icon} trailingIcon={trailingIcon} pip={pip}>
        {children}
      </Content>
    </Link>
  );
}
