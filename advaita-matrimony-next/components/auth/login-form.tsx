'use client';

/**
 * Sign in.
 *
 * Two real methods against real endpoints:
 *
 *  • One-time code — POST /api/auth/send-otp then /api/auth/verify-otp, which
 *    proxy Laravel's `auth/send-otp` and `auth/verify-otp`. If the number has no
 *    account yet, the server tells us (`is_new_user`) and we carry the
 *    already-verified number into the registration wizard rather than making the
 *    member prove it twice.
 *  • Password — POST /api/auth/login, proxying `auth/login`, which accepts an
 *    email or a phone number.
 *
 * There is no demo mode and no hard-coded credential. The previous version of this
 * screen shipped `demo@advaita.test` / `Advaita2026!` printed on the page and
 * navigated to a dashboard full of invented data; both are gone.
 *
 * ACCOUNT RECOVERY — the honest version
 * -------------------------------------
 * The API has NO password-reset endpoint. Rather than a "Forgot password" link
 * that leads nowhere, the recovery path is the one that genuinely works: sign in
 * with a one-time code to your registered number, which needs no password at all.
 * The link says exactly that.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from './auth-shell';
import { Button, ButtonLink } from '../ui/button';
import { TextField } from '../ui/field';
import { OtpInput } from '../ui/otp-input';
import { Segmented } from '../ui/choice';
import { Alert, Note } from '../ui/feedback';
import { Icon } from '../ui/icon';
import { authRoute } from '../../lib/api/bff';
import { ApiError, friendlyMessage, type FieldErrors } from '../../lib/api/client';
import { useCountdown } from '../../lib/hooks/use-countdown';
import { formatPhone } from '../../lib/format';
import styles from './auth.module.css';

type Method = 'otp' | 'password';
type Phase = 'entry' | 'code' | 'success';

/** Laravel's OTP expiry is 5 minutes; offer resend well before that. */
const RESEND_SECONDS = 45;
/** How long the success state is held before navigating. */
const SUCCESS_HOLD_MS = 1100;

export interface LoginFormProps {
  /** Where to go after signing in. Already validated server-side. */
  redirectTo: string;
  /** Set when the member was bounced here by an expired session. */
  sessionExpired?: boolean;
}

interface AuthRouteResponse {
  success: boolean;
  message?: string;
  is_new_user?: boolean;
  phone?: string;
}

export function LoginForm({ redirectTo, sessionExpired = false }: LoginFormProps) {
  const router = useRouter();

  const [method, setMethod] = useState<Method>('otp');
  const [phase, setPhase] = useState<Phase>('entry');

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { secondsLeft, start: startCountdown, stop: stopCountdown } = useCountdown();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearErrors = () => {
    setFormError(null);
    setFieldErrors({});
  };

  /** Turns any failure into a form-level message plus per-field messages. */
  const applyError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      setFieldErrors(error.fieldErrors);
      // Avoid printing the same sentence twice when it is already inline.
      const onlyFieldErrors = Object.keys(error.fieldErrors).length > 0 && error.status === 422;
      setFormError(onlyFieldErrors ? null : friendlyMessage(error));
      return;
    }
    setFormError(friendlyMessage(error));
  }, []);

  /* ---------------------------------------------------------------- Step 1 */

  const sendCode = async (isResend = false) => {
    clearErrors();
    if (isResend) setResending(true);
    else setPending(true);

    try {
      await authRoute<AuthRouteResponse>('/send-otp', { method: 'POST', body: { phone } });
      if (!mounted.current) return;
      setPhase('code');
      setCode('');
      startCountdown(RESEND_SECONDS);
    } catch (error) {
      if (!mounted.current) return;
      applyError(error);
    } finally {
      if (mounted.current) {
        setPending(false);
        setResending(false);
      }
    }
  };

  /* ---------------------------------------------------------------- Step 2 */

  const verifyCode = useCallback(
    async (value: string) => {
      clearErrors();
      setPending(true);

      try {
        const result = await authRoute<AuthRouteResponse>('/verify-otp', {
          method: 'POST',
          body: { phone, otp: value },
        });
        if (!mounted.current) return;

        stopCountdown();

        if (result.is_new_user) {
          // Verified, but no account yet. Hand the verified number to the wizard
          // so step one is already done.
          const params = new URLSearchParams({ phone: result.phone ?? phone, verified: '1' });
          router.push(`/register?${params.toString()}`);
          return;
        }

        setPhase('success');
        // Hold the confirmation briefly, then move into the product. `replace`
        // so Back does not land on a sign-in page for a signed-in member.
        window.setTimeout(() => router.replace(redirectTo), SUCCESS_HOLD_MS);
      } catch (error) {
        if (!mounted.current) return;
        applyError(error);
        // Clear the code so the next attempt starts from an empty field rather
        // than requiring six backspaces.
        setCode('');
      } finally {
        if (mounted.current) setPending(false);
      }
    },
    [phone, router, redirectTo, stopCountdown, applyError],
  );

  /* -------------------------------------------------------------- Password */

  const signInWithPassword = async () => {
    clearErrors();
    setPending(true);

    try {
      await authRoute<AuthRouteResponse>('/login', {
        method: 'POST',
        body: { login: identifier, password },
      });
      if (!mounted.current) return;

      setPhase('success');
      window.setTimeout(() => router.replace(redirectTo), SUCCESS_HOLD_MS);
    } catch (error) {
      if (!mounted.current) return;
      applyError(error);
    } finally {
      if (mounted.current) setPending(false);
    }
  };

  /* ----------------------------------------------------------------- Views */

  if (phase === 'success') {
    return (
      <AuthShell
        overline="Welcome back"
        title={
          <>
            You&rsquo;re <em>in.</em>
          </>
        }
        body="Taking you to your dashboard."
      >
        <div className={styles.success} role="status" aria-live="polite">
          <span className={styles.successMarkWrap}>
            <span className={`${styles.successRing} motion-decoration`} aria-hidden="true" />
            <span className={styles.successMark}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path className={styles.successTick} d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </span>
          </span>
          <h2 className={styles.successTitle}>Signed in</h2>
          <p className={styles.successBody}>Taking you to your dashboard…</p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      overline="Welcome back"
      title={
        <>
          A more considered
          <br />
          <em>way to meet.</em>
        </>
      }
      body="Sign in to pick up where you left off. Your profile, your preferences, and every conversation are exactly as you left them."
    >
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>Sign in</h2>
        <p className={styles.panelSubtitle}>Use a one-time code, or your password if you set one.</p>
      </div>

      {sessionExpired && (
        <Alert tone="warning" title="You were signed out">
          Your session ended, which usually means it was signed out on another device. Sign in again to
          continue.
        </Alert>
      )}

      <Segmented<Method>
        label="Sign-in method"
        value={method}
        onChange={(next) => {
          setMethod(next);
          setPhase('entry');
          clearErrors();
        }}
        options={[
          { value: 'otp', label: 'One-time code', icon: 'message' },
          { value: 'password', label: 'Password', icon: 'lock' },
        ]}
        full
      />

      {formError && (
        <Alert tone="error" assertive>
          {formError}
        </Alert>
      )}

      {/* ================= One-time code ================= */}
      {method === 'otp' && phase === 'entry' && (
        <form
          className={styles.form}
          onSubmit={(event: { preventDefault: () => void }) => {
            event.preventDefault();
            void sendCode();
          }}
          noValidate
        >
          <div className={styles.step}>
            <TextField
              label="Mobile number"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              prefix="+91"
              value={phone}
              onChange={setPhone}
              error={fieldErrors.phone?.[0]}
              help="The number on your Advaita account. We'll text you a 6-digit code."
              required
              maxLength={14}
            />

            <Button type="submit" size="lg" block loading={pending} trailingIcon="arrow-right">
              Send me a code
            </Button>

            <p className={styles.privacyNote}>
              <span className={styles.privacyNoteIcon} aria-hidden="true">
                <Icon name="lock" />
              </span>
              <span>
                Your number is never shown to other members in full. It is used to verify your account and to
                sign you in.
              </span>
            </p>
          </div>
        </form>
      )}

      {method === 'otp' && phase === 'code' && (
        <div className={styles.step}>
          <div className={styles.sentTo}>
            <span className={styles.sentToText}>
              <span className={styles.sentToLabel}>Code sent to</span>
              <span className={styles.sentToValue}>+91 {formatPhone(phone)}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              icon="edit"
              onClick={() => {
                setPhase('entry');
                setCode('');
                stopCountdown();
                clearErrors();
              }}
              aria-label="Change mobile number"
            />
          </div>

          <OtpInput
            value={code}
            onChange={(next) => {
              setCode(next);
              if (formError) clearErrors();
            }}
            onComplete={(value) => void verifyCode(value)}
            sentTo={`+91 ${formatPhone(phone)}`}
            error={fieldErrors.otp?.[0]}
            disabled={pending}
            autoFocus
            secondsLeft={secondsLeft}
            onResend={() => void sendCode(true)}
            resendPending={resending}
          />

          {/* The code auto-submits on the sixth digit; this is the explicit
              fallback for anyone whose autofill pastes without firing input. */}
          <Button
            size="lg"
            block
            loading={pending}
            disabled={code.length !== 6}
            onClick={() => void verifyCode(code)}
          >
            Verify and sign in
          </Button>

          <Note icon="clock">Codes expire after 5 minutes. Requesting a new one replaces the old.</Note>
        </div>
      )}

      {/* ================= Password ================= */}
      {method === 'password' && (
        <form
          className={styles.form}
          onSubmit={(event: { preventDefault: () => void }) => {
            event.preventDefault();
            void signInWithPassword();
          }}
          noValidate
        >
          <div className={styles.step}>
            <TextField
              label="Email or mobile number"
              name="login"
              type="text"
              autoComplete="username"
              icon="user"
              value={identifier}
              onChange={setIdentifier}
              error={fieldErrors.login?.[0]}
              required
            />

            <TextField
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              icon="lock"
              revealable
              value={password}
              onChange={setPassword}
              error={fieldErrors.password?.[0]}
              required
            />

            <Button type="submit" size="lg" block loading={pending} trailingIcon="arrow-right">
              Sign in
            </Button>

            {/*
              Honest recovery. There is no password-reset endpoint, so instead of a
              dead "Forgot password?" link this switches to the method that works
              without a password at all.
            */}
            <button
              type="button"
              className={styles.helperLink}
              onClick={() => {
                setMethod('otp');
                setPhase('entry');
                clearErrors();
              }}
            >
              Forgot your password? Sign in with a one-time code instead
            </button>
          </div>
        </form>
      )}

      <div className={styles.formFoot}>
        <p className={styles.switchRow}>
          New to Advaita?{' '}
          <Link href="/register" className={styles.switchLink}>
            Create a free profile
          </Link>
        </p>
        <ButtonLink href="/help" variant="ghost" size="sm" icon="life-buoy">
          Need help signing in?
        </ButtonLink>
      </div>
    </AuthShell>
  );
}
