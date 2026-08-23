'use client';

/**
 * OTP code input.
 *
 * ONE native <input> with `autocomplete="one-time-code"`, rendered as separate
 * digit boxes. See otp-input.module.css for why this beats six inputs — briefly:
 * SMS autofill works, paste works, the caret works, and a screen reader announces
 * a single field instead of six blank ones.
 *
 * Also handled here:
 *  • non-digits stripped on input, so pasting "123 456" or "OTP: 123456" works
 *  • the caret is pinned to the end, because letting someone drop it into the
 *    middle of a code they cannot see is a trap
 *  • completion fires `onComplete` exactly once per full code
 *  • the live region announces progress and errors without spamming per keystroke
 */

import { useEffect, useId, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import { Icon } from './icon';
import { formatCountdown } from '../../lib/format';
import styles from './otp-input.module.css';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Fired once when the last digit is entered. */
  onComplete?: (value: string) => void;
  length?: number;
  label?: string;
  /** Where the code was sent, for the accessible description. */
  sentTo?: string;
  error?: string;
  disabled?: boolean;
  /** Locks the boxes into their success state after verification. */
  verified?: boolean;
  autoFocus?: boolean;
  /** Seconds until resend becomes available. 0 or undefined enables it. */
  secondsLeft?: number;
  onResend?: () => void;
  resendPending?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  label = 'Verification code',
  sentTo,
  error,
  disabled = false,
  verified = false,
  autoFocus = false,
  secondsLeft = 0,
  onResend,
  resendPending = false,
}: OtpInputProps) {
  const generatedId = useId();
  const id = `otp-${generatedId}`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const completedFor = useRef<string | null>(null);

  // Drives the one-shot shake when a wrong code comes back.
  const [shake, setShake] = useState(false);
  useEffect(() => {
    if (!error) return;
    setShake(true);
    const timer = window.setTimeout(() => setShake(false), 340);
    return () => window.clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  /** Fire onComplete once per distinct complete code. */
  useEffect(() => {
    if (value.length !== length) {
      completedFor.current = null;
      return;
    }
    if (completedFor.current === value) return;
    completedFor.current = value;
    onComplete?.(value);
    // `onComplete` is intentionally excluded: callers commonly pass an inline
    // arrow function, and depending on it would re-fire submission every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, length]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    // Strip everything that is not a digit, so "123 456", "1-2-3-4-5-6" and
    // "Your OTP is 123456" all resolve to the code.
    const digits = event.target.value.replace(/\D/g, '').slice(0, length);
    onChange(digits);
  };

  /** Keep the caret at the end; mid-code editing of an invisible caret is a trap. */
  const pinCaret = () => {
    const input = inputRef.current;
    if (!input) return;
    const end = input.value.length;
    // requestAnimationFrame so this wins against the browser's own placement.
    requestAnimationFrame(() => {
      try {
        input.setSelectionRange(end, end);
      } catch {
        // Some input types disallow setSelectionRange; harmless if it fails.
      }
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Block caret navigation so it cannot land between digits.
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      pinCaret();
    }
  };

  const digits = value.split('');
  const activeIndex = Math.min(value.length, length - 1);
  const isFocusedIndex = (index: number) => index === activeIndex && value.length < length;

  const stateClass = [
    styles.boxes,
    error ? styles.invalid : '',
    verified ? styles.verified : '',
    shake ? styles.shake : '',
    disabled ? styles.disabled : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.wrap}>
      <div className={styles.control}>
        <input
          ref={inputRef}
          id={id}
          className={styles.input}
          type="text"
          inputMode="numeric"
          // The attribute that makes iOS/Android offer the code from the SMS.
          autoComplete="one-time-code"
          // Stops keyboards from "helping" with a numeric code.
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={length}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={pinCaret}
          onFocus={pinCaret}
          disabled={disabled || verified}
          aria-label={label}
          aria-describedby={
            [sentTo ? descriptionId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined
          }
          aria-invalid={error ? true : undefined}
        />

        {/* Decorative rendering of the value above. */}
        <div className={stateClass} style={{ ['--otp-length' as string]: length }} aria-hidden="true">
          {Array.from({ length }).map((_, index) => (
            <div
              key={index}
              className={[
                styles.box,
                digits[index] ? styles.boxFilled : '',
                isFocusedIndex(index) ? styles.boxActive : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {verified ? (
                <Icon name="check" />
              ) : (
                (digits[index] ?? (isFocusedIndex(index) ? <span className={styles.caret} /> : ''))
              )}
            </div>
          ))}
        </div>
      </div>

      {sentTo && (
        <p id={descriptionId} className="sr-only">
          Enter the {length}-digit code sent to {sentTo}.
        </p>
      )}

      {/* One polite live region for both progress and errors. Announcing every
          keystroke would be unusable, so only meaningful transitions speak. */}
      <p id={errorId} className={error ? undefined : 'sr-only'} role="status" aria-live="polite">
        {error ? (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              color: 'var(--danger)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
            }}
          >
            <Icon name="alert" />
            {error}
          </span>
        ) : verified ? (
          'Code verified.'
        ) : value.length === length ? (
          'All digits entered.'
        ) : (
          ''
        )}
      </p>

      {onResend && (
        <div className={styles.foot}>
          {secondsLeft > 0 ? (
            <span className={styles.countdown}>
              <Icon name="clock" />
              Resend available in {formatCountdown(secondsLeft)}
            </span>
          ) : (
            <span className={styles.countdown}>Didn&rsquo;t get the code?</span>
          )}

          <button
            type="button"
            className={styles.resend}
            onClick={onResend}
            disabled={secondsLeft > 0 || resendPending || disabled}
          >
            {resendPending ? 'Sending…' : 'Send it again'}
          </button>
        </div>
      )}
    </div>
  );
}
