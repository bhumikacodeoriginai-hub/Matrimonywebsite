'use client';

/**
 * Hero visual: three floating cards orbiting the Advaita mark, with pointer
 * parallax.
 *
 * WHAT THESE CARDS SHOW, AND WHY
 * ------------------------------
 * The obvious thing to put here is a set of profile cards — "Priya, 26, Designer,
 * Mumbai". Two reasons we do not:
 *
 *  1. Real profiles are members-only. Every profile on this platform is behind
 *     `auth:sanctum`, photos default to `members_only`, and contact details are
 *     masked. Surfacing real members on a public marketing page would contradict
 *     the exact promise the page is making.
 *  2. Invented people are a lie. The previous version of this page showed
 *     hard-coded names, ages, cities and quotes over stock photography, presented
 *     as members. That is the thing this redesign was asked to remove.
 *
 * So the cards carry the platform's PROMISES over abstract avatar shapes. They are
 * honest, they need no stock imagery (nothing to download — the whole visual is
 * CSS and inline SVG), and they say something a prospective member actually wants
 * to know.
 *
 * PARALLAX: pointer position drives two custom properties; each card multiplies
 * them by its own `--depth`, including one negative depth so the layers separate.
 * Gated behind a fine pointer (no jitter from touch) and removed entirely by
 * `prefers-reduced-motion` via the `.motion-parallax` class from base.css.
 */

import { useEffect, useRef } from 'react';
import { AdvaitaMark } from '../brand/advaita-mark';
import { Icon, type IconName } from '../ui/icon';
import { useHasFinePointer, useReducedMotion } from '../../lib/hooks/use-media';
import { useLanguage } from './language-provider';
import styles from './landing.module.css';

/** Maximum travel in px at the extremes of the viewport. Small on purpose. */
const PARALLAX_RANGE = 14;

export function HeroVisual() {
  const { copy } = useLanguage();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hasFinePointer = useHasFinePointer();
  const reducedMotion = useReducedMotion();

  const parallaxEnabled = hasFinePointer && !reducedMotion;

  useEffect(() => {
    if (!parallaxEnabled) return;
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      // Coalesce into one write per frame; pointermove fires far faster than
      // the display refreshes.
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        // -1..1 relative to the viewport centre.
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        stage.style.setProperty('--parallax-x', `${(-x * PARALLAX_RANGE).toFixed(2)}px`);
        stage.style.setProperty('--parallax-y', `${(-y * PARALLAX_RANGE).toFixed(2)}px`);
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame) cancelAnimationFrame(frame);
      stage.style.removeProperty('--parallax-x');
      stage.style.removeProperty('--parallax-y');
    };
  }, [parallaxEnabled]);

  const cards: { icon: IconName; title: string; body: string; className: string }[] = [
    {
      icon: 'shield-check',
      title: copy.trustVerified,
      body: copy.trustVerifiedBody,
      className: styles.floatCardOne,
    },
    {
      icon: 'lock',
      title: copy.trustPrivacy,
      body: copy.trustPrivacyBody,
      className: styles.floatCardTwo,
    },
    {
      icon: 'accessibility',
      title: copy.trustInclusive,
      body: copy.trustInclusiveBody,
      className: styles.floatCardThree,
    },
  ];

  return (
    <div className={styles.heroVisual}>
      {/* Decorative blur field. Removed under reduced motion / forced colours. */}
      <div className={`${styles.visualGlow} motion-decoration`} aria-hidden="true" />

      <div ref={stageRef} className={`${styles.visualStack} motion-parallax`}>
        <div className={styles.mediaFrame}>
          <video
            className={styles.mediaVideo}
            autoPlay={!reducedMotion}
            muted
            loop
            playsInline
            preload={reducedMotion ? 'none' : 'metadata'}
            poster="/media/hero-poster.svg"
            aria-label="Abstract Advaita Matrimony visual preview"
          >
            <source src="/api/media/advaithamatrimony.mp4" type="video/mp4" />
            <track
              kind="captions"
              src="/api/media/hero-video-description.vtt"
              srcLang="en"
              label="Visual description"
            />
          </video>
          <div className={styles.mediaScrim} aria-hidden="true" />
          <div className={styles.mediaLabel}>
            <span className={styles.mediaLabelDot} aria-hidden="true" />
            <span>Designed around consent</span>
          </div>
        </div>

        {cards.map((card) => (
          <div key={card.title} className={`${styles.floatCard} ${card.className}`}>
            <div className={styles.floatHead}>
              <span className={styles.floatAvatar} aria-hidden="true">
                <Icon name={card.icon} />
              </span>
              <span className={styles.floatMeta}>
                <span className={styles.floatTitle}>{card.title}</span>
              </span>
            </div>
            <p className={styles.floatBody}>{card.body}</p>
          </div>
        ))}

        <div className={styles.visualCore} aria-hidden="true">
          <AdvaitaMark size={52} idSuffix="hero-core" strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}
