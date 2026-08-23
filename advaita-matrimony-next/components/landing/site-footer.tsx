'use client';

/**
 * Public site footer.
 *
 * Deliberately small: brand, the three legal pages that must be reachable from
 * every page for the payment gateways' own requirements, and the language control
 * repeated here because members who reach the bottom of a page in the wrong
 * language should not have to scroll back up.
 */

import Link from 'next/link';
import { Logo } from '../brand/logo';
import { useLanguage } from './language-provider';
import { LANGUAGE_SWITCH_LABEL } from '../../lib/i18n/landing';
import styles from './landing.module.css';

export function SiteFooter() {
  const { copy, language, toggleLanguage } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <Logo size="sm" tagline={copy.footerTagline} />

        <nav className={styles.footerLinks} aria-label="Legal and policies">
          <Link href="/terms" className={styles.footerLink}>
            {copy.footerTerms}
          </Link>
          <Link href="/privacy" className={styles.footerLink}>
            {copy.footerPrivacy}
          </Link>
          <Link href="/refund" className={styles.footerLink}>
            {copy.footerRefund}
          </Link>
          <button
            type="button"
            className={`${styles.iconControl} ${styles.languageControl}`}
            onClick={toggleLanguage}
            aria-label={language === 'en' ? 'Switch to Kannada' : 'Switch to English'}
            lang={language === 'en' ? 'kn' : 'en'}
          >
            {LANGUAGE_SWITCH_LABEL[language]}
          </button>
        </nav>

        <p className={styles.footerNote}>
          © {year} Advaita Matrimony · {copy.footerRights}
        </p>
      </div>
    </footer>
  );
}
