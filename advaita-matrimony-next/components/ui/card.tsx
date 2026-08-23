/**
 * Card, CardHeader and SectionHeading.
 *
 * `Card` is a presentational container only — it never renders an <a> or a
 * <button>. Nesting interactive elements inside an interactive card is the
 * classic source of "the whole tile is a link but so are the three buttons
 * inside it" bugs. Instead, use `linkOverlay` with a real <Link> inside: the
 * link carries the accessible name and stretches over the card, and any
 * secondary action opts back above it with `aboveOverlay`.
 */

import type { ReactNode } from 'react';
import styles from './card.module.css';

export type CardTone = 'plain' | 'glass' | 'deep' | 'sunken' | 'premium';
export type CardPad = 'none' | 'sm' | 'md' | 'lg';

const PAD_CLASS: Record<CardPad, string> = {
  none: styles.padNone,
  sm: styles.padSm,
  md: styles.padMd,
  lg: styles.padLg,
};

export interface CardProps {
  tone?: CardTone;
  pad?: CardPad;
  /** Adds the hover lift and focus-within parity. */
  interactive?: boolean;
  /** Enables the stretched-link pattern described above. */
  linkOverlay?: boolean;
  /** Renders as <article>/<section> etc. where the content warrants it. */
  as?: 'div' | 'article' | 'section' | 'li' | 'aside';
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  children: ReactNode;
  /** Scroll-reveal hook — see styles/animations.css. */
  reveal?: boolean;
  /** Stagger position within a group of revealing siblings. */
  revealIndex?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function Card({
  tone = 'plain',
  pad = 'md',
  interactive = false,
  linkOverlay = false,
  as: Tag = 'div',
  className,
  style,
  id,
  children,
  reveal = false,
  revealIndex,
  ...aria
}: CardProps) {
  const classes = [
    styles.card,
    styles[tone],
    PAD_CLASS[pad],
    interactive ? styles.interactive : '',
    linkOverlay ? styles.linkOverlay : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag
      id={id}
      className={classes}
      style={
        revealIndex === undefined
          ? style
          : ({ ...style, '--reveal-index': revealIndex } as React.CSSProperties)
      }
      data-reveal={reveal ? '' : undefined}
      {...aria}
    >
      {children}
    </Tag>
  );
}

/** Wrapper for content that must stay clickable above a `linkOverlay`. */
export function CardActions({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={[styles.aboveOverlay, className].filter(Boolean).join(' ')}>{children}</div>;
}

/* ==========================================================================
   CardHeader
   ========================================================================== */

export interface CardHeaderProps {
  title: ReactNode;
  /** Small right-aligned value or count. */
  meta?: ReactNode;
  /** Heading level. Pick the one the document outline needs, not the size. */
  level?: 2 | 3 | 4;
  action?: ReactNode;
  id?: string;
}

export function CardHeader({ title, meta, action, level = 3, id }: CardHeaderProps) {
  const Heading = `h${level}` as 'h2' | 'h3' | 'h4';
  return (
    <div className={styles.cardHead}>
      <Heading id={id} className={styles.cardTitle}>
        {title}
      </Heading>
      {meta && <span className={styles.cardMeta}>{meta}</span>}
      {action}
    </div>
  );
}

/* ==========================================================================
   SectionHeading
   ========================================================================== */

export interface SectionHeadingProps {
  /** Small uppercase label above the title. */
  overline?: string;
  /** Accepts <em> for the italic brand emphasis. */
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  id?: string;
  className?: string;
}

export function SectionHeading({
  overline,
  title,
  description,
  action,
  level = 2,
  id,
  className,
}: SectionHeadingProps) {
  const Heading = `h${level}` as 'h1' | 'h2' | 'h3';
  return (
    <div className={[styles.sectionHead, className].filter(Boolean).join(' ')}>
      <div className={styles.sectionHeadText}>
        {overline && <p className="overline">{overline}</p>}
        <Heading id={id} className={styles.sectionTitle}>
          {title}
        </Heading>
        {description && <p className={styles.sectionDescription}>{description}</p>}
      </div>
      {action && <div className={styles.sectionAction}>{action}</div>}
    </div>
  );
}
