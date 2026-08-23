'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Countdown for the OTP resend timer.
 *
 * Uses a wall-clock deadline rather than decrementing a counter, because
 * `setInterval` is throttled in background tabs and on locked phones — a naive
 * counter would still show "0:42 remaining" after the member came back two
 * minutes later.
 */
export function useCountdown(): {
  secondsLeft: number;
  isRunning: boolean;
  start: (seconds: number) => void;
  stop: () => void;
} {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const deadlineRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const clear = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (deadlineRef.current === null) return;
    const remaining = Math.ceil((deadlineRef.current - Date.now()) / 1000);
    if (remaining <= 0) {
      setSecondsLeft(0);
      deadlineRef.current = null;
      clear();
      return;
    }
    setSecondsLeft(remaining);
  }, [clear]);

  const start = useCallback(
    (seconds: number) => {
      clear();
      deadlineRef.current = Date.now() + seconds * 1000;
      setSecondsLeft(seconds);
      timerRef.current = window.setInterval(tick, 500);
    },
    [clear, tick],
  );

  const stop = useCallback(() => {
    clear();
    deadlineRef.current = null;
    setSecondsLeft(0);
  }, [clear]);

  // Re-sync as soon as the tab is visible again.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [tick]);

  useEffect(() => clear, [clear]);

  return { secondsLeft, isRunning: secondsLeft > 0, start, stop };
}
