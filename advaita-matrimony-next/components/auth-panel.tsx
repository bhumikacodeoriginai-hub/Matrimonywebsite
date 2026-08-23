'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

type AuthPanelProps = { mode: 'login' | 'register' };

const DEMO_USERNAME = 'demo@advaita.test';
const DEMO_PASSWORD = 'Advaita2026!';

const communities = [
  ['general', 'General'],
  ['physically_challenged', 'Divyangjan'],
  ['hearing_speech_impaired', 'Hearing & speech'],
  ['vitiligo_skin_condition', 'Vitiligo'],
] as const;

export default function AuthPanel({ mode }: AuthPanelProps) {
  const isRegister = mode === 'register';
  const router = useRouter();
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!isRegister) {
      const formData = new FormData(event.currentTarget);
      const username = String(formData.get('identity') ?? '').trim();
      const password = String(formData.get('password') ?? '');
      if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
        router.push('/dashboard');
        return;
      }
      setError('Use the preview username and password shown below.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="auth-page">
      <div className="auth-aurora" aria-hidden="true" />
      <Link className="auth-brand" href="/">
        <span className="brand-box">A</span>
        <span><strong>Advaita</strong><small>inclusive matrimony</small></span>
      </Link>
      <section className="auth-layout">
        <div className="auth-story">
          <p className="section-kicker">{isRegister ? 'YOUR STORY STARTS HERE' : 'WELCOME BACK'}</p>
          <h1 className="display">A more considered<br /><em>way to meet.</em></h1>
          <p>Come as you are. Build a profile around what matters, and take every introduction at your own pace.</p>
          <div className="auth-trust"><span>✦</span><div><strong>Privacy by default</strong><small>Your profile stays in your control.</small></div></div>
        </div>
        <div className="auth-card">
          <div className="auth-card-heading"><p className="section-kicker">{isRegister ? 'CREATE YOUR PROFILE' : 'PREVIEW ACCESS'}</p><h2 className="display">{isRegister ? 'Begin with intention.' : 'Welcome back.'}</h2><p>{isRegister ? 'It takes about two minutes. You can always add more later.' : 'Enter the demo details to explore the main dashboard.'}</p></div>
          {!isRegister && <div className="demo-credentials" role="note"><strong>Demo username</strong><code>{DEMO_USERNAME}</code><strong>Demo password</strong><code>{DEMO_PASSWORD}</code><small>Preview-only credentials. This does not connect to production authentication.</small></div>}
          {submitted ? <div className="auth-success" role="status"><span>✓</span><h3>Almost there.</h3><p>This beautiful flow is ready for the Laravel API connection. Your details have not been sent yet.</p><Link className="auth-submit" href="/">Return to home <span>→</span></Link></div> : <form onSubmit={handleSubmit}>
            {isRegister && <>
              <label>Full name<input name="name" required autoComplete="name" placeholder="Your name" /></label>
              <label>Community<span className="field-help">Choose the space that feels right.</span><div className="community-select">{communities.map(([value, label]) => <button key={value} type="button" className={category === value ? 'selected' : ''} onClick={() => setCategory(value)} aria-pressed={category === value}>{label}</button>)}</div></label>
            </>}
            <label>{isRegister ? 'Mobile number' : 'Email or mobile number'}<input name="identity" required autoComplete={isRegister ? 'tel' : 'username'} placeholder={isRegister ? '+91 98765 43210' : 'you@example.com or mobile'} /></label>
            <label>Password<input type="password" name="password" required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="At least 6 characters" /></label>
            {isRegister && <label className="consent"><input type="checkbox" required name="terms" /> <span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy promise</Link>.</span></label>}
            <button className="auth-submit" type="submit">{isRegister ? 'Create free profile' : 'Open dashboard'} <span>→</span></button>
            {error && <p className="auth-error" role="alert">{error}</p>}
          </form>}
          <p className="auth-switch">{isRegister ? 'Already have a profile?' : 'New to Advaita?'} <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Begin here'}</Link></p>
        </div>
      </section>
    </main>
  );
}
