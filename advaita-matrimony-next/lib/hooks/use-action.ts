'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ActionResult } from '../api/actions';

export type ActionState = 'idle' | 'pending' | 'success' | 'error';

/**
 * Runs an `ActionResult`-returning function and tracks its lifecycle, so every
 * button in the app gets consistent pending / success / error behaviour without
 * repeating the same five `useState` calls.
 *
 * Two details that matter:
 *
 *  • Double-submit guard. A member tapping "Send interest" twice on a slow
 *    connection would otherwise fire two requests and get a confusing 409 on the
 *    second. Concurrent calls are dropped while one is in flight.
 *  • No state updates after unmount, which is easy to hit here because these
 *    actions frequently run from cards inside lists that re-render or navigate.
 */
export function useAction<Args extends unknown[], Data>(
  action: (...args: Args) => Promise<ActionResult<Data>>,
  options: {
    onSuccess?: (data: Data, message?: string) => void;
    onError?: (message: string) => void;
    /** Milliseconds to hold the success state before returning to idle. */
    resetAfter?: number;
  } = {},
): {
  run: (...args: Args) => Promise<ActionResult<Data> | undefined>;
  state: ActionState;
  isPending: boolean;
  error: string | null;
  message: string | null;
  reset: () => void;
} {
  const [state, setState] = useState<ActionState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const inFlight = useRef(false);
  const mounted = useRef(true);
  const resetTimer = useRef<number | null>(null);

  // Keep the latest callbacks without making `run` change identity every render.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    };
  }, []);

  const reset = useCallback(() => {
    if (!mounted.current) return;
    setState('idle');
    setError(null);
    setMessage(null);
  }, []);

  const run = useCallback(
    async (...args: Args) => {
      if (inFlight.current) return undefined;
      inFlight.current = true;

      setState('pending');
      setError(null);
      setMessage(null);

      try {
        const result = await action(...args);
        if (!mounted.current) return result;

        if (result.ok) {
          setState('success');
          setMessage(result.message ?? null);
          optionsRef.current.onSuccess?.(result.data, result.message);
        } else {
          setState('error');
          setError(result.message);
          optionsRef.current.onError?.(result.message);
        }

        const { resetAfter } = optionsRef.current;
        if (resetAfter && resetAfter > 0) {
          resetTimer.current = window.setTimeout(reset, resetAfter);
        }

        return result;
      } finally {
        inFlight.current = false;
      }
    },
    [action, reset],
  );

  return { run, state, isPending: state === 'pending', error, message, reset };
}
