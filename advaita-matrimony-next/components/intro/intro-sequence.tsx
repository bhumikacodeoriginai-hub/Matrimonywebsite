'use client';

/**
 * First-launch intro sequence.
 *
 * Two light paths travel in from opposite edges, two rings follow, they meet,
 * bloom, and resolve into the Advaita mark with the tagline
 * "Where meaningful connections begin." ≈2.6 seconds, then it clears.
 *
 * WHEN IT PLAYS
 * -------------
 * Once per browser session, on the landing page only. The decision is made by
 * `INTRO_GATE_SCRIPT` (components/intro/intro-gate.ts), inlined by the root layout
 * and run BEFORE first paint, which is what avoids both failure modes:
 *   • deciding on the client after mount → a flash of the landing page first
 *   • deciding on the server → repeat visitors get a flash of the intro
 *
 * WHEN IT DOES NOT PLAY
 * ---------------------
 *   • `prefers-reduced-motion: reduce`  — skipped entirely, not merely shortened
 *   • already seen this session          — sessionStorage flag
 *   • JavaScript unavailable             — the CSS default is `display: none`, so
 *                                          the absence of the script means no intro
 *   • forced-colors mode                 — it carries no information
 *   • any deep link that is not "/"      — you do not get a curtain on your way to
 *                                          a conversation
 *
 * ACCESSIBILITY
 *   • The animated stage is `aria-hidden`, so a screen reader reads the real page
 *     underneath immediately — it never waits for the animation.
 *   • Focus is NOT trapped and NOT moved.
 *   • A visible Skip button, plus any key press, pointer press or scroll dismisses
 *     it at once.
 *
 * PERFORMANCE NOTE (honest accounting)
 * ------------------------------------
 * The overlay is painted above the landing page, which renders underneath on the
 * same frame — it does not delay the hero's paint or make its content
 * conditional. Only `transform`, `opacity` and `filter` animate, all
 * composited, and the entire sequence is inline SVG and gradients with no network
 * requests. That said, an intro is time between arriving and reading, and it will
 * show up in field data for any metric measured against first interaction. It is
 * capped at 2.6s, plays once per session, and is always skippable for exactly that
 * reason. See docs/PERFORMANCE.md.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { AdvaitaMark } from '../brand/advaita-mark';
import { INTRO_SESSION_KEY } from './intro-gate';
import styles from './intro-sequence.module.css';

/** Total sequence length. Keep in sync with --duration-intro (2600ms). */
const SEQUENCE_MS = 2600;
/** Curtain fade, matching --duration-slower. */
const CURTAIN_MS = 460;

/** Fixed particle vectors — deterministic, so SSR and client agree. */
const PARTICLES: { x: number; y: number; delay: number; opacity: number }[] = [
  { x: -54, y: -68, delay: 0, opacity: 0.8 },
  { x: 48, y: -76, delay: 90, opacity: 0.65 },
  { x: -78, y: -26, delay: 150, opacity: 0.5 },
  { x: 82, y: -34, delay: 60, opacity: 0.7 },
  { x: -30, y: -96, delay: 210, opacity: 0.45 },
  { x: 34, y: -104, delay: 170, opacity: 0.55 },
  { x: -96, y: 18, delay: 240, opacity: 0.4 },
  { x: 92, y: 24, delay: 120, opacity: 0.5 },
];

export function IntroSequence({ tagline = 'Where meaningful connections begin.' }: { tagline?: string }) {
  /**
   * Starts mounted so the overlay is in the server-rendered HTML and the CSS
   * gate can show it on the first frame. If the gate did not fire, CSS keeps it
   * `display: none` and the effect below unmounts it immediately.
   */
  const [mounted, setMounted] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const dismissed = useRef(false);

  const dismiss = useCallback((immediate = false) => {
    if (dismissed.current) return;
    dismissed.current = true;

    // Clear the gate first so the overlay stops being painted even if the
    // unmount below is delayed by a busy main thread.
    document.documentElement.removeAttribute('data-intro');

    try {
      window.sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // Private mode: the intro will simply play again next time. Acceptable.
    }

    if (immediate) {
      setMounted(false);
      return;
    }

    setLeaving(true);
    window.setTimeout(() => setMounted(false), CURTAIN_MS);
  }, []);

  useEffect(() => {
    // Did the gate script actually decide to play? If not, unmount at once —
    // this is the path taken by repeat visits, reduced motion and no-JS hydration.
    const playing = document.documentElement.getAttribute('data-intro') === 'play';
    if (!playing) {
      setMounted(false);
      return;
    }

    // Natural completion.
    const timer = window.setTimeout(() => dismiss(), SEQUENCE_MS);

    // Any deliberate input ends it now. `once` so we do not leak listeners.
    const onInput = () => dismiss();
    const options = { once: true, passive: true } as const;
    window.addEventListener('keydown', onInput, { once: true });
    window.addEventListener('pointerdown', onInput, options);
    window.addEventListener('wheel', onInput, options);
    window.addEventListener('touchstart', onInput, options);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onInput);
      window.removeEventListener('pointerdown', onInput);
      window.removeEventListener('wheel', onInput);
      window.removeEventListener('touchstart', onInput);
    };
  }, [dismiss]);

  if (!mounted) return null;

  return (
    <div className={[styles.root, leaving ? styles.leaving : ''].filter(Boolean).join(' ')}>
      {/* Purely visual. Hidden from assistive tech so the page underneath is
          available to a screen reader from the very first moment. */}
      <div className={styles.stage} aria-hidden="true">
        <span className={`${styles.path} ${styles.pathLeft}`} />
        <span className={`${styles.path} ${styles.pathRight}`} />

        <span className={`${styles.ring} ${styles.ringLeft}`} />
        <span className={`${styles.ring} ${styles.ringRight}`} />

        <span className={styles.bloom} />

        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className={styles.particle}
            style={
              {
                ['--particle-x']: `${particle.x}px`,
                ['--particle-y']: `${particle.y}px`,
                ['--particle-opacity']: particle.opacity,
                animationDelay: `${900 + particle.delay}ms`,
              } as React.CSSProperties
            }
          />
        ))}

        <span className={styles.mark}>
          <AdvaitaMark size={92} gradient idSuffix="intro" strokeWidth={1.8} />
        </span>

        <div className={styles.words}>
          <p className={styles.wordmark}>Advaita</p>
          <span className={styles.rule} />
          <p className={styles.tagline}>{tagline}</p>
        </div>
      </div>

      <button type="button" className={styles.skip} onClick={() => dismiss(true)}>
        Skip intro
      </button>
    </div>
  );
}
