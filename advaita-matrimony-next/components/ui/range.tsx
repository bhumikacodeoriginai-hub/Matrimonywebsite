'use client';

/**
 * RangeSlider — dual-thumb, and SingleRange — one thumb.
 *
 * Both wrap native `<input type="range">`. See range.module.css for why. The two
 * stacked inputs each carry their own `aria-label` ("Minimum age", "Maximum age")
 * so a screen reader user always knows which end they are moving, and the visible
 * readout is mirrored into `aria-valuetext` so they hear "26 years", not "26".
 *
 * The thumbs cannot cross: each clamps against the other with a `minGap`. Crossed
 * thumbs produce an inverted range that the API would silently return nothing for.
 */

import { useId } from 'react';
import { clamp } from '../../lib/format';
import styles from './range.module.css';

export interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  /** Formats both the visible readout and the accessible value text. */
  format?: (value: number) => string;
  /** Smallest allowed distance between the thumbs. */
  minGap?: number;
  /** Names for each thumb, for assistive tech. */
  minLabel?: string;
  maxLabel?: string;
  /** Shows the min/max endpoints under the track. */
  showScale?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = (input) => String(input),
  minGap = step,
  minLabel,
  maxLabel,
  showScale = true,
  disabled = false,
  className,
}: RangeSliderProps) {
  const id = useId();
  const [low, high] = value;

  const span = max - min || 1;
  const startPct = ((low - min) / span) * 100;
  const endPct = ((high - min) / span) * 100;

  const setLow = (next: number) => {
    // Clamp against the upper thumb so they can never cross.
    onChange([clamp(next, min, high - minGap), high]);
  };

  const setHigh = (next: number) => {
    onChange([low, clamp(next, low + minGap, max)]);
  };

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        {/* A plain span, not a <label>: this names a GROUP of two inputs, and a
            label may only point at one. The fieldset-free equivalent is each
            input carrying its own aria-label, which they do. */}
        <span className={styles.label} id={`${id}-label`}>
          {label}
        </span>
        <span className={styles.readout}>
          {format(low)} – {format(high)}
        </span>
      </div>

      <div
        className={styles.track}
        style={
          {
            ['--range-start']: `${startPct}%`,
            ['--range-end']: `${endPct}%`,
          } as React.CSSProperties
        }
      >
        <span className={styles.rail} aria-hidden="true" />
        <span className={styles.selected} aria-hidden="true" />

        <input
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(event: { target: { value: string } }) => setLow(Number(event.target.value))}
          disabled={disabled}
          aria-label={minLabel ?? `${label}, minimum`}
          aria-valuetext={format(low)}
        />

        <input
          className={`${styles.input} ${styles.inputUpper}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(event: { target: { value: string } }) => setHigh(Number(event.target.value))}
          disabled={disabled}
          aria-label={maxLabel ?? `${label}, maximum`}
          aria-valuetext={format(high)}
        />
      </div>

      {showScale && (
        <div className={styles.scale} aria-hidden="true">
          <span>{format(min)}</span>
          <span>{format(max)}</span>
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   SingleRange
   ========================================================================== */

export interface SingleRangeProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  disabled?: boolean;
  className?: string;
}

export function SingleRange({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  format = (input) => String(input),
  disabled = false,
  className,
}: SingleRangeProps) {
  const id = useId();
  const pct = ((value - min) / (max - min || 1)) * 100;

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
        <span className={styles.readout}>{format(value)}</span>
      </div>

      <div
        className={styles.track}
        style={{ ['--range-start' as string]: '0%', ['--range-end' as string]: `${pct}%` }}
      >
        <span className={styles.rail} aria-hidden="true" />
        <span className={styles.selected} aria-hidden="true" />
        <input
          id={id}
          className={styles.input}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event: { target: { value: string } }) => onChange(Number(event.target.value))}
          disabled={disabled}
          aria-valuetext={format(value)}
        />
      </div>
    </div>
  );
}
