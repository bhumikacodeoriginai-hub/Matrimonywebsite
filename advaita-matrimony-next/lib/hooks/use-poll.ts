'use client';

import { useEffect, useRef } from 'react';

/**
 * Polls a callback on an interval.
 *
 * WHY POLLING AT ALL: the API has no websocket, no SSE and no push. Chat and the
 * unread badge have no other way to stay current — `ChatController::sendMessage`
 * literally carries a `// TODO: Send push notification`. Replacing this with a
 * real transport is specified in docs/BACKEND_GAPS.md.
 *
 * Given that, the polling is made as cheap and as polite as possible:
 *
 *  • Pauses entirely while the tab is hidden. No requests from a backgrounded
 *    phone, which is where polling normally burns battery and data.
 *  • Fires once immediately on becoming visible again, so returning to the tab
 *    feels instant rather than waiting out the interval.
 *  • Skips a tick while the previous one is still in flight, so a slow network
 *    cannot pile up overlapping requests.
 *  • Pauses when offline and resumes on reconnect.
 */
export function usePoll(callback: () => void | Promise<void>, intervalMs: number, enabled = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    let timer: number | null = null;

    const canRun = () =>
      document.visibilityState === 'visible' &&
      (typeof navigator === 'undefined' || navigator.onLine !== false);

    const tick = async () => {
      if (runningRef.current || !canRun()) return;
      runningRef.current = true;
      try {
        await callbackRef.current();
      } catch {
        // Swallow: a failed poll must never surface as an error to the member.
        // The next tick will retry.
      } finally {
        runningRef.current = false;
      }
    };

    const startTimer = () => {
      if (timer !== null) return;
      timer = window.setInterval(tick, intervalMs);
    };

    const stopTimer = () => {
      if (timer === null) return;
      window.clearInterval(timer);
      timer = null;
    };

    const onVisibilityChange = () => {
      if (canRun()) {
        void tick();
        startTimer();
      } else {
        stopTimer();
      }
    };

    if (canRun()) startTimer();

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('online', onVisibilityChange);
    window.addEventListener('offline', onVisibilityChange);

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('online', onVisibilityChange);
      window.removeEventListener('offline', onVisibilityChange);
    };
  }, [intervalMs, enabled]);
}

/** Sensible intervals, kept in one place so they can be tuned together. */
export const POLL_INTERVALS = {
  /** Open conversation — needs to feel close to live. */
  activeConversation: 8_000,
  /** Conversation list while the member is on the messages screen. */
  conversationList: 20_000,
  /** Unread badge in the shell, on every authenticated page. */
  unreadBadge: 60_000,
} as const;
