import Link from 'next/link';

export default function RefundPage() {
  return <main className="legal-page"><Link href="/" className="auth-brand"><span className="brand-box">A</span><span><strong>Advaita</strong><small>inclusive matrimony</small></span></Link><article className="legal-card"><p className="section-kicker">Membership with clarity</p><h1 className="display">Refund policy</h1><p>The final refund terms will be connected to the Laravel subscription and payment policy before membership payments are enabled on this website.</p><Link href="/" className="auth-submit">Return to home <span>→</span></Link></article></main>;
}
