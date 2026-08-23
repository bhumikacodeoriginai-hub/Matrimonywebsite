'use client';

/**
 * Shell for the three policy pages (terms, privacy, refunds).
 *
 * These pages are not decoration: Razorpay and PhonePe both require reachable,
 * substantive policy pages before an account is approved for live payments, and
 * the footer links to them from every page.
 *
 * HONESTY ABOUT THEIR STATUS
 * The content describes how the system ACTUALLY behaves — what is stored, who can
 * see a photo, when contact details are revealed — because that is verifiable from
 * the codebase. What it cannot do is constitute legal advice or a finalised
 * agreement, so each page carries a visible notice saying it needs review by a
 * qualified practitioner and naming the operator before launch. Shipping
 * confident-sounding legal text nobody has reviewed would be worse than shipping
 * an obvious placeholder.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { Alert } from '../ui/feedback';
import { ButtonLink } from '../ui/button';
import { useLanguage } from './language-provider';
import styles from './legal-page.module.css';

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

export interface LegalPageProps {
  overline: string;
  title: string;
  lede: string;
  /** Human date, e.g. "23 August 2026". */
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ overline, title, lede, lastUpdated, sections }: LegalPageProps) {
  const { language } = useLanguage();

  return (
    <div className={styles.wrap}>
      <div className="aurora motion-decoration" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <SiteHeader />

      <main id="main" className={styles.body} lang={language}>
        <div className={styles.inner}>
          <p className="overline">{overline}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.lede}>{lede}</p>
          <p className={styles.updated}>Last updated {lastUpdated}</p>

          <div className={styles.notice}>
            <Alert tone="warning" title="Pre-launch draft">
              This page describes how the platform is built and how member data is handled. It has not yet
              been reviewed by a qualified legal practitioner, and the operating entity, jurisdiction and
              grievance officer details must be completed before launch. Do not treat it as a final agreement.
            </Alert>
          </div>

          {/* A contents list is the difference between a policy being readable and
              being wallpaper. */}
          <nav className={styles.toc} aria-labelledby="legal-toc-title">
            <h2 id="legal-toc-title" className={styles.tocTitle}>
              On this page
            </h2>
            <ul className={styles.tocList}>
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={styles.tocLink}>
                    <span className={styles.tocIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.sections}>
            {sections.map((section) => (
              <section key={section.id} id={section.id} className={styles.section}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                {section.body}
              </section>
            ))}
          </div>

          <div className={styles.contact}>
            <h2 className={styles.sectionTitle}>Questions about this policy</h2>
            <p>
              Write to <strong>support@advaitamatrimony.com</strong> and a person will reply. If you want your
              account and data deleted, say so in that email and we will confirm once it is done.
            </p>
            {/* Deliberately not a mailto-only page: members should also be able to
                reach help from inside the product. */}
            <p>
              Signed-in members can also use <Link href="/help">Help &amp; Safety</Link> in the dashboard.
            </p>
          </div>

          <div className={styles.backLink}>
            <ButtonLink href="/" variant="secondary" icon="chevron-left">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

/** Bulleted list with the brand's gold dot. */
export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>
          <span className={styles.bullet} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
