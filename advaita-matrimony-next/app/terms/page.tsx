import Link from 'next/link';

export default function TermsPage() {
  return <LegalPage title="Terms of use" eyebrow="A clear beginning" copy="We are preparing the complete Advaita terms for this web experience. Please review the final Laravel legal document before launch." />;
}

function LegalPage({ title, eyebrow, copy }: { title: string; eyebrow: string; copy: string }) {
  return <main className="legal-page"><Link href="/" className="auth-brand"><span className="brand-box">A</span><span><strong>Advaita</strong><small>inclusive matrimony</small></span></Link><article className="legal-card"><p className="section-kicker">{eyebrow}</p><h1 className="display">{title}</h1><p>{copy}</p><Link href="/" className="auth-submit">Return to home <span>→</span></Link></article></main>;
}
