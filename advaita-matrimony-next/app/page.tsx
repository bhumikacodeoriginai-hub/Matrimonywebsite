'use client';

import { useState } from 'react';

const communities = [
  { icon: '♡', title: 'General', copy: 'Open-hearted introductions for every kind of family.', tone: 'rose', number: '01' },
  { icon: '✦', title: 'Divyangjan', copy: 'A thoughtful space where accessibility is understood.', tone: 'plum', number: '02' },
  { icon: '◌', title: 'Hearing & speech', copy: 'Connection that makes room for every way of communicating.', tone: 'gold', number: '03' },
  { icon: '✧', title: 'Vitiligo', copy: 'Meet people who see beyond the surface, with confidence.', tone: 'sand', number: '04' },
];

const profiles = [
  { initials: 'A', name: 'Ananya & Rohan', detail: 'Bengaluru · Shared values', quote: 'We found a slower, kinder way to begin.' },
  { initials: 'K', name: 'Kavya & Arjun', detail: 'Mysuru · Family first', quote: 'The right introduction felt like a conversation.' },
  { initials: 'M', name: 'Meera & Vivek', detail: 'Chennai · New chapters', quote: 'Advaita made space for the whole person.' },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState<'en' | 'kn'>('en');

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="site-shell">
      <div className="aurora" aria-hidden="true"><span className="aurora-one" /><span className="aurora-two" /><span className="aurora-three" /></div>
      <div className="grain" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="Advaita Matrimony home" onClick={closeMenu}>
          <span className="brand-mark">A</span>
          <span><strong>advaita</strong><small>inclusive matrimony</small></span>
        </a>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span />
        </button>
        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`}>
          <a href="#communities" onClick={closeMenu}>Communities</a>
          <a href="#how-it-works" onClick={closeMenu}>How it works</a>
          <a href="#stories" onClick={closeMenu}>Stories</a>
          <a href="#plans" onClick={closeMenu}>Plans</a>
          <div className="nav-actions">
            <button className="language-switch" type="button" onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')} aria-label="Change language">
              <span className={language === 'en' ? 'active' : ''}>EN</span><i /> <span className={language === 'kn' ? 'active' : ''}>ಕನ್ನಡ</span>
            </button>
            <a className="text-link" href="#login" onClick={closeMenu}>Sign in</a>
            <a className="button button-small" href="#start" onClick={closeMenu}>Begin your journey <span>↗</span></a>
          </div>
        </nav>
      </header>

      <section className="hero section-wrap" id="top">
        <div className="hero-copy reveal-up">
          <p className="eyebrow"><span className="eyebrow-dot" /> {language === 'kn' ? 'ಎಲ್ಲರಿಗೂ ಪ್ರೀತಿಯ ಹಕ್ಕಿದೆ' : 'A more considered way to meet'}</p>
          <h1>Two journeys.<br /><em>One beginning.</em></h1>
          <p className="hero-lede">A dignified, inclusive space for people who believe that the best introductions begin with being truly seen.</p>
          <div className="hero-actions">
            <a className="button" href="#start">Find your introduction <span>↗</span></a>
            <a className="play-link" href="#how-it-works"><span className="play-icon">▶</span><span>See how Advaita works</span></a>
          </div>
          <div className="hero-proof"><div className="avatar-stack"><span>R</span><span>S</span><span>P</span><span>+</span></div><p><strong>10,000+ journeys</strong><br />begun with intention</p></div>
        </div>
        <div className="hero-visual reveal-up delay-one">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-image-wrap"><img src="/media/hero-poster.svg" alt="An abstract illustration of two people walking together in warm evening light" /><div className="image-caption"><span>01</span><span>Meet with intention</span><span>⌁</span></div></div>
          <div className="floating-note note-top"><span className="note-icon">✦</span><span><strong>Privacy, always</strong><small>Your story stays yours</small></span></div>
          <div className="floating-note note-bottom"><span className="score-ring">92</span><span><strong>Shared values</strong><small>Discovery signal</small></span></div>
        </div>
      </section>

      <section className="trust-strip"><div className="section-wrap trust-inner"><span className="trust-label">A platform built around</span><span>belonging</span><i /><span>accessibility</span><i /><span>privacy</span><i /><span>intentionality</span></div></section>

      <section className="section-wrap intro-section" id="how-it-works">
        <div className="section-heading reveal-up"><p className="eyebrow">THE ADVAITA DIFFERENCE</p><h2>Connection is not a<br /><em>numbers game.</em></h2></div>
        <div className="intro-content reveal-up delay-one"><p>We believe a meaningful introduction needs more than a swipe. It needs context, care, and a space designed for the whole person.</p><a className="arrow-link" href="#principles">Explore our approach <span>→</span></a></div>
      </section>

      <section className="section-wrap compass-section" id="principles">
        <div className="compass-card reveal-up"><div className="compass-copy"><p className="eyebrow light">YOUR DISCOVERY SIGNAL</p><h2>Meet with<br /><em>intention.</em></h2><p>Choose the lens that matters most today. Keep your next introduction focused on what feels right.</p><a className="button button-light" href="#start">Create your profile <span>↗</span></a></div><div className="compass-options"><div className="compass-option selected"><span>♡</span><strong>Shared values</strong><small>Life, family, and outlook</small><b>92</b></div><div className="compass-option"><span>◌</span><strong>Accessibility</strong><small>Be understood, fully</small><b>88</b></div><div className="compass-option"><span>⌛</span><strong>Your pace</strong><small>No pressure, ever</small><b>96</b></div><div className="compass-result"><span className="result-score">92</span><p><strong>Start with the details that shape everyday life.</strong><small>A calmer, more human way to discover one another.</small></p></div></div></div>
      </section>

      <section className="section-wrap communities-section" id="communities"><div className="section-heading split-heading reveal-up"><div><p className="eyebrow">FOUR WAYS TO BELONG</p><h2>Find the space<br />that feels <em>like you.</em></h2></div><p>Every story deserves a community that understands its beginning. Choose yours, or simply come as you are.</p></div><div className="community-grid">{communities.map((community, index) => <a className={`community-card ${community.tone} reveal-up delay-${index + 1}`} href="#start" key={community.title}><span className="card-number">{community.number}</span><span className="community-icon">{community.icon}</span><h3>{community.title}</h3><p>{community.copy}</p><span className="card-arrow">↗</span></a>)}</div></section>

      <section className="section-wrap stories-section" id="stories"><div className="section-heading split-heading reveal-up"><div><p className="eyebrow">REAL PEOPLE. REAL BEGINNINGS.</p><h2>Some stories<br />stay with <em>you.</em></h2></div><a className="arrow-link" href="#stories">Read all stories <span>→</span></a></div><div className="story-rail">{profiles.map((profile, index) => <article className={`story-card reveal-up delay-${index + 1}`} key={profile.name}><div className={`story-avatar avatar-${index + 1}`}><span>{profile.initials}</span></div><div className="story-body"><p className="story-quote">“{profile.quote}”</p><div className="story-meta"><strong>{profile.name}</strong><span>{profile.detail}</span></div></div><span className="story-mark">❞</span></article>)}</div></section>

      <section className="section-wrap privacy-section"><div className="privacy-card reveal-up"><div className="privacy-symbol">◈</div><div><p className="eyebrow">YOUR STORY, YOUR CONTROL</p><h2>Privacy is not a feature.<br /><em>It is the foundation.</em></h2><p>From protected photos to thoughtful contact controls, you decide what to share and when. No shortcuts.</p></div><a className="button button-light" href="#privacy">Our privacy promise <span>↗</span></a></div></section>

      <section className="section-wrap plans-section" id="plans"><div className="section-heading reveal-up"><p className="eyebrow">SIMPLE, HONEST MEMBERSHIP</p><h2>Begin free.<br /><em>Go deeper when ready.</em></h2></div><div className="plan-row"><div className="plan-card reveal-up"><span className="plan-kicker">THE BEGINNING</span><h3>Free</h3><p>A thoughtful first step, without pressure.</p><a className="arrow-link" href="#start">Get started <span>→</span></a></div><div className="plan-card plan-featured reveal-up delay-one"><span className="plan-kicker">THE FULL STORY</span><h3>Premium</h3><p>More ways to connect, with more of the details that matter.</p><a className="button button-light" href="#start">See membership <span>↗</span></a><span className="plan-badge">Most chosen</span></div></div></section>

      <section className="section-wrap final-cta" id="start"><div className="cta-glow" /><p className="eyebrow light">YOUR NEXT CHAPTER STARTS HERE</p><h2>There is no one way<br />to find <em>your person.</em></h2><p>There is only your way. Make the first introduction count.</p><a className="button button-light" href="#login">Begin your journey <span>↗</span></a><div className="cta-line" /></section>

      <footer className="site-footer"><div className="footer-top section-wrap"><a className="brand brand-footer" href="#top"><span className="brand-mark">A</span><span><strong>advaita</strong><small>inclusive matrimony</small></span></a><p>Two journeys. One beginning.</p><div className="footer-links"><a href="#privacy">Privacy</a><a href="#plans">Membership</a><a href="#contact">Contact</a></div></div><div className="footer-bottom section-wrap"><span>© 2026 Advaita Matrimony</span><span>Made with care for every kind of love.</span><span>English · ಕನ್ನಡ</span></div></footer>
    </main>
  );
}
