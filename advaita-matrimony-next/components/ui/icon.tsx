/**
 * Icon system.
 *
 * Hand-drawn inline SVG rather than an icon package, for three reasons:
 *  1. No npm dependency (a hard constraint of this build — see
 *     docs/OFFLINE_VERIFICATION.md).
 *  2. Nothing to download at runtime and no icon-font FOUT. Each glyph is a few
 *     hundred bytes of markup that ships with the component that uses it.
 *  3. A consistent drawing grid: 24×24, 1.6 stroke, round caps and joins. Mixed
 *     icon sets are one of the fastest ways to make a premium UI look assembled
 *     from parts.
 *
 * ACCESSIBILITY
 * Icons are decorative by default: `aria-hidden` with no title, because in almost
 * every case they sit beside a real text label. Pass a `label` ONLY when the icon
 * is the sole content of a control, and prefer putting the label on the button
 * itself. There is no third option where an icon is both decorative and named.
 */

import type { CSSProperties } from 'react';

export type IconName =
  // Navigation
  | 'home'
  | 'compass'
  | 'heart'
  | 'heart-filled'
  | 'star'
  | 'star-filled'
  | 'message'
  | 'eye'
  | 'eye-off'
  | 'search'
  | 'bell'
  | 'sparkle'
  | 'user'
  | 'users'
  | 'settings'
  | 'shield'
  | 'shield-check'
  | 'life-buoy'
  // Actions
  | 'check'
  | 'check-circle'
  | 'close'
  | 'plus'
  | 'minus'
  | 'filter'
  | 'sliders'
  | 'edit'
  | 'trash'
  | 'upload'
  | 'camera'
  | 'send'
  | 'paperclip'
  | 'refresh'
  | 'logout'
  | 'copy'
  | 'external'
  | 'more'
  | 'menu'
  | 'flag'
  | 'ban'
  // Direction
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevron-down'
  | 'arrow-right'
  | 'arrow-up-right'
  // Profile facts
  | 'phone'
  | 'mail'
  | 'pin'
  | 'briefcase'
  | 'graduation'
  | 'ruler'
  | 'utensils'
  | 'globe'
  | 'calendar'
  | 'clock'
  | 'home-heart'
  // Inclusion
  | 'accessibility'
  | 'ear'
  | 'hand'
  // Status & data
  | 'lock'
  | 'unlock'
  | 'alert'
  | 'info'
  | 'trending'
  | 'chart'
  | 'crown'
  | 'sun'
  | 'moon'
  | 'image'
  | 'mic';

/**
 * Path data only — every icon inherits the same <svg> wrapper below, which is
 * what guarantees the grid and stroke stay consistent.
 * `f:` prefixed entries are filled rather than stroked.
 */
const PATHS: Record<IconName, string> = {
  /* -------- Navigation -------- */
  home: 'M3 10.2 12 3.5l9 6.7V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z',
  heart: 'M12 20s-7.5-4.6-7.5-9.6A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 7.5 3C19.5 15.4 12 20 12 20z',
  'heart-filled':
    'f:M12 20.4s-7.9-4.9-7.9-10.1A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 7.9 3.3c0 5.2-7.9 10.1-7.9 10.1z',
  star: 'M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8z',
  'star-filled': 'f:M12 3.5l2.6 5.4 5.9.9-4.2 4.1 1 5.9L12 17l-5.3 2.8 1-5.9L3.5 9.8l5.9-.9z',
  message: 'M20 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z',
  eye: 'M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  'eye-off':
    'M4 4l16 16M10.6 6a7.9 7.9 0 0 1 1.4-.1c6 0 9.5 6.1 9.5 6.1a17 17 0 0 1-2.4 3.2M6.6 7.9A16.7 16.7 0 0 0 2.5 12S6 18.1 12 18.1a8 8 0 0 0 3-.5M9.9 9.9a3 3 0 0 0 4.2 4.2',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM16.2 16.2 21 21',
  bell: 'M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6zM10.3 20a2 2 0 0 0 3.4 0',
  sparkle:
    'M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7zM18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0',
  users:
    'M9.5 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a7 7 0 0 1 14 0M16.5 5.2a3.5 3.5 0 0 1 0 6.6M18 20h3.5a5.6 5.6 0 0 0-2.8-4.6',
  settings:
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.2 14.4a1.5 1.5 0 0 0 .3 1.7l.1.1a1.6 1.6 0 1 1-2.3 2.3l-.1-.1a1.5 1.5 0 0 0-1.7-.3 1.5 1.5 0 0 0-.9 1.4v.2a1.6 1.6 0 1 1-3.2 0v-.1a1.5 1.5 0 0 0-1-1.4 1.5 1.5 0 0 0-1.7.3l-.1.1a1.6 1.6 0 1 1-2.3-2.3l.1-.1a1.5 1.5 0 0 0 .3-1.7 1.5 1.5 0 0 0-1.4-.9H4a1.6 1.6 0 1 1 0-3.2h.2a1.5 1.5 0 0 0 1.4-1 1.5 1.5 0 0 0-.3-1.7l-.1-.1a1.6 1.6 0 1 1 2.3-2.3l.1.1a1.5 1.5 0 0 0 1.7.3H9.5a1.5 1.5 0 0 0 .9-1.4V4a1.6 1.6 0 1 1 3.2 0v.2a1.5 1.5 0 0 0 .9 1.4 1.5 1.5 0 0 0 1.7-.3l.1-.1a1.6 1.6 0 1 1 2.3 2.3l-.1.1a1.5 1.5 0 0 0-.3 1.7v.1a1.5 1.5 0 0 0 1.4.9h.2a1.6 1.6 0 1 1 0 3.2h-.2a1.5 1.5 0 0 0-1.4.9z',
  shield: 'M12 21s7-3 7-9V5.8L12 3 5 5.8V12c0 6 7 9 7 9z',
  'shield-check': 'M12 21s7-3 7-9V5.8L12 3 5 5.8V12c0 6 7 9 7 9zM9 12l2 2 4-4',
  'life-buoy':
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM5.6 5.6l3.9 3.9M14.5 14.5l3.9 3.9M18.4 5.6l-3.9 3.9M9.5 14.5l-3.9 3.9',

  /* -------- Actions -------- */
  check: 'M5 12.5l4.5 4.5L19 7.5',
  'check-circle': 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8.5 12.2l2.4 2.4 4.6-4.8',
  close: 'M6 6l12 12M18 6 6 18',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  filter: 'M3 6h18M6 12h12M10 18h4',
  sliders: 'M4 8h10M18 8h2M4 16h4M12 16h8M15 5.5v5M8.5 13.5v5',
  edit: 'M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17zM14.5 6.5l3 3',
  trash:
    'M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M10 11v6M14 11v6',
  upload: 'M12 16V4M8 8l4-4 4 4M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3',
  camera:
    'M4 8h2.5L8 6h8l1.5 2H20v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zM12 17a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z',
  send: 'M21 3 3 10.5l7 2.5 2.5 7z',
  paperclip: 'M20 11.5 12 19.5a4.6 4.6 0 0 1-6.5-6.5l8-8a3 3 0 0 1 4.3 4.3l-8 8a1.5 1.5 0 0 1-2.1-2.1L14.5 9',
  refresh: 'M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 8 6 12l4 4M6 12h9',
  copy: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
  external: 'M14 4h6v6M20 4l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4',
  more: 'M6 12h.01M12 12h.01M18 12h.01',
  menu: 'M4 7h16M4 12h16M4 17h16',
  flag: 'M5 21V4M5 5h10l-1.5 3.5L15 12H5',
  ban: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM5.6 5.6l12.8 12.8',

  /* -------- Direction -------- */
  'chevron-left': 'M14.5 6 8.5 12l6 6',
  'chevron-right': 'M9.5 6l6 6-6 6',
  'chevron-up': 'M6 14.5 12 8.5l6 6',
  'chevron-down': 'M6 9.5l6 6 6-6',
  'arrow-right': 'M4 12h16M14 6l6 6-6 6',
  'arrow-up-right': 'M7 17 17 7M8 7h9v9',

  /* -------- Profile facts -------- */
  phone:
    'M7 3.5h3l1.5 4-2 1.5a10 10 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5.5 5.7 2 2 0 0 1 7 3.5z',
  mail: 'M3.5 6h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7l9 6.5L21 7',
  pin: 'M12 21s6.5-6 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15 12 21 12 21zM12 13a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  briefcase:
    'M3.5 8h17a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zM9 8V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M2.5 13h19',
  graduation: 'M12 4 2.5 8.5 12 13l9.5-4.5zM6.5 11v5c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-5M20.5 9.5v5',
  ruler: 'M4 14.5 14.5 4l5.5 5.5L9.5 20zM8 10.5l1.5 1.5M11 7.5 12.5 9M14.5 13 16 14.5',
  utensils: 'M7 3.5v7a2.5 2.5 0 0 0 5 0v-7M9.5 11v9.5M17 3.5c1.7 0 3 2 3 4.5s-1.3 4-3 4v8.5',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3.5 12h17M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z',
  calendar:
    'M4.5 6h15a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM8 3.5V7M16 3.5V7M3.5 11h17',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7.5V12l3 2',
  'home-heart':
    'M3 10.2 12 3.5l9 6.7V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 18s-3-2-3-4a1.8 1.8 0 0 1 3-1.2 1.8 1.8 0 0 1 3 1.2c0 2-3 4-3 4z',

  /* -------- Inclusion -------- */
  accessibility:
    'M12 6.2a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zM7 9.2 12 10.5l5-1.3M12 10.5v4h3.5l2 5.5M12 14.5a4.5 4.5 0 1 0-3.5 5.5',
  ear: 'M7 9a5 5 0 0 1 10 0c0 2.5-1.8 3.4-2.8 4.5-.9 1-.7 2.3-.7 3.2a2.7 2.7 0 0 1-5.2 1M10 9.2a2 2 0 0 1 3.6 1.1',
  hand: 'M8 12V6.5a1.5 1.5 0 0 1 3 0V12M11 11.5V5.2a1.5 1.5 0 0 1 3 0V12M14 11.5V7a1.5 1.5 0 0 1 3 0v7a6.5 6.5 0 0 1-6.5 6.5A6.5 6.5 0 0 1 4 14V11a1.5 1.5 0 0 1 3 0v2',

  /* -------- Status & data -------- */
  lock: 'M6.5 11h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM8.5 11V8a3.5 3.5 0 0 1 7 0v3M12 14.5v2.5',
  unlock:
    'M6.5 11h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1zM8.5 11V8a3.5 3.5 0 0 1 6.8-1.2M12 14.5v2.5',
  alert: 'M12 4 2.8 20h18.4zM12 10v4.5M12 17.2h.01',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  trending: 'M3.5 17 9 11.5l3.5 3.5L20.5 7M15 7h5.5v5.5',
  chart: 'M4 20V4M4 20h16M8 20v-6M12.5 20V8M17 20v-9',
  crown: 'M3.5 8l3.5 3.5L12 5l5 6.5L20.5 8l-1.5 11H5zM5 19h14',
  sun: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2.5V4M12 20v1.5M4.2 4.2l1.1 1.1M18.7 18.7l1.1 1.1M2.5 12H4M20 12h1.5M4.2 19.8l1.1-1.1M18.7 5.3l1.1-1.1',
  moon: 'M20 14.5A8.5 8.5 0 0 1 9.5 4A8.5 8.5 0 1 0 20 14.5z',
  image:
    'M4.5 4.5h15a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1zM9 11a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 9 11zM3.5 17l4.5-4.5 3.5 3 3-2.5 6 5.5',
  mic: 'M12 15a3.5 3.5 0 0 0 3.5-3.5v-5a3.5 3.5 0 0 0-7 0v5A3.5 3.5 0 0 0 12 15zM5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3',
};

export interface IconProps {
  name: IconName;
  /**
   * Any CSS length. Defaults to `1em` so icons scale with their text — which is
   * what keeps them correct when a member increases their browser font size.
   */
  size?: number | string;
  /** Accessible name. Omit for decorative icons sitting next to a text label. */
  label?: string;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}

export function Icon({ name, size = '1em', label, className, style, strokeWidth = 1.6 }: IconProps) {
  const data = PATHS[name];
  const filled = data.startsWith('f:');
  const d = filled ? data.slice(2) : data;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      // Decorative unless named; `focusable` keeps IE/legacy Edge out of tab order.
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
