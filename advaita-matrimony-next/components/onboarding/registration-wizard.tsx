'use client';

/**
 * Registration / profile-creation wizard.
 *
 * Ten steps, real saves, no fake progress.
 *
 * HOW SAVING WORKS
 *  • Step 1 creates the account: POST /api/auth/register, which sets the session
 *    cookie. Until that succeeds nothing has been sent anywhere.
 *  • Steps 2–7 auto-save on advance: PUT /profile/update with only that step's
 *    fields. Sending the whole draft each time would clobber anything edited in
 *    another tab.
 *  • Step 8 saves via PUT /profile/partner-preferences.
 *  • Photos upload immediately, one request per file, because a 5 MB image should
 *    not be sitting in memory waiting for a Next button.
 *
 * THE PERCENTAGE IS THE SERVER'S
 * `PUT /profile/update` returns `profile_completion`, and that is the number shown
 * in the header. We never compute our own — a progress figure that disagrees with
 * the one on the dashboard would undermine both.
 *
 * DRAFT SAFETY
 * The draft is mirrored to localStorage on every change so an interrupted sign-up
 * resumes where it left off. The password and the one-time code are held in
 * component state only and never persisted.
 *
 * PROGRESS IS NEVER BLOCKED BY OPTIONAL DATA
 * Only step 1 validates. Every later step has a working "Skip for now", because a
 * member who will not state their caste or income must still be able to finish.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button, ButtonLink } from '../ui/button';
import { Badge } from '../ui/badge';
import { Logo } from '../brand/logo';
import { Alert, Note, Spinner } from '../ui/feedback';
import { Icon } from '../ui/icon';
import { ProgressBar, StepProgress } from '../ui/progress';
import { AdvaitaMark } from '../brand/advaita-mark';
import { useToast } from '../ui/toast';
import {
  AccountStep,
  BackgroundStep,
  CareerStep,
  InclusiveStep,
  LifestyleStep,
  LocationStep,
  PersonalStep,
  PreferencesStep,
} from './wizard-steps';
import { PhotosStep } from './photos-step';
import { ReviewStep } from './review-step';
import { authRoute } from '../../lib/api/bff';
import { ApiError, friendlyMessage } from '../../lib/api/client';
import { updatePartnerPreferences, updateProfile } from '../../lib/api/actions';
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
  toPreferencesPayload,
  toProfileBooleans,
  toProfilePayload,
  validateStep,
  type OnboardingDraft,
  type StepErrors,
} from '../../lib/onboarding/draft';
import type { ProfileCategory } from '../../lib/api/types';
import styles from './wizard.module.css';

const TOTAL_STEPS = 10;

const STEP_META: { title: string; intro: string }[] = [
  {
    title: 'Let’s start with the basics',
    intro:
      'This is the only step with required fields — it creates your account. Everything after it is optional and saves as you go.',
  },
  {
    title: 'A little about you',
    intro: 'Marital status and height are the two most-used filters. The rest is entirely up to you.',
  },
  {
    title: 'Community and background',
    intro: 'Share as much or as little as you want. Caste is optional and is never used to rank matches.',
  },
  {
    title: 'Education and work',
    intro: 'One of the first things people look at. An income range is optional.',
  },
  {
    title: 'Where you live, and your family',
    intro: 'Only your city and state are shown to members — never a precise address.',
  },
  {
    title: 'Everyday life, in your words',
    intro:
      'The “about you” section is the most-read part of a profile. A few honest sentences go a long way.',
  },
  {
    title: 'What someone should know',
    intro: 'Every field here is optional, and you decide what appears on your profile.',
  },
  {
    title: 'What you’re looking for',
    intro: 'This is the step that decides your match percentages, so it is worth a few minutes.',
  },
  {
    title: 'Add your photos',
    intro: 'Photos stay blurred to other members until you decide otherwise. You can add more later.',
  },
  {
    title: 'One last look',
    intro: 'Check anything you want to change, then submit your profile for review.',
  },
];

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export interface RegistrationWizardProps {
  /** Pre-verified number carried over from the sign-in OTP flow. */
  initialPhone?: string;
  initialPhoneVerified?: boolean;
  /** Community pre-selected from a landing-page link. */
  initialCategory?: ProfileCategory;
  /** True when the visitor already has a session (resuming their profile). */
  alreadySignedIn?: boolean;
}

export function RegistrationWizard({
  initialPhone,
  initialPhoneVerified = false,
  initialCategory,
  alreadySignedIn = false,
}: RegistrationWizardProps) {
  const toast = useToast();

  const [draft, setDraft] = useState<OnboardingDraft>(() => ({
    ...emptyDraft(),
    ...(initialPhone ? { phone: initialPhone, phoneVerified: initialPhoneVerified } : {}),
    ...(initialCategory ? { profile_category: initialCategory } : {}),
  }));

  /** Never persisted. */
  const [password, setPassword] = useState('');

  const [step, setStep] = useState(1);
  const [furthest, setFurthest] = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [errors, setErrors] = useState<StepErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [pending, setPending] = useState(false);
  const [accountCreated, setAccountCreated] = useState(alreadySignedIn);
  const [serverCompletion, setServerCompletion] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const hydrated = useRef(false);

  /* ---- Restore a draft on first mount ---- */
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const stored = loadDraft();
    if (!stored) return;

    setDraft((current) => ({
      ...stored,
      // Anything explicitly passed in the URL wins over the stored draft.
      ...(initialPhone ? { phone: initialPhone, phoneVerified: initialPhoneVerified } : {}),
      ...(initialCategory ? { profile_category: initialCategory } : {}),
      // Never trust a persisted "verified" flag on its own.
      phoneVerified: initialPhoneVerified || stored.phoneVerified,
    }));
    // Deliberately does NOT restore the step. A member returning to a half-built
    // profile should see step 1 and confirm their details rather than being
    // dropped into "Lifestyle" with no context.
  }, [initialPhone, initialPhoneVerified, initialCategory]);

  /* ---- Mirror to localStorage ---- */
  useEffect(() => {
    if (!hydrated.current) return;
    saveDraft(draft);
  }, [draft]);

  /* ---- Move focus to the step heading on change ----
     Without this, advancing a step leaves a keyboard or screen-reader user's
     focus on the Next button while the content around it silently changes. */
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const update = useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    // Clear the errors for just the fields being edited.
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }, []);

  /* ==================================================================== Save */

  /** Creates the account. Only called when leaving step 1. */
  const createAccount = async (): Promise<boolean> => {
    try {
      await authRoute('/register', {
        method: 'POST',
        body: {
          phone: draft.phone,
          name: draft.name,
          email: draft.email || undefined,
          gender: draft.gender,
          date_of_birth: draft.date_of_birth,
          password,
          profile_category: draft.profile_category,
        },
      });
      setAccountCreated(true);
      // The password has done its job; drop it from memory.
      setPassword('');
      return true;
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        const mapped: StepErrors = {};
        for (const [field, messages] of Object.entries(error.fieldErrors)) {
          mapped[field] = messages[0] ?? 'Please check this field.';
        }
        setErrors(mapped);
        setFormError(null);
      } else {
        setFormError(friendlyMessage(error));
      }
      return false;
    }
  };

  /** Saves the current step's fields. Returns false only on a hard failure. */
  const saveStep = async (which: number): Promise<boolean> => {
    if (!accountCreated) return true;

    setSaveState('saving');

    if (which === 8) {
      const result = await updatePartnerPreferences(toPreferencesPayload(draft));
      if (!result.ok) {
        setSaveState('error');
        setFormError(result.message);
        return false;
      }
      setSaveState('saved');
      return true;
    }

    const payload = { ...toProfilePayload(draft, which), ...(which === 7 ? toProfileBooleans(draft) : {}) };
    if (Object.keys(payload).length === 0) {
      setSaveState('idle');
      return true;
    }

    const result = await updateProfile(payload);
    if (!result.ok) {
      setSaveState('error');
      setFormError(result.message);
      return false;
    }

    setServerCompletion(result.data.profile_completion);
    setSaveState('saved');
    return true;
  };

  /* ============================================================== Navigation */

  const goTo = (next: number, dir: 'forward' | 'back') => {
    setDirection(dir);
    setStep(next);
    setFurthest((current) => Math.max(current, next));
    setFormError(null);
    // Bring the top of the form into view — advancing a step and landing
    // mid-way down the next one is disorienting.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = async () => {
    setFormError(null);
    const stepErrors = validateStep(step, draft, password);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Focus the first invalid control so the member is taken to the problem.
      const firstField = Object.keys(stepErrors)[0];
      const element = document.querySelector<HTMLElement>(`[name="${firstField}"]`);
      element?.focus();
      return;
    }

    setPending(true);
    try {
      if (step === 1 && !accountCreated) {
        const created = await createAccount();
        if (!created) return;
      } else {
        const saved = await saveStep(step);
        if (!saved) return;
      }

      if (step < TOTAL_STEPS) goTo(step + 1, 'forward');
    } finally {
      setPending(false);
    }
  };

  const handleSkip = async () => {
    // Skipping still saves whatever was filled in — it means "do not make me
    // finish this", not "throw away what I typed".
    setPending(true);
    try {
      await saveStep(step);
      if (step < TOTAL_STEPS) goTo(step + 1, 'forward');
    } finally {
      setPending(false);
    }
  };

  const handleBack = () => {
    if (step > 1) goTo(step - 1, 'back');
  };

  const handleSubmit = async () => {
    setPending(true);
    setFormError(null);
    try {
      // Re-save the last edited step, then finish.
      await saveStep(9);
      clearDraft();
      setFinished(true);
      toast.success('Profile submitted', 'Our team will review it shortly.');
    } finally {
      setPending(false);
    }
  };

  /* ================================================================== Render */

  if (finished) {
    return (
      <div className={styles.page}>
        <main id="main" className={styles.body}>
          <div className={styles.celebrate}>
            <span className={styles.celebrateMark}>
              <span className={`${styles.celebrateRing} motion-decoration`} aria-hidden="true" />
              <AdvaitaMark size={52} gradient idSuffix="celebrate" />
            </span>

            <h1 className={styles.celebrateTitle}>
              Your profile is <em>with our team.</em>
            </h1>
            <p className={styles.celebrateBody}>
              A person reviews every profile before it appears in search — usually within a day. You can
              browse, set your preferences and add photos in the meantime.
            </p>

            {serverCompletion !== null && (
              <div style={{ width: 'min(360px, 100%)' }}>
                <ProgressBar value={serverCompletion} label="Profile completeness" tone="verified" />
              </div>
            )}

            <div className={styles.celebrateActions}>
              <ButtonLink href="/dashboard" size="lg" trailingIcon="arrow-right">
                Go to your dashboard
              </ButtonLink>
              <ButtonLink href="/profile/edit" size="lg" variant="secondary">
                Keep editing
              </ButtonLink>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const meta = STEP_META[step - 1]!;
  const isOptionalStep = step > 1 && step < TOTAL_STEPS;

  return (
    <div className={styles.page}>
      {/* -------- Top: brand, completeness, step progress -------- */}
      <header className={styles.top}>
        <div className={styles.topInner}>
          <div className={styles.topRow}>
            <Logo size="sm" tagline={null} />

            {serverCompletion === null ? (
              <Badge tone="neutral">
                Step {step} of {TOTAL_STEPS}
              </Badge>
            ) : (
              <div className={styles.completion}>
                <span className={styles.completionValue}>{serverCompletion}%</span>
                <span className={styles.completionLabel}>Profile complete</span>
              </div>
            )}
          </div>

          <StepProgress
            current={step}
            total={TOTAL_STEPS}
            stepLabel={meta.title}
            furthestStep={furthest}
            onStepSelect={(target) => goTo(target, target < step ? 'back' : 'forward')}
          />
        </div>
      </header>

      {/* -------- Body -------- */}
      <main id="main" className={styles.body}>
        <div className={styles.bodyInner}>
          <div className={styles.stepHead}>
            <p className={styles.stepIndex}>
              Step {step} of {TOTAL_STEPS}
            </p>
            {/* tabIndex -1 so it can receive focus on step change without being
                a tab stop afterwards. */}
            <h1 ref={headingRef} className={styles.stepTitle} tabIndex={-1}>
              {meta.title}
            </h1>
            <p className={styles.stepIntro}>{meta.intro}</p>
          </div>

          {formError && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <Alert tone="error" assertive title="We could not save that">
                {formError}
              </Alert>
            </div>
          )}

          <div
            className={[styles.stepBody, direction === 'back' ? styles.stepBodyBack : ''].join(' ')}
            // Re-mounts on step change so the entrance animation replays.
            key={step}
          >
            {step === 1 && (
              <AccountStep
                draft={draft}
                update={update}
                errors={errors}
                password={password}
                setPassword={setPassword}
              />
            )}
            {step === 2 && <PersonalStep draft={draft} update={update} errors={errors} />}
            {step === 3 && <BackgroundStep draft={draft} update={update} errors={errors} />}
            {step === 4 && <CareerStep draft={draft} update={update} errors={errors} />}
            {step === 5 && <LocationStep draft={draft} update={update} errors={errors} />}
            {step === 6 && <LifestyleStep draft={draft} update={update} errors={errors} />}
            {step === 7 && <InclusiveStep draft={draft} update={update} errors={errors} />}
            {step === 8 && <PreferencesStep draft={draft} update={update} errors={errors} />}
            {step === 9 && <PhotosStep />}
            {step === 10 && <ReviewStep draft={draft} onEditStep={(target) => goTo(target, 'back')} />}
          </div>

          {step === 1 && (
            <div style={{ marginTop: 'var(--space-6)' }}>
              <Note icon="info">
                Already have an account? <Link href="/login">Sign in instead</Link>.
              </Note>
            </div>
          )}
        </div>
      </main>

      {/* -------- Footer: navigation + save status -------- */}
      <footer className={styles.foot}>
        <div className={styles.footInner}>
          <p
            className={[styles.footStatus, saveState === 'saved' ? styles.footStatusSaved : '']
              .filter(Boolean)
              .join(' ')}
            // Polite so the member hears "Saved" without being interrupted.
            role="status"
            aria-live="polite"
          >
            {saveState === 'saving' && (
              <>
                <Spinner size={13} /> Saving…
              </>
            )}
            {saveState === 'saved' && (
              <>
                <Icon name="check-circle" /> Saved
              </>
            )}
            {saveState === 'idle' && accountCreated && <>Changes save as you go</>}
            {saveState === 'error' && (
              <>
                <Icon name="alert" /> Not saved
              </>
            )}
          </p>

          <div className={styles.footActions}>
            <Button variant="ghost" onClick={handleBack} disabled={step === 1 || pending} icon="chevron-left">
              Back
            </Button>

            {isOptionalStep && (
              <Button variant="secondary" onClick={() => void handleSkip()} disabled={pending}>
                Skip for now
              </Button>
            )}

            {step === TOTAL_STEPS ? (
              <Button size="lg" onClick={() => void handleSubmit()} loading={pending} icon="check">
                Submit for review
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => void handleNext()}
                loading={pending}
                trailingIcon="arrow-right"
              >
                {step === 1 ? 'Create my account' : 'Continue'}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
