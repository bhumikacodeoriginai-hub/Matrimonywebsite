'use client';

import { useEffect, useState } from 'react';

/**
 * Media-query hooks, all SSR-safe.
 *
 * They deliberately return the "safe" value on the server and during the first
 * client render, then update after mount. For `useReducedMotion` the safe value
 * is `false` (assume motion is fine) because the CSS in styles/base.css already
 * neutralises animation for reduced-motion users without any JavaScript. JS-driven
 * motion is the only thing that needs this hook, and a single frame of it before
 * hydration is not a hazard.
 */

function subscribe(query: string, onChange: (matches: boolean) => void): () => void {
  const list = window.matchMedia(query);
  const handler = (event: MediaQueryListEvent) => onChange(event.matches);
  onChange(list.matches);
  list.addEventListener('change', handler);
  return () => list.removeEventListener('change', handler);
}

export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    return subscribe(query, setMatches);
  }, [query]);

  return matches;
}

/**
 * True when the member has asked for less motion.
 *
 * Use this to SKIP JavaScript-driven animation entirely — never to merely shorten
 * it. The intro sequence, for example, does not play at all: it resolves straight
 * to its final frame.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)', false);
}

/** Matches the layout breakpoint where the dashboard switches to mobile nav. */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)', false);
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)', false);
}

/**
 * True for genuine mouse/trackpad pointers. Used to gate hover-only affordances
 * so touch users are never left with actions they cannot reach.
 */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)', false);
}

/**
 * True once the component has mounted on the client.
 * The standard escape hatch for rendering something that cannot match the server
 * (e.g. a value from localStorage) without a hydration mismatch.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
