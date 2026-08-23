/**
 * The Advaita mark.
 *
 * CONCEPT — "advaita" means non-duality: two things understood as one.
 * The mark is two mirrored arcs that begin apart and meet at a single point top
 * and bottom, enclosing a lens of shared space. Read one way it is two journeys
 * converging; read another it is a single continuous form. A small filled point
 * sits at the centre — the moment of meeting.
 *
 * Deliberately NOT: interlocking rings, clasped hands, a literal heart, or two
 * silhouettes. Those are the visual vocabulary of every traditional matrimony
 * brand, and the brief asks for an identity of its own. The heart is present only
 * as negative space for those who look for it.
 *
 * Built as two stroked paths (not a filled glyph) so the first-launch intro can
 * draw them with `stroke-dasharray`, and so the mark inherits `currentColor` and
 * works on any surface at any size from 16px up.
 */

import type { CSSProperties } from 'react';

export interface AdvaitaMarkProps {
  size?: number | string;
  className?: string;
  style?: CSSProperties;
  /** Paints the arcs with the brand gradient instead of `currentColor`. */
  gradient?: boolean;
  /**
   * Unique suffix for the gradient's id. Required when more than one gradient
   * mark can appear on a page, since SVG ids are global.
   */
  idSuffix?: string;
  /** Draw-on animation for the intro sequence. Off everywhere else. */
  animated?: boolean;
  /** Accessible name. Omit inside a lockup where the wordmark carries the name. */
  label?: string;
  strokeWidth?: number;
}

/** Path length of each arc, used for the draw-on dash animation. */
export const MARK_ARC_LENGTH = 78;

export function AdvaitaMark({
  size = 40,
  className,
  style,
  gradient = false,
  idSuffix = 'default',
  animated = false,
  label,
  strokeWidth = 2.1,
}: AdvaitaMarkProps) {
  const gradientId = `advaita-mark-gradient-${idSuffix}`;
  const stroke = gradient ? `url(#${gradientId})` : 'currentColor';

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      {gradient && (
        <defs>
          <linearGradient id={gradientId} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--plum-600)" />
            <stop offset="52%" stopColor="var(--rose-500)" />
            <stop offset="100%" stopColor="var(--gold-400)" />
          </linearGradient>
        </defs>
      )}

      {/* Left journey: rises from the lower meeting point to the upper one. */}
      <path
        d="M24 6C12 14 12 34 24 42"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          animated
            ? {
                strokeDasharray: MARK_ARC_LENGTH,
                strokeDashoffset: 0,
              }
            : undefined
        }
      />

      {/* Right journey: the mirror. Together they enclose the shared lens. */}
      <path
        d="M24 6C36 14 36 34 24 42"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        style={
          animated
            ? {
                strokeDasharray: MARK_ARC_LENGTH,
                strokeDashoffset: 0,
              }
            : undefined
        }
      />

      {/* The meeting. Gold in the gradient treatment, inherited otherwise. */}
      <circle cx="24" cy="24" r="3.1" fill={gradient ? 'var(--gold-400)' : 'currentColor'} />
    </svg>
  );
}
