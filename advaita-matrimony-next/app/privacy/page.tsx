import Link from 'next/link';

export default function PrivacyPage() {
  return <main className="legal-page"><Link href="/" className="auth-brand"><span className="brand-box">A</span><span><strong>Advaita</strong><small>inclusive matrimony</small></span></Link><article className="legal-card"><p className="section-kicker">Your story, your control</p><h1 className="display">Privacy promise</h1><p>Photos, contact information, and profile details should be shared intentionally. The final privacy policy and API-connected controls will be published here before production launch.</p><Link href="/" className="auth-submit">Return to home <span>→</span></Link></article></main>;
}
