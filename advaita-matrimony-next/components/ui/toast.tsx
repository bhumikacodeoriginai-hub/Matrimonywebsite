'use client';

/**
 * Toasts.
 *
 * Used for confirmations that must not steal focus — "Interest sent", "Saved to
 * your shortlist", "Could not reach Advaita". Anything the member must act on
 * belongs in an `Alert` in the page or a `Modal`, not here.
 *
 * ACCESSIBILITY
 *  • The viewport is a permanent `aria-live="polite"` region. Rendering the live
 *    region only when a toast exists is the classic bug: many screen readers never
 *    announce a region that appears at the same moment as its content.
 *  • Focus is never moved. A toast interrupting the member's place in a form would
 *    be worse than the toast not being noticed.
 *  • Auto-dismiss is paused on hover and on focus-within, so a member reading
 *    slowly (or tabbing to the action) does not lose it. Errors do not auto-dismiss
 *    at all.
 *  • `prefers-reduced-motion` is handled globally in base.css, which collapses the
 *    enter/exit animations to a single frame.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from './icon';
import styles from './toast.module.css';

export type ToastTone = 'success' | 'error' | 'info' | 'premium';

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  icon?: IconName;
  /** Milliseconds. Errors default to staying until dismissed. */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: number;
  leaving?: boolean;
}

const TONE_ICON: Record<ToastTone, IconName> = {
  success: 'check-circle',
  error: 'alert',
  info: 'info',
  premium: 'crown',
};

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  /** Convenience wrappers for the two most common cases. */
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the toast API.
 *
 * Returns a no-op implementation when no provider is mounted rather than
 * throwing: a missing provider should never crash a member's page over a
 * confirmation message. In development it warns instead.
 */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context) return context;

  if (process.env.NODE_ENV !== 'production') {
    console.warn('[advaita] useToast() called outside <ToastProvider>. Messages will be dropped.');
  }
  const noop = () => undefined;
  return { toast: noop, success: noop, error: noop, dismiss: noop };
}

const DEFAULT_DURATION = 4500;
const EXIT_DURATION = 220;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());
  /** True while the pointer or focus is inside the viewport. */
  const paused = useRef(false);

  const remove = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismiss = useCallback(
    (id: number) => {
      // Play the exit animation, then unmount.
      setToasts((current) => current.map((item) => (item.id === id ? { ...item, leaving: true } : item)));
      window.setTimeout(() => remove(id), EXIT_DURATION);
    },
    [remove],
  );

  const scheduleDismiss = useCallback(
    (id: number, duration: number) => {
      if (duration <= 0) return;
      const timer = window.setTimeout(() => {
        // If the member is hovering/reading, try again shortly instead of closing.
        if (paused.current) {
          scheduleDismiss(id, 1200);
          return;
        }
        dismiss(id);
      }, duration);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = nextId.current++;
      const tone = options.tone ?? 'info';
      // Errors persist: an error that vanishes before it is read is not a message.
      const duration = options.duration ?? (tone === 'error' ? 0 : DEFAULT_DURATION);

      setToasts((current) => {
        // Cap the stack so a loop of failures cannot bury the page.
        const next = [...current, { ...options, tone, id }];
        return next.length > 4 ? next.slice(next.length - 4) : next;
      });

      scheduleDismiss(id, duration);
    },
    [scheduleDismiss],
  );

  const success = useCallback(
    (title: string, description?: string) => toast({ title, description, tone: 'success' }),
    [toast],
  );

  const error = useCallback(
    (title: string, description?: string) => toast({ title, description, tone: 'error' }),
    [toast],
  );

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const value = useMemo(() => ({ toast, success, error, dismiss }), [toast, success, error, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Permanently mounted live region — see the note at the top of the file. */}
      <div
        className={styles.viewport}
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onFocusCapture={() => (paused.current = true)}
        onBlurCapture={() => (paused.current = false)}
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={[styles.toast, styles[item.tone ?? 'info'], item.leaving ? styles.leaving : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span className={styles.icon} aria-hidden="true">
              <Icon name={item.icon ?? TONE_ICON[item.tone ?? 'info']} />
            </span>

            <div className={styles.body}>
              <span className={styles.title}>{item.title}</span>
              {item.description && <span className={styles.description}>{item.description}</span>}
            </div>

            {item.action && (
              <button
                type="button"
                className={styles.action}
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
              >
                {item.action.label}
              </button>
            )}

            <button
              type="button"
              className={styles.close}
              onClick={() => dismiss(item.id)}
              aria-label={`Dismiss: ${item.title}`}
            >
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
