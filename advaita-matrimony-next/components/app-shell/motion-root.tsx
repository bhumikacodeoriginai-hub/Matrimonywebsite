'use client';

/**
 * Mounts the single page-wide scroll-reveal observer.
 *
 * Rendered once, high in the root layout. Renders no markup — it exists purely so
 * `useRevealObserver` runs in a Client Component while the rest of the tree stays
 * server-rendered. One observer for the whole document, rather than one per
 * revealing element.
 */

import { useRevealObserver } from '../../lib/hooks/use-reveal';

export function MotionRoot() {
  useRevealObserver();
  return null;
}
