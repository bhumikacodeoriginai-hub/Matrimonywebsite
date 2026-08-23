/**
 * The Advaita lockup: mark + wordmark.
 *
 * Renders as a link by default because that is what it almost always is. Pass
 * `href={null}` for the one place it is not — the intro sequence, where it is
 * purely a graphic.
 *
 * A single accessible name is applied to the whole lockup and the mark is left
 * decorative, so a screen reader announces "Advaita Matrimony, link" rather than
 * reading the mark and the wordmark as two separate things.
 */

import Link from 'next/link';
import { AdvaitaMark } from './advaita-mark';
import styles from './logo.module.css';

export interface LogoProps {
  href?: string | null;
  size?: 'sm' | 'md' | 'lg';
  /** Hides the wordmark, leaving just the plated mark. */
  markOnly?: boolean;
  /** Drops the gradient plate behind the mark. */
  plain?: boolean;
  /** Second line under the name. Pass `null` to hide it. */
  tagline?: string | null;
  className?: string;
}

const MARK_SIZE: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 20,
  md: 26,
  lg: 34,
};

export function Logo({
  href = '/',
  size = 'md',
  markOnly = false,
  plain = false,
  tagline = 'Inclusive Matrimony',
  className,
}: LogoProps) {
  const classes = [styles.logo, styles[size], plain ? styles.plain : '', className].filter(Boolean).join(' ');

  const content = (
    <>
      <span className={styles.markBox}>
        <AdvaitaMark size={MARK_SIZE[size]} gradient={plain} idSuffix={`logo-${size}`} />
      </span>
      {!markOnly && (
        <span className={styles.text}>
          <span className={styles.name}>Advaita</span>
          {tagline && <span className={styles.tagline}>{tagline}</span>}
        </span>
      )}
    </>
  );

  if (href === null) {
    return (
      <span className={classes} role="img" aria-label="Advaita Matrimony">
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={classes} aria-label="Advaita Matrimony — home">
      {content}
    </Link>
  );
}
