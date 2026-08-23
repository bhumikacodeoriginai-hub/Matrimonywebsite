'use client';

/**
 * Light/dark toggle.
 *
 * The stored value is an EXPLICIT choice only. With nothing stored, the
 * `prefers-color-scheme` block in styles/tokens.css decides — so a member who has
 * set dark mode at the OS level gets dark mode here without touching anything,
 * which is the behaviour they already expect from every other app.
 *
 * HYDRATION: the resolved theme cannot be known on the server, so this renders a
 * neutral, non-committal button until mounted. Guessing and then correcting would
 * flash the wrong icon on every load.
 */

import { useCallback, useEffect, useState } from 'react';
import { THEME_STORAGE_KEY } from './intro/intro-gate';
import { Icon } from './ui/icon';

type Resolved = 'light' | 'dark';

function readResolvedTheme(): Resolved {
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'light' || explicit === 'dark') return explicit;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Resolved | null>(null);

  useEffect(() => {
    setTheme(readResolvedTheme());

    // Follow the OS while no explicit choice has been stored.
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const stored = (() => {
        try {
          return window.localStorage.getItem(THEME_STORAGE_KEY);
        } catch {
          return null;
        }
      })();
      if (stored !== 'light' && stored !== 'dark') setTheme(readResolvedTheme());
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    const next: Resolved = readResolvedTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode — the choice lasts for this page view only.
    }
  }, []);

  // Pre-hydration: a stable placeholder that occupies the same box, so nothing
  // shifts when the real state arrives.
  if (theme === null) {
    return (
      <button type="button" className={className} aria-hidden="true" tabIndex={-1} disabled>
        <Icon name="sun" />
      </button>
    );
  }

  const goingDark = theme === 'light';

  return (
    <button
      type="button"
      className={className}
      onClick={toggle}
      // States the ACTION, not the current state — "Dark mode, pressed" is
      // ambiguous, "Switch to dark mode" is not.
      aria-label={goingDark ? 'Switch to dark mode' : 'Switch to light mode'}
      title={goingDark ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      <Icon name={goingDark ? 'moon' : 'sun'} />
    </button>
  );
}
