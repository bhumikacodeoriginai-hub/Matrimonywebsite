/**
 * Reveal — opt-in scroll entrance for a block of content.
 *
 * A thin wrapper that sets the two data attributes the CSS in
 * styles/animations.css looks for. The actual observing is done once, page-wide,
 * by `useRevealObserver` (mounted in components/app-shell/motion-root.tsx) rather
 * than by an observer per component.
 *
 * PROGRESSIVE ENHANCEMENT: content wrapped in this is VISIBLE by default. It only
 * starts hidden once JS has confirmed it is running and that motion is welcome, and
 * there is a 3-second failsafe that reveals anything still hidden. Animation must
 * never be able to strand content.
 *
 * This is a Server Component — no 'use client'. It renders attributes and nothing
 * else, so it costs no client JavaScript.
 */

import type { ReactNode } from 'react';

export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';

export interface RevealProps {
  children: ReactNode;
  /** Entrance direction. 'up' is the default and the right choice most of the time. */
  direction?: RevealDirection;
  /** Position in a staggered group. Multiplied by --stagger (70ms). */
  index?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

export function Reveal({
  children,
  direction = 'up',
  index = 0,
  as: Tag = 'div',
  className,
  style,
  id,
}: RevealProps) {
  return (
    <Tag
      id={id}
      className={className}
      // 'up' is the CSS default, so it is expressed as an empty attribute value.
      data-reveal={direction === 'up' ? '' : direction}
      style={{ ...style, ['--reveal-index' as string]: index }}
    >
      {children}
    </Tag>
  );
}

/**
 * Immediate (non-scroll) staggered entrance, for above-the-fold content that
 * should animate on load rather than waiting for an intersection.
 *
 * Uses the `.enter` classes, which are plain CSS animations with `fill-mode: both`
 * — so under reduced motion they collapse to their final frame and stay visible.
 */
export function Enter({
  children,
  index = 0,
  variant = 'up',
  as: Tag = 'div',
  className,
  style,
}: {
  children: ReactNode;
  index?: number;
  variant?: 'up' | 'fade' | 'scale';
  as?: 'div' | 'section' | 'article' | 'li' | 'span' | 'p' | 'h1' | 'h2';
  className?: string;
  style?: React.CSSProperties;
}) {
  const variantClass = variant === 'fade' ? 'enter-fade' : variant === 'scale' ? 'enter-scale' : 'enter';

  return (
    <Tag
      className={[variantClass, className].filter(Boolean).join(' ')}
      style={{ ...style, ['--reveal-index' as string]: index }}
    >
      {children}
    </Tag>
  );
}
