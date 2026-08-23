'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';

type AuthPanelProps = { mode: 'login' | 'register' };

const communities = [
  ['general', 'General'],
  ['physically_challenged', 'Divyangjan'],
  ['hearing_speech_impaired', 'Hearing & speech'],
  ['vitiligo_skin_condition', 'Vitiligo'],
] as const;

export default function AuthPanel({ mode }: AuthPanelProps) {
  const isRegister = mode === 'register';
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
          <div className="auth-card-heading"><p className="section-kicker">{isRegister ? 'CREATE YOUR PROFILE' : 'YOUR NEXT CHAPTER'}</p><h2 className="display">{isRegister ? 'Begin with intention.' : 'Good to see you.'}</h2><p>{isRegister ? 'It takes about two minutes. You can always add more later.' : 'Sign in to continue your journey.'}</p></div>
          {submitted ? <div className="auth-success" role="status"><span>✓</span><h3>Almost there.</h3><p>This beautiful flow is ready for the Laravel API connection. Your details have not been sent yet.</p><Link className="auth-submit" href="/">Return to home <span>→</span></Link></div> : <form onSubmit={handleSubmit}>
            {isRegister && <>
              <label>Full name<input name="name" required autoComplete="name" placeholder="Your name" /></label>
              <label>Community<span className="field-help">Choose the space that feels right.</span><div className="community-select">{communities.map(([value, label]) => <button key={value} type="button" className={category === value ? 'selected' : ''} onClick={() => setCategory(value)} aria-pressed={category === value}>{label}</button>)}</div></label>
            </>}
            <label>{isRegister ? 'Mobile number' : 'Email or mobile number'}<input name="identity" required autoComplete={isRegister ? 'tel' : 'username'} placeholder={isRegister ? '+91 98765 43210' : 'you@example.com or mobile'} /></label>
            <label>Password<input type="password" name="password" required minLength={6} autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="At least 6 characters" /></label>
            {isRegister && <label className="consent"><input type="checkbox" required name="terms" /> <span>I agree to the <Link href="/terms">terms</Link> and <Link href="/privacy">privacy promise</Link>.</span></label>}
            <button className="auth-submit" type="submit">{isRegister ? 'Create free profile' : 'Sign in securely'} <span>→</span></button>
          </form>}
          <p className="auth-switch">{isRegister ? 'Already have a profile?' : 'New to Advaita?'} <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Begin here'}</Link></p>
        </div>
      </section>
    </main>
  );
}
