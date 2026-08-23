'use client';

/**
 * Public site header.
 *
 * A sticky glass pill. Two nav treatments — a horizontal list above 980px, a
 * disclosure menu below — chosen at the width where the nav genuinely stops
 * fitting rather than at an arbitrary "tablet" breakpoint.
 *
 * ACCESSIBILITY
 *  • The menu button is a real disclosure: `aria-expanded` + `aria-controls`, and
 *    Escape closes it and returns focus to the button.
 *  • Anchor links point at real `id`s on the page, so they work with keyboard and
 *    with JavaScript disabled.
 *  • `scroll-padding-top` in base.css keeps the sticky header from covering the
 *    heading you just jumped to.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Logo } from '../brand/logo';
import { ButtonLink } from '../ui/button';
import { Icon } from '../ui/icon';
import { ThemeToggle } from '../theme-toggle';
import { useLanguage } from './language-provider';
import { LANGUAGE_SWITCH_LABEL } from '../../lib/i18n/landing';
import styles from './landing.module.css';

export function SiteHeader() {
  const { copy, language, toggleLanguage } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  /* Adds a little more separation from content once the page has moved. */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Escape closes the menu and hands focus back to the trigger. */
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const navItems = [
    { href: '#communities', label: copy.navCommunities },
    { href: '#how-it-works', label: copy.navHowItWorks },
    { href: '#safety', label: copy.navSafety },
    { href: '#membership', label: copy.navPricing },
  ];

  return (
    <header className={[styles.header, scrolled ? styles.headerScrolled : ''].filter(Boolean).join(' ')}>
      <div className={styles.headerInner}>
        <Logo size="sm" />

        <nav className={styles.nav} aria-label="Site sections">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.iconControl} ${styles.languageControl}`}
            onClick={toggleLanguage}
            // States the destination language, and marks the label with its own
            // `lang` so it is pronounced correctly.
            aria-label={language === 'en' ? 'Switch to Kannada' : 'Switch to English'}
            lang={language === 'en' ? 'kn' : 'en'}
          >
            {LANGUAGE_SWITCH_LABEL[language]}
          </button>

          <ThemeToggle className={styles.iconControl} />

          <Link href="/login" className={styles.loginLink}>
            {copy.login}
          </Link>

          <ButtonLink href="/register" size="sm">
            {copy.createProfile}
          </ButtonLink>

          <button
            ref={menuButtonRef}
            type="button"
            className={`${styles.iconControl} ${styles.menuButton}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? copy.navClose : copy.navMenu}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {/* Rendered only when open, so its links are not in the tab order while
          hidden — no need for the `inert`/`hidden` dance. */}
      {menuOpen && (
        <div className={styles.mobileMenu} id="site-menu">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={styles.mobileMenuLink}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}

          <div className={styles.mobileMenuActions}>
            <ButtonLink href="/register" block trailingIcon="arrow-right">
              {copy.createProfile}
            </ButtonLink>
            <ButtonLink href="/login" variant="secondary" block>
              {copy.login}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
