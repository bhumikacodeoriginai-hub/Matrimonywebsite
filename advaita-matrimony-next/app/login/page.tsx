/**
 * Sign in.
 *
 * A Server Component that does two things before rendering:
 *  1. Redirects members who already have a session — landing on a sign-in page
 *     when you are signed in is disorienting, and a stale form there invites a
 *     pointless second login.
 *  2. Validates the `next` parameter. An unvalidated redirect target is an open
 *     redirect: `?next=https://evil.example` would send a member who just typed
 *     their credentials straight to an attacker's page, with our brand behind
 *     them. Only same-site absolute paths are allowed through.
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '../../components/auth/login-form';
import { isAuthenticated } from '../../lib/auth/session';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Advaita Matrimony with a one-time code or your password.',
  // A sign-in page has no business in a search index.
  robots: { index: false, follow: false },
};

const DEFAULT_REDIRECT = '/dashboard';

/**
 * Allows only same-site absolute paths.
 *
 * Rejects: absolute URLs, protocol-relative `//evil.example` (which browsers treat
 * as absolute), backslash variants that some parsers normalise to slashes, and
 * anything that is not rooted at `/`.
 */
function safeRedirect(next: string | undefined): string {
  if (!next) return DEFAULT_REDIRECT;
  if (!next.startsWith('/')) return DEFAULT_REDIRECT;
  if (next.startsWith('//') || next.startsWith('/\\')) return DEFAULT_REDIRECT;
  // Never bounce back to an auth route — that would loop.
  if (next.startsWith('/login') || next.startsWith('/register')) return DEFAULT_REDIRECT;
  return next;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  if (await isAuthenticated()) {
    redirect(DEFAULT_REDIRECT);
  }

  const { next, reason } = await searchParams;
  const previewEnabled =
    process.env.NODE_ENV !== 'production' && process.env.NEXT_PUBLIC_ENABLE_PREVIEW_LOGIN === 'true';
  const previewCredentials = previewEnabled
    ? {
        login: process.env.NEXT_PUBLIC_PREVIEW_LOGIN_EMAIL ?? '',
        password: process.env.NEXT_PUBLIC_PREVIEW_LOGIN_PASSWORD ?? '',
      }
    : undefined;

  return (
    <LoginForm
      redirectTo={safeRedirect(next)}
      sessionExpired={reason === 'expired'}
      previewCredentials={previewCredentials}
    />
  );
}
