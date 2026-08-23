/**
 * Photo URL construction.
 *
 * The API returns RELATIVE paths on Laravel's `public` disk (e.g.
 * `photos/7/thumbnails/profile_7_abc_thumb.jpg`). There is no media route on the
 * Laravel side, so the browser reaches them at `{APP_URL}/storage/{path}` — which
 * requires `php artisan storage:link` to have been run.
 *
 * ⚠️ PRIVACY LIMITATION — READ THIS BEFORE TRUSTING THE BLUR
 * ---------------------------------------------------------
 * Because every variant sits on the public disk, photo privacy is currently
 * COSMETIC. `PhotoService` writes four files per upload — original, watermarked,
 * blurred, thumbnail — and the API is careful to hand a non-authorised viewer
 * only the `blurred` path. But the `original` remains publicly fetchable by
 * anyone who guesses or is given its URL, and photos still awaiting moderation
 * are reachable too.
 *
 * The UI here does the right thing: it only ever renders the URL the server
 * chose, never derives an original path from a blurred one, and never preloads a
 * clear image behind a blur filter. That keeps the client honest, but it does not
 * make the storage layer safe.
 *
 * The real fix is server-side and is tracked in docs/SECURITY_FINDINGS.md:
 * move originals off the public disk and serve every user photo through an
 * authorising route.
 */

import { getMediaBaseUrl } from './client';

/** Neutral, non-photographic placeholder. Inline so it costs no request. */
export const AVATAR_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f2edea'/%3E%3Ccircle cx='40' cy='31' r='13' fill='%23d2c8c3'/%3E%3Cpath d='M12 80c0-15.5 12.5-28 28-28s28 12.5 28 28z' fill='%23d2c8c3'/%3E%3C/svg%3E";

/**
 * Resolves an API-supplied photo path to a URL the browser can load.
 * Returns `null` for absent paths so callers can fall back deliberately.
 */
export function photoUrl(path: string | null | undefined): string | null {
  if (!path) return null;

  // Already absolute (or a data URI) — pass through untouched.
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;

  const clean = path.replace(/^\/+/, '');

  // Tolerate paths that already carry the storage prefix.
  const withPrefix = clean.startsWith('storage/') ? clean : `storage/${clean}`;

  return `${getMediaBaseUrl()}/${withPrefix}`;
}

/** Photo URL with the placeholder substituted when there is no photo. */
export function photoUrlOrPlaceholder(path: string | null | undefined): string {
  return photoUrl(path) ?? AVATAR_PLACEHOLDER;
}

/** Chat attachments live on the same public disk. */
export function attachmentUrl(path: string | null | undefined): string | null {
  return photoUrl(path);
}
