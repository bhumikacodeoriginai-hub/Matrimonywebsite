/**
 * Avatar.
 *
 * Uses a plain <img> rather than next/image on purpose: these come from the
 * Laravel `public` disk on a separate host at runtime, so they cannot be
 * statically analysed, and adding every deployment's media host to
 * `images.remotePatterns` is a config footgun. What next/image would buy us here
 * (resizing) is already done server-side — `PhotoService` writes a 200px
 * thumbnail, which is exactly what avatars load.
 *
 * `loading="lazy"` and `decoding="async"` are set so long lists of avatars do not
 * block rendering, and explicit width/height prevent layout shift.
 */

import { initials as toInitials } from '../../lib/format';
import { photoUrl } from '../../lib/api/media';
import styles from './avatar.module.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type AvatarRing = 'none' | 'default' | 'premium' | 'accent';
export type AvatarPresence = 'none' | 'online' | 'recent' | 'offline';

const PIXEL_SIZE: Record<AvatarSize, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 76,
  xxl: 112,
};

export interface AvatarProps {
  /** Relative photo path from the API. Null renders the initials fallback. */
  src?: string | null;
  /** Used for the initials fallback and the image's alt text. */
  name: string;
  size?: AvatarSize;
  ring?: AvatarRing;
  presence?: AvatarPresence;
  /** Rounded-rectangle instead of a circle. */
  squared?: boolean;
  className?: string;
  /**
   * Set when the avatar sits next to the member's name in the same link/card.
   * The image then gets `alt=""` so a screen reader does not read the name twice.
   */
  decorative?: boolean;
  /** Skips lazy-loading. Use for the one avatar that is above the fold. */
  priority?: boolean;
}

export function Avatar({
  src,
  name,
  size = 'md',
  ring = 'none',
  presence = 'none',
  squared = false,
  className,
  decorative = false,
  priority = false,
}: AvatarProps) {
  const url = photoUrl(src);
  const px = PIXEL_SIZE[size];

  const classes = [
    styles.avatar,
    styles[size],
    ring === 'default' ? styles.ring : '',
    ring === 'premium' ? styles.ringPremium : '',
    ring === 'accent' ? styles.ringAccent : '',
    squared ? styles.squared : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {url ? (
        <img
          className={styles.image}
          src={url}
          alt={decorative ? '' : `${name}'s profile photo`}
          width={px}
          height={px}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          // Members' photos must not leak their profile URL to the media host.
          referrerPolicy="no-referrer"
        />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {toInitials(name)}
        </span>
      )}

      {presence !== 'none' && (
        <span
          className={[
            styles.presence,
            presence === 'online' ? styles.presenceOnline : '',
            presence === 'recent' ? styles.presenceRecent : '',
          ]
            .filter(Boolean)
            .join(' ')}
          // The text equivalent belongs to <StatusDot>, which is rendered
          // alongside wherever presence actually matters.
          aria-hidden="true"
        />
      )}
    </span>
  );
}

/* ==========================================================================
   AvatarStack
   ========================================================================== */

export interface AvatarStackProps {
  people: { id: number | string; name: string; photo?: string | null }[];
  /** How many faces to show before collapsing into "+N". */
  max?: number;
  size?: AvatarSize;
  /** Describes the whole group, e.g. "12 members viewed your profile". */
  label: string;
}

export function AvatarStack({ people, max = 4, size = 'sm', label }: AvatarStackProps) {
  const shown = people.slice(0, max);
  const remaining = people.length - shown.length;

  return (
    <span className={styles.stack} role="img" aria-label={label}>
      {shown.map((person) => (
        <Avatar key={person.id} src={person.photo} name={person.name} size={size} decorative />
      ))}
      {remaining > 0 && (
        <span className={styles.stackMore} aria-hidden="true">
          +{remaining}
        </span>
      )}
    </span>
  );
}
