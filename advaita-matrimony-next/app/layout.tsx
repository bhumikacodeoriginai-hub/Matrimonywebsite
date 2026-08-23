/**
 * Root layout.
 *
 * A Server Component. The only client code it mounts is three tiny, render-nothing
 * providers/listeners, so the shell itself costs almost no JavaScript.
 *
 * FONT LOADING
 * Explicit <link> tags rather than `next/font`. `next/font/google` downloads the
 * font files at BUILD time, which turns every build into a network-dependent step
 * and fails closed in restricted CI (exactly the situation this project is built
 * in — see docs/OFFLINE_VERIFICATION.md). The `preconnect` pair plus
 * `display=swap` and the metric-matched fallbacks in styles/base.css get most of
 * the same benefit without that fragility. If your build environment has reliable
 * network access, switching to next/font is a further improvement.
 *
 * PRE-PAINT SCRIPTS
 * Two `beforeInteractive`-equivalent inline scripts run in <head>: one applies a
 * stored theme, one decides whether the intro plays. Both only ever ADD an
 * attribute, so their failure mode is "ordinary page" rather than "broken page".
 */

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { MotionRoot } from '../components/app-shell/motion-root';
import { SessionWatcher } from '../components/app-shell/session-watcher';
import { ToastProvider } from '../components/ui/toast';
import { INTRO_GATE_SCRIPT, THEME_SCRIPT } from '../components/intro/intro-gate';

export const metadata: Metadata = {
  title: {
    default: 'Advaita Matrimony — Two journeys. One beginning.',
    template: '%s · Advaita Matrimony',
  },
  description:
    'An inclusive matrimony platform built on privacy, verification and dignity — for the general, Divyangjan, Deaf and hard-of-hearing, and vitiligo communities.',
  applicationName: 'Advaita Matrimony',
  openGraph: {
    title: 'Advaita Matrimony — Two journeys. One beginning.',
    description: 'Inclusive matrimony with privacy, verification and dignity at its centre.',
    siteName: 'Advaita Matrimony',
    locale: 'en_IN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
    // Member profiles must never be indexed; those routes set their own noindex.
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /**
   * `maximumScale` and `userScalable` are deliberately NOT restricted. Blocking
   * pinch-zoom is a WCAG 1.4.4 failure and one of the most common accessibility
   * mistakes in mobile web apps.
   */
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbf8f4' },
    { media: '(prefers-color-scheme: dark)', color: '#17121a' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Two hints, in the right order: the stylesheet host, then the font
            file host (which is a different origin and needs its own handshake). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href={
            'https://fonts.googleapis.com/css2' +
            '?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600' +
            '&family=Plus+Jakarta+Sans:wght@400;500;600;700;800' +
            '&family=Noto+Sans+Kannada:wght@400;500;600;700' +
            '&display=swap'
          }
        />

        {/* Run before first paint. See components/intro/intro-gate.ts. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: INTRO_GATE_SCRIPT }} />
      </head>

      <body>
        {/* First focusable thing on every page. Visible only when focused. */}
        <a href="#main" className="sr-only sr-only-focusable">
          Skip to main content
        </a>

        <ToastProvider>
          {children}

          {/* Both render null. Kept at the end so they never delay content. */}
          <MotionRoot />
          <SessionWatcher />
        </ToastProvider>
      </body>
    </html>
  );
}
