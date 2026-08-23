/**
 * Progress indicators: ProgressBar, ProgressRing, StepProgress.
 *
 * ACCESSIBILITY: each one exposes a real `role="progressbar"` with
 * `aria-valuenow/min/max` and a text alternative, because a member using a screen
 * reader needs "profile 70 percent complete", not a decorative bar. Indeterminate
 * bars omit `aria-valuenow`, which is how assistive tech knows the value is
 * genuinely unknown rather than zero.
 */

import type { ReactNode } from 'react';
import { clamp, percent } from '../../lib/format';
import styles from './progress.module.css';

export type ProgressTone = 'brand' | 'accent' | 'verified' | 'premium' | 'danger';

const FILL_TONE: Record<ProgressTone, string> = {
  brand: '',
  accent: styles.fillAccent,
  verified: styles.fillVerified,
  premium: styles.fillPremium,
  danger: styles.fillDanger,
};

/* ==========================================================================
   ProgressBar
   ========================================================================== */

export interface ProgressBarProps {
  /** 0–100. Ignored when `indeterminate`. */
  value?: number;
  label?: string;
  /** Right-hand readout. Defaults to the percentage. Pass null to hide it. */
  valueText?: string | null;
  tone?: ProgressTone;
  size?: 'slim' | 'default' | 'thick';
  indeterminate?: boolean;
  className?: string;
  /** Accessible name when there is no visible label. */
  'aria-label'?: string;
}

export function ProgressBar({
  value = 0,
  label,
  valueText,
  tone = 'brand',
  size = 'default',
  indeterminate = false,
  className,
  'aria-label': ariaLabel,
}: ProgressBarProps) {
  const safe = clamp(value, 0, 100);
  const readout = valueText === undefined ? percent(safe) : valueText;

  return (
    <div className={[styles.barWrap, className].filter(Boolean).join(' ')}>
      {(label || readout) && (
        <div className={styles.barHead}>
          {label && <span className={styles.barLabel}>{label}</span>}
          {readout && <span className={`${styles.barValue} tnum`}>{readout}</span>}
        </div>
      )}

      <div
        className={[
          styles.track,
          size === 'slim' ? styles.trackSlim : '',
          size === 'thick' ? styles.trackThick : '',
        ]
          .filter(Boolean)
          .join(' ')}
        role="progressbar"
        aria-valuemin={indeterminate ? undefined : 0}
        aria-valuemax={indeterminate ? undefined : 100}
        /* Omitted while indeterminate — that is the signal for "unknown". */
        aria-valuenow={indeterminate ? undefined : Math.round(safe)}
        aria-valuetext={indeterminate ? undefined : percent(safe)}
        aria-label={ariaLabel ?? label}
      >
        <div
          className={[styles.fill, FILL_TONE[tone], indeterminate ? styles.indeterminate : '']
            .filter(Boolean)
            .join(' ')}
          style={
            indeterminate ? undefined : ({ ['--progress' as string]: safe / 100 } as React.CSSProperties)
          }
        />
      </div>
    </div>
  );
}

/* ==========================================================================
   ProgressRing
   ========================================================================== */

export interface ProgressRingProps {
  /** 0–100. */
  value: number;
  size?: number;
  strokeWidth?: number;
  /** Large figure in the middle. Defaults to the rounded percentage. */
  children?: ReactNode;
  caption?: string;
  className?: string;
  'aria-label'?: string;
}

/**
 * Circular progress, used for profile completion.
 *
 * The gradient is defined once in a `<defs>` inside this component with a FIXED
 * id (`advaita-ring-gradient`) which the stylesheet references. Rendering several
 * rings on one page is fine — duplicate identical gradient definitions resolve to
 * the same paint.
 */
export function ProgressRing({
  value,
  size = 96,
  strokeWidth = 8,
  children,
  caption,
  className,
  'aria-label': ariaLabel,
}: ProgressRingProps) {
  const safe = clamp(value, 0, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - safe / 100);

  return (
    <div
      className={[styles.ring, className].filter(Boolean).join(' ')}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(safe)}
      aria-valuetext={percent(safe)}
      aria-label={ariaLabel ?? caption ?? 'Progress'}
    >
      <svg className={styles.ringSvg} width={size} height={size} aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="advaita-ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--plum-600)" />
            <stop offset="55%" stopColor="var(--rose-500)" />
            <stop offset="100%" stopColor="var(--gold-400)" />
          </linearGradient>
        </defs>

        <circle
          className={styles.ringTrack}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className={styles.ringFill}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className={styles.ringCenter} style={{ ['--ring-value-size' as string]: `${size / 4.2}px` }}>
        <span className={styles.ringValue}>{children ?? `${Math.round(safe)}%`}</span>
        {caption && <span className={styles.ringCaption}>{caption}</span>}
      </div>
    </div>
  );
}

/* ==========================================================================
   StepProgress
   ========================================================================== */

export interface StepProgressProps {
  /** 1-based index of the current step. */
  current: number;
  total: number;
  /** Name of the current step, e.g. "Education & career". */
  stepLabel?: string;
  /**
   * Jump back to an earlier step. Only completed steps are clickable — letting
   * someone skip ahead past required fields creates errors they did not cause.
   */
  onStepSelect?: (step: number) => void;
  /** Highest step reached, so revisiting is allowed up to here. */
  furthestStep?: number;
  className?: string;
}

export function StepProgress({
  current,
  total,
  stepLabel,
  onStepSelect,
  furthestStep,
  className,
}: StepProgressProps) {
  const reachable = furthestStep ?? current;
  const pct = (current / total) * 100;

  return (
    <div className={[styles.steps, className].filter(Boolean).join(' ')}>
      <div className={styles.stepsHead}>
        {stepLabel && <span className={styles.stepsTitle}>{stepLabel}</span>}
        <span className={styles.stepsCount}>
          Step {current} of {total}
        </span>
      </div>

      <div
        className={styles.dots}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`Step ${current} of ${total}${stepLabel ? `: ${stepLabel}` : ''}`}
      >
        {Array.from({ length: total }).map((_, index) => {
          const step = index + 1;
          const done = step < current;
          const isCurrent = step === current;
          const classes = [styles.dot, done ? styles.dotDone : '', isCurrent ? styles.dotCurrent : '']
            .filter(Boolean)
            .join(' ');

          if (!onStepSelect || step > reachable) {
            return <span key={step} className={classes} aria-hidden="true" />;
          }

          return (
            <button
              key={step}
              type="button"
              className={classes}
              onClick={() => onStepSelect(step)}
              disabled={isCurrent}
              aria-label={`Go back to step ${step}`}
              aria-current={isCurrent ? 'step' : undefined}
            />
          );
        })}
      </div>

      {/* Belt and braces: the visual bar is dots, but some assistive tech reads
          the percentage more reliably than a valuetext string. */}
      <span className="sr-only">{percent(pct)} complete</span>
    </div>
  );
}
