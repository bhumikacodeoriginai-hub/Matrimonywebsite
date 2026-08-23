/**
 * Landing page (Server Component).
 *
 * Fetches the real subscription plans on the server so the membership section
 * renders actual prices from the database rather than hard-coded numbers, then
 * hands them to the client tree that owns the language toggle.
 *
 * `getPackages()` never throws — it returns an empty list when the API is
 * unreachable, and the pricing section says so plainly instead of falling back to
 * invented plans.
 */

import type { Metadata } from 'next';
import { IntroSequence } from '../components/intro/intro-sequence';
import { LandingPage } from '../components/landing/landing-page';
import { LanguageProvider } from '../components/landing/language-provider';
import { getPackages } from '../lib/api/queries';

export const metadata: Metadata = {
  title: 'Advaita Matrimony — Two journeys. One beginning.',
  description:
    'Inclusive matrimony built on consent: photos stay private until you share them, every profile is reviewed by a person, and messaging opens only when you both agree.',
  alternates: { canonical: '/' },
};

/**
 * Plans change rarely. Revalidating hourly keeps the landing page fully static
 * and instantly served, which is what makes its Core Web Vitals good.
 */
export const revalidate = 3600;

export default async function HomePage() {
  const { packages, freeMode } = await getPackages();

  return (
    <LanguageProvider>
      {/* Plays once per session, on this route only, and never under reduced
          motion. See components/intro/intro-gate.ts for the pre-paint gate. */}
      <IntroSequence />
      <LandingPage packages={packages} freeMode={freeMode} />
    </LanguageProvider>
  );
}
