'use client';

import { useEffect } from 'react';

/**
 * Scroll-triggered reveal, as one page-level observer rather than a hook per
 * element.
 *
 * PROGRESSIVE ENHANCEMENT CONTRACT
 * --------------------------------
 * Elements marked `data-reveal` are VISIBLE by default. Only after this hook
 * confirms that (a) JavaScript is running and (b) motion is welcome does it set
 * `data-reveal-ready` on <html>, which is the CSS selector that hides them
 * pending intersection (see styles/animations.css).
 *
 * So if JS fails, is disabled, or the member prefers reduced motion, nothing is
 * ever hidden. Content-hiding animation that can strand content is one of the
 * most common accessibility failures in "premium" sites; this inverts the risk.
 *
 * Mount once, high in the tree — components/app-shell/motion-root.tsx does it.
 */
export function useRevealObserver(): void {
  useEffect(() => {
    const root = document.documentElement;

    // Respect reduced motion: never hide anything in the first place.
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') return;

    root.dataset.revealReady = 'true';

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.dataset.revealed = 'true';
          // Reveal once, then stop watching — this is an entrance, not a toggle.
          observer.unobserve(element);
        }
      },
      {
        // Start slightly before the element enters, so the motion finishes as it
        // arrives rather than after the member is already looking at it.
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.05,
      },
    );

    const observeAll = () => {
      const targets = document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])');
      targets.forEach((target) => {
        // Anything already on screen at mount reveals immediately, so
        // above-the-fold content never waits for a scroll that may not happen.
        const box = target.getBoundingClientRect();
        if (box.top < window.innerHeight && box.bottom > 0) {
          target.dataset.revealed = 'true';
          return;
        }
        observer.observe(target);
      });
    };

    observeAll();

    // Client-side navigation and lazily rendered lists add new targets.
    const mutationObserver = new MutationObserver(() => observeAll());
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    // Safety net: if anything is still hidden after 3s (observer never fired,
    // element in a display:none ancestor, etc.), show it. Never strand content.
    const failsafe = window.setTimeout(() => {
      document
        .querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])')
        .forEach((element) => (element.dataset.revealed = 'true'));
    }, 3000);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.clearTimeout(failsafe);
      delete root.dataset.revealReady;
    };
  }, []);
}
