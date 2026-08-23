'use client';

/**
 * Metrics and mini charts: AnimatedCounter, StatTile, Sparkline, BarChart, Donut.
 *
 * CHARTS ARE NOT IMAGES OF DATA — they are one presentation of it. Every chart
 * here renders a real (screen-reader-only) <table> of the same numbers alongside
 * the SVG, and the SVG itself is `aria-hidden`. That is the only honest way to
 * make a visualisation accessible: a summary `aria-label` tells someone there is a
 * chart, a table tells them what it says.
 *
 * All hand-rolled SVG — no charting dependency (see docs/OFFLINE_VERIFICATION.md).
 * These are small, single-purpose shapes; a charting library here would cost more
 * kilobytes than the rest of the dashboard.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useReducedMotion } from '../../lib/hooks/use-media';
import { formatCount } from '../../lib/format';
import { Icon, type IconName } from './icon';
import styles from './metric.module.css';

/* ==========================================================================
   AnimatedCounter
   ========================================================================== */

export interface AnimatedCounterProps {
  value: number;
  /** Milliseconds for the full count. Kept under the 500ms UI budget by default. */
  duration?: number;
  /** Rendered after the number, e.g. "%" or "+". */
  suffix?: string;
  className?: string;
}

/**
 * Counts up to `value` once, when it first scrolls into view.
 *
 * Reduced motion: renders the final number immediately, with no animation at all.
 * Also renders the final number on the server and before hydration, so the real
 * value is never missing — the animation is decoration on top of correct content.
 */
export function AnimatedCounter({ value, duration = 900, suffix, className }: AnimatedCounterProps) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const nodeRef = useRef<HTMLSpanElement | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (reduced || hasRun.current) {
      setDisplay(value);
      return;
    }

    const node = nodeRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let cancelled = false;

    const animate = () => {
      hasRun.current = true;
      const start = performance.now();
      setDisplay(0);

      const tick = (now: number) => {
        if (cancelled) return;
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic — fast start, gentle settle.
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(value * eased));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration, reduced]);

  return (
    <span ref={nodeRef} className={[styles.counter, className].filter(Boolean).join(' ')}>
      {/* The true value is always in the accessibility tree, never the
          mid-animation number. */}
      <span aria-hidden="true">
        {formatCount(display)}
        {suffix}
      </span>
      <span className="sr-only">
        {formatCount(value)}
        {suffix}
      </span>
    </span>
  );
}

/* ==========================================================================
   StatTile
   ========================================================================== */

export type StatTone = 'brand' | 'accent' | 'verified' | 'premium';

const ICON_TONE: Record<StatTone, string> = {
  brand: styles.iconBrand,
  accent: styles.iconAccent,
  verified: styles.iconVerified,
  premium: styles.iconPremium,
};

export interface StatTileProps {
  label: string;
  value: number;
  icon?: IconName;
  tone?: StatTone;
  suffix?: string;
  /**
   * Change against a previous period. Only pass this when the API genuinely
   * provides comparable historical data — an invented "+12% this week" is a lie
   * dressed as a metric.
   */
  delta?: { value: number; label: string };
  /** Extra content under the value, e.g. a Sparkline. */
  children?: ReactNode;
  footnote?: string;
  interactive?: boolean;
  className?: string;
}

export function StatTile({
  label,
  value,
  icon,
  tone = 'brand',
  suffix,
  delta,
  children,
  footnote,
  interactive = false,
  className,
}: StatTileProps) {
  return (
    <div
      className={[styles.tile, interactive ? styles.tileInteractive : '', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={styles.tileHead}>
        <span className={styles.tileLabel}>{label}</span>
        {icon && (
          <span className={[styles.tileIcon, ICON_TONE[tone]].join(' ')} aria-hidden="true">
            <Icon name={icon} />
          </span>
        )}
      </div>

      <div className={styles.tileValue}>
        <AnimatedCounter value={value} suffix={suffix} />
      </div>

      {children}

      {(delta || footnote) && (
        <div className={styles.tileFoot}>
          {delta && (
            <span
              className={[
                styles.delta,
                delta.value > 0 ? styles.deltaUp : delta.value < 0 ? styles.deltaDown : styles.deltaFlat,
              ].join(' ')}
            >
              <Icon name="trending" />
              {delta.value > 0 ? '+' : ''}
              {formatCount(delta.value)}
            </span>
          )}
          {delta ? <span>{delta.label}</span> : <span>{footnote}</span>}
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   Sparkline
   ========================================================================== */

export interface SparklineProps {
  /** Chronological series. Fewer than 2 points renders nothing. */
  points: { label: string; value: number }[];
  height?: number;
  /** Describes the series, e.g. "Profile views over the last 7 days". */
  caption: string;
  className?: string;
}

export function Sparkline({ points, height = 40, caption, className }: SparklineProps) {
  if (points.length < 2) return null;

  const width = 100;
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  // Flat series would divide by zero; give it a mid-line instead.
  const range = max - min || 1;

  const coords = points.map((point, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((point.value - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  const line = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'}${coord.x.toFixed(2)},${coord.y.toFixed(2)}`)
    .join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;
  const last = coords[coords.length - 1]!;

  return (
    <div className={className}>
      <svg
        className={styles.sparkWrap}
        style={{ ['--spark-height' as string]: `${height}px` }}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="advaita-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--plum-500)" stopOpacity="0.24" />
            <stop offset="100%" stopColor="var(--plum-500)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path className={styles.sparkArea} d={area} />
        <path className={styles.sparkLine} d={line} />
        {/* Marks "now", which is the point people look for. */}
        <circle className={styles.sparkDot} cx={last.x} cy={last.y} r="2.6" />
      </svg>

      {/* The data, for anyone who cannot see the shape. */}
      <table className={styles.srTable}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Period</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{formatCount(point.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==========================================================================
   BarChart
   ========================================================================== */

export interface BarChartProps {
  bars: { label: string; value: number }[];
  height?: number;
  caption: string;
  tone?: 'brand' | 'accent';
  className?: string;
}

export function BarChart({ bars, height = 88, caption, tone = 'brand', className }: BarChartProps) {
  if (bars.length === 0) return null;
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div className={className}>
      <div className={styles.bars} style={{ ['--bars-height' as string]: `${height}px` }} aria-hidden="true">
        {bars.map((bar, index) => (
          <div key={bar.label} className={styles.barCol}>
            <div className={styles.barTrack}>
              <div
                className={[styles.barFill, tone === 'accent' ? styles.barFillAccent : '']
                  .filter(Boolean)
                  .join(' ')}
                style={{
                  height: `${Math.max((bar.value / max) * 100, bar.value > 0 ? 4 : 0)}%`,
                  // Stagger so the bars grow in sequence, not all at once.
                  animationDelay: `${index * 60}ms`,
                }}
              />
            </div>
            <span className={styles.barLabel}>{bar.label}</span>
          </div>
        ))}
      </div>

      <table className={styles.srTable}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Value</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((bar) => (
            <tr key={bar.label}>
              <th scope="row">{bar.label}</th>
              <td>{formatCount(bar.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==========================================================================
   Donut
   ========================================================================== */

export interface DonutProps {
  slices: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  caption: string;
  /** Content for the hole, e.g. a total. */
  children?: ReactNode;
  className?: string;
}

export function Donut({ slices, size = 132, thickness = 16, caption, children, className }: DonutProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total === 0) return null;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Walk the slices, accumulating rotation offsets.
  let consumed = 0;
  const segments = slices.map((slice) => {
    const fraction = slice.value / total;
    const dash = fraction * circumference;
    const offset = consumed * circumference;
    consumed += fraction;
    return { ...slice, dash, offset, fraction };
  });

  return (
    <div className={[styles.donutWrap, className].filter(Boolean).join(' ')}>
      <div style={{ position: 'relative', width: size, height: size, flex: '0 0 auto' }}>
        <svg className={styles.donutSvg} width={size} height={size} aria-hidden="true" focusable="false">
          {segments.map((segment) => (
            <circle
              key={segment.label}
              className={styles.donutSegment}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={segment.color}
              strokeWidth={thickness}
              strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
              strokeDashoffset={-segment.offset}
            />
          ))}
        </svg>
        {children && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
            }}
          >
            {children}
          </div>
        )}
      </div>

      <div className={styles.legend}>
        {segments.map((segment) => (
          <div key={segment.label} className={styles.legendRow}>
            <span className={styles.legendSwatch} style={{ background: segment.color }} aria-hidden="true" />
            <span className={styles.legendLabel}>{segment.label}</span>
            <span className={styles.legendValue}>{formatCount(segment.value)}</span>
          </div>
        ))}
      </div>

      <table className={styles.srTable}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Value</th>
            <th scope="col">Share</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment) => (
            <tr key={segment.label}>
              <th scope="row">{segment.label}</th>
              <td>{formatCount(segment.value)}</td>
              <td>{Math.round(segment.fraction * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
