/**
 * Split-screen shell shared by sign in and the registration wizard.
 *
 * A Server Component — it is pure layout, so it costs no client JavaScript. The
 * interactive form is passed in as `children`.
 *
 * The story panel is the reason someone is willing to type their mobile number
 * into a matrimony site, so it leads with what we actually do with it rather than
 * with stock photography. On mobile it collapses to a compact header (see
 * auth.module.css) because a full-height decorative panel above a form pushes the
 * fields under the keyboard.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '../brand/logo';
import { Icon, type IconName } from '../ui/icon';
import styles from './auth.module.css';

export interface AuthShellProps {
  /** Small label above the story title. */
  overline: string;
  /** Story headline. Accepts <em> for the gold emphasis. */
  title: ReactNode;
  body: string;
  children: ReactNode;
  /** Overrides the default three trust points. */
  trust?: { icon: IconName; title: string; body: string }[];
}

const DEFAULT_TRUST: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'lock',
    title: 'Your number stays private',
    body: 'We use it to verify your account. Other members see a masked number until you have a plan that shares it.',
  },
  {
    icon: 'eye-off',
    title: 'Photos blurred by default',
    body: 'Nobody sees a clear photo of you until you decide they can.',
  },
  {
    icon: 'shield-check',
    title: 'Every profile reviewed',
    body: 'A person on our team approves each profile before it appears in search.',
  },
];

export function AuthShell({ overline, title, body, children, trust = DEFAULT_TRUST }: AuthShellProps) {
  return (
    <div className={styles.page}>
      <section className={styles.story} aria-labelledby="auth-story-title">
        <div className={`${styles.storyGlow} motion-decoration`} aria-hidden="true" />

        <div className={styles.storyTop}>
          <Logo size="sm" plain tagline={null} />
          <Link href="/" className={styles.helperLink}>
            Back to home
          </Link>
        </div>

        <div className={styles.storyBody}>
          <p className="overline">{overline}</p>
          <h1 id="auth-story-title" className={styles.storyTitle}>
            {title}
          </h1>
          <p className={styles.storyText}>{body}</p>

          <ul className={styles.storyTrust}>
            {trust.map((item) => (
              <li key={item.title} className={styles.trustRow}>
                <span className={styles.trustIcon} aria-hidden="true">
                  <Icon name={item.icon} />
                </span>
                <span className={styles.trustText}>
                  <span className={styles.trustTitle}>{item.title}</span>
                  <span className={styles.trustBody}>{item.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.storyFoot}>
          <span>© {new Date().getFullYear()} Advaita Matrimony</span>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </section>

      {/* `#main` is the skip-link target from the root layout. */}
      <main id="main" className={styles.panel}>
        <div className={styles.panelInner}>{children}</div>
      </main>
    </div>
  );
}
