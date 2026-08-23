'use client';

/**
 * Language state for the public site.
 *
 * Persists the choice to localStorage and, importantly, sets `lang` on the <main>
 * element so assistive tech switches to a Kannada voice rather than reading
 * Kannada with English pronunciation rules. Setting `lang` correctly is the
 * difference between a translation being usable and being noise.
 *
 * The default is English on both server and client; the stored preference is
 * applied after mount. That means one frame of English for a returning Kannada
 * reader — the alternative (blocking render on a localStorage read) is worse, and
 * a pre-paint script like the theme gate would be overkill for a preference this
 * cheap to change.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { LANDING_COPY, LANGUAGE_STORAGE_KEY, type Language, type LandingCopy } from '../../lib/i18n/landing';

interface LanguageContextValue {
  language: Language;
  copy: LandingCopy;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context) return context;
  // A sensible fallback rather than a crash: English copy, toggle is a no-op.
  return {
    language: 'en',
    copy: LANDING_COPY.en,
    setLanguage: () => undefined,
    toggleLanguage: () => undefined,
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'kn') setLanguageState(stored);
    } catch {
      // Private mode — English for this visit.
    }
  }, []);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Non-fatal.
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  }, [language, setLanguage]);

  const value = useMemo(
    () => ({ language, copy: LANDING_COPY[language], setLanguage, toggleLanguage }),
    [language, setLanguage, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
