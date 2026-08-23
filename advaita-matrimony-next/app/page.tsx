'use client';

import { useEffect, useRef, useState } from 'react';

const profiles = [
  { image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Priya, 26', detail: 'Designer · Mumbai', badge: '✓ Verified', badgeClass: 'verified', quote: 'Meaningful conversations over small talk.' },
  { image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Aditya, 29', detail: 'CA · Jaipur', badge: '♿ Divyangjan', badgeClass: 'plum-badge', quote: 'My disability is one chapter, not my story.' },
  { image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Sneha, 25', detail: 'Doctor · Ahmedabad', badge: '⭐ Vitiligo', badgeClass: 'gold-badge', quote: 'My skin tells my story of strength.' },
  { image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Vikram, 31', detail: 'Designer · Hyderabad', badge: '🤟 Deaf', badgeClass: 'green-badge', quote: 'Silence is my language, art is my voice.' },
  { image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Meera, 27', detail: 'Lawyer · Pune', badge: '✓ Verified', badgeClass: 'verified', quote: 'Looking for an equal partner in every sense.' },
  { image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Arjun, 28', detail: 'Engineer · Bengaluru', badge: '✓ Verified', badgeClass: 'verified', quote: 'Kind heart, strong values, big dreams.' },
];

const secondProfiles = [
  { image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Ananya, 24', detail: 'Software Eng · Bangalore', badge: '✓ Verified', badgeClass: 'verified', quote: 'Love is a verb, not just a feeling.' },
  { image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Karthik, 32', detail: 'Professor · Chennai', badge: '♿ 60% PwD', badgeClass: 'plum-badge', quote: 'Teaching is my passion. Seeking a supportive partner.' },
  { image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Divya, 26', detail: 'Banker · Kolkata', badge: '⭐ Vitiligo', badgeClass: 'gold-badge', quote: 'My spots are my stars.' },
  { image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Rohan, 30', detail: 'Business · Delhi', badge: '✦ Premium', badgeClass: 'gold-badge', quote: 'Family first. Similar values matter most.' },
  { image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Kavitha, 28', detail: 'Artist · Mysore', badge: '🤟 Mute', badgeClass: 'green-badge', quote: 'My paintings speak louder than words.' },
  { image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=520&h=640&fit=crop&crop=face&auto=format&q=85', name: 'Suresh, 33', detail: 'Doctor · Lucknow', badge: '✓ Verified', badgeClass: 'verified', quote: 'Healing others by day, seeking my own healer.' },
];

const compassItems = {
  values: { score: '92', title: 'Values first', copy: 'Start with the details that shape everyday life.' },
  access: { score: '88', title: 'Designed for understanding', copy: 'Keep accessibility and communication visible from the beginning.' },
  pace: { score: '96', title: 'At your pace', copy: 'Choose a thoughtful introduction without pressure or timers.' },
};

type CompassKey = keyof typeof compassItems;
type Language = 'en' | 'kn';

function ProfileRail({ items, reverse, paused, id }: { items: typeof profiles; reverse?: boolean; paused: boolean; id?: string }) {
  const repeated = [...items, ...items];
  return <div className="rail-viewport" id={id}><div className={`profile-rail ${reverse ? 'reverse' : ''} ${paused ? 'paused' : ''}`}>{repeated.map((profile, index) => <article className="profile-card" key={`${profile.name}-${index}`}><div className="profile-photo"><img src={profile.image} alt={index < items.length ? profile.name : ''} loading="lazy" /><div className="photo-shade" /><span className={`chip ${profile.badgeClass}`}>{profile.badge}</span><div className="profile-overlay"><h3>{profile.name}</h3><p>{profile.detail}</p></div></div><div className="profile-quote">“{profile.quote}”</div></article>)}</div></div>;
}

export default function HomePage() {
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);
  const [compass, setCompass] = useState<CompassKey>('values');
  const [paused, setPaused] = useState(false);
  const [heroPaused, setHeroPaused] = useState(false);
  const [heroAudio, setHeroAudio] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const selectedCompass = compassItems[compass];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      video.pause();
      setHeroPaused(true);
      return;
    }
    video.play().catch(() => setHeroPaused(true));
  }, []);

  const toggleHeroPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setHeroPaused(false)).catch(() => setHeroPaused(true));
    } else {
      video.pause();
      setHeroPaused(true);
    }
  };

  const toggleHeroAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setHeroAudio(!video.muted);
    if (!video.paused) video.play().catch(() => setHeroPaused(true));
  };
  const isKannada = language === 'kn';
  const text = (english: string, kannada: string) => isKannada ? kannada : english;
  const jump = () => setMenuOpen(false);

  return <main className={`preview-page ${isKannada ? 'lang-kn' : 'lang-en'}`}>
    <div className="aurora" aria-hidden="true"><span className="a1" /><span className="a2" /><span className="a3" /></div><div className="grain" aria-hidden="true" /><div className="cursor-glow" aria-hidden="true" />

    <header className="preview-header"><nav className="nav-pill"><a className="preview-brand" href="#top" onClick={jump}><span className="brand-box">A</span><span><strong>Advaita</strong><small>{text('MATRIMONY', 'ಮ್ಯಾಟ್ರಿಮೋನಿ')}</small></span></a><div className="desktop-nav"><a href="#compass">{text('Compass', 'ನಿಮ್ಮ ದಿಕ್ಕು')}</a><a href="#profiles">{text('Profiles', 'ಪ್ರೊಫೈಲ್')}</a><a href="#communities">{text('Communities', 'ಸಮುದಾಯ')}</a><a href="#safety">{text('Safety', 'ಸುರಕ್ಷತೆ')}</a><a href="#pricing">{text('Pricing', 'ಬೆಲೆ')}</a></div><div className="nav-actions"><button className="language-button" type="button" onClick={() => setLanguage(isKannada ? 'en' : 'kn')} aria-pressed={isKannada}>{text('ಕನ್ನಡ', 'English')}</button><a className="login-link" href="/login">{text('Log in', 'ಲಾಗಿನ್')}</a><a className="start-button compact" href="/register">{text('Get Started', 'ಪ್ರಾರಂಭಿಸಿ')}</a><button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? '×' : '☰'}</button></div></nav><div className={`mobile-menu ${menuOpen ? 'open' : ''}`}><a href="#compass" onClick={jump}>{text('Connection Compass', 'ಸಂಪರ್ಕ ದಿಕ್ಸೂಚಿ')}</a><a href="#profiles" onClick={jump}>{text('Profiles', 'ಪ್ರೊಫೈಲ್‌ಗಳು')}</a><a href="#communities" onClick={jump}>{text('Communities', 'ಸಮುದಾಯಗಳು')}</a><a href="#safety" onClick={jump}>{text('Safety & Privacy', 'ಸುರಕ್ಷತೆ')}</a><a href="#pricing" onClick={jump}>{text('Pricing', 'ಬೆಲೆ')}</a></div></header>

    <section className="hero-section" id="top"><div className="hero-grid">
      <div className="bento glass headline-tile reveal"><div><div className="inclusive-pill"><span />{text("India's first inclusive matrimony", 'ಭಾರತದ ಮೊದಲ ಎಲ್ಲರನ್ನೂ ಒಳಗೊಂಡ ವಿವಾಹ ವೇದಿಕೆ')}</div><h1 className="display kinetic-title">{isKannada ? <><span>ಎರಡು</span> <em>ಪಯಣ.</em><br /><span>ಒಂದು ಆರಂಭ.</span></> : <><span>Two</span> <span>journeys.</span><br /><em>One</em> <span>beginning.</span></>}</h1><div className="journey-signature"><span /></div><p className="signature-copy">{text('Meet with intention, not pressure.', 'ಒತ್ತಡವಿಲ್ಲದೆ, ಉದ್ದೇಶದಿಂದ ಭೇಟಿ.')}</p><p className="hero-description">{text('A dignified space built for everyone — Divyangjan, hearing & speech, vitiligo, and general communities. No labels. Just love, verified.', 'ಎಲ್ಲರಿಗಾಗಿ ನಿರ್ಮಿಸಲಾದ ಗೌರವಯುತ ವೇದಿಕೆ — ದಿವ್ಯಾಂಗಜನ, ಶ್ರವಣ ಮತ್ತು ಮಾತು, ವಿಟಿಲಿಗೊ ಮತ್ತು ಸಾಮಾನ್ಯ ಸಮುದಾಯ. ಕೇವಲ ಪರಿಶೀಲಿತ ಪ್ರೀತಿ.')}</p></div><div className="hero-buttons"><a className="start-button" href="/register">{text('Create free profile', 'ಉಚಿತ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ')} <span>→</span></a><a className="outline-button" href="#profiles"><span>♥</span>{text('Browse profiles', 'ಪ್ರೊಫೈಲ್ ನೋಡಿ')}</a></div></div>
      <div className={`bento hero-media-tile reveal delay-two ${heroPaused ? 'paused' : ''}`}><img src="/media/hero-poster.svg" alt="A joyful couple celebrating together" /><video ref={videoRef} autoPlay muted loop playsInline preload="auto" poster="/media/hero-poster.svg" onPlay={() => setHeroPaused(false)} onPause={() => setHeroPaused(true)} onError={() => setHeroPaused(true)} aria-describedby="hero-video-description"><source src="/api/media/advaithamatrimony.mp4" type="video/mp4" /><track kind="descriptions" src="/api/media/hero-video-description.vtt" srcLang="en" label="Video description" /></video><span id="hero-video-description" className="sr-only">A quiet cinematic moment of a couple walking together in warm light.</span><div className="media-shade" /><div className="media-topline"><span>✦ {text('Original story', 'ನಿಜ ಕಥೆ')}</span><span>◉ 10 sec film</span></div><div className="media-copy"><p>A LIVING PORTRAIT OF BELONGING</p><h2 className="display">Love, in motion.</h2><span>Real stories begin with a moment that feels true.</span></div><span className="media-status">{heroPaused ? 'Still poster' : 'Cinematic story'}</span><div className="media-controls"><button type="button" onClick={toggleHeroAudio} aria-label={heroAudio ? 'Turn sound off' : 'Turn sound on'} aria-pressed={heroAudio}>{heroAudio ? '🔊' : '🔇'} <span>Sound</span></button><button type="button" onClick={toggleHeroPlayback} aria-label={heroPaused ? 'Play hero video' : 'Pause hero video'} aria-pressed={heroPaused}>{heroPaused ? '▶' : 'Ⅱ'}</button></div></div>
      <section className="bento connection-compass" id="compass"><div className="compass-grid"><div><p className="compass-kicker">{text('Your discovery signal', 'ನಿಮ್ಮ ಸಂಪರ್ಕ ದಿಕ್ಕು')}</p><h2 className="display compass-title">{text('Meet with intention.', 'ಉದ್ದೇಶದೊಂದಿಗೆ ಭೇಟಿ.')}</h2><p className="compass-copy">{text('Set the lens for your discovery. Choose what matters most today and keep your next introduction focused on what feels right.', 'ನಿಮ್ಮ ಸಂಪರ್ಕದ ದಿಕ್ಕನ್ನು ಆರಿಸಿ. ಇಂದು ಮುಖ್ಯವಾದುದನ್ನು ಆಯ್ಕೆ ಮಾಡಿ, ಸರಿಯಾದ ಪರಿಚಯದ ಮೇಲೆ ಗಮನವಿರಲಿ.')}</p><div className="compass-result" aria-live="polite"><div className="compass-ring">{selectedCompass.score}</div><div><strong>{selectedCompass.title}</strong><span>{selectedCompass.copy}</span></div></div></div><div><p className="option-question">{text('What should guide your next introduction?', 'ನಿಮ್ಮ ಮುಂದಿನ ಪರಿಚಯಕ್ಕೆ ಏನು ದಾರಿ ತೋರಿಸಬೇಕು?')}</p><div className="compass-options">{([['values', '♥', 'Shared values', 'Life, family, and outlook'], ['access', '♿', 'Accessibility', 'Be understood, fully'], ['pace', '⌛', 'Your pace', 'No pressure, ever']] as [CompassKey, string, string, string][]).map(([key, icon, title, copy]) => <button className={`compass-option ${compass === key ? 'is-active' : ''}`} type="button" onClick={() => setCompass(key)} aria-pressed={compass === key} key={key}><i>{icon}</i><strong>{text(title, key === 'values' ? 'ಹಂಚಿದ ಮೌಲ್ಯಗಳು' : key === 'access' ? 'ಸುಲಭ ಪ್ರವೇಶ' : 'ನಿಮ್ಮ ವೇಗ')}</strong><small>{text(copy, key === 'values' ? 'ಜೀವನ ಮತ್ತು ಕುಟುಂಬ' : key === 'access' ? 'ಸಂಪೂರ್ಣವಾಗಿ ಅರ್ಥವಾಗಿರಿ' : 'ಯಾವ ಒತ್ತಡವೂ ಇಲ್ಲ')}</small></button>)}</div></div></div></section>
      <div className="bento stat-tile dark"><strong className="display">10K<span>+</span></strong><span>{text('Verified profiles', 'ಪರಿಶೀಲಿತ ಪ್ರೊಫೈಲ್')}</span></div><div className="bento stat-tile"><strong className="display plum-text">500<span>+</span></strong><span>{text('Happy marriages', 'ಸಂತೋಷದ ವಿವಾಹ')}</span></div><div className="bento community-pills"><strong>{text('Four communities, one home', 'ನಾಲ್ಕು ಸಮುದಾಯ, ಒಂದೇ ಮನೆ')}</strong><div><span className="rose-chip">❤️ {text('General', 'ಸಾಮಾನ್ಯ')}</span><span className="plum-chip">♿ {text('Divyangjan', 'ದಿವ್ಯಾಂಗಜನ')}</span><span className="gold-chip">🤟 {text('Hearing & Speech', 'ಶ್ರವಣ-ಮಾತು')}</span><span className="green-chip">⭐ {text('Vitiligo', 'ವಿಟಿಲಿಗೊ')}</span></div></div>
    </div></section>

    <div className="marquee"><div className="marquee-track">{Array.from({ length: 2 }).flatMap(() => ['Dignity ✦', 'ಘನತೆ ✦', 'Verified love ✦', 'ಪ್ರೀತಿ ✦', 'Privacy first ✦', 'ಗೌಪ್ಯತೆ ✦', 'Belonging ✦', 'ನೆಲೆ ✦']).map((item, i) => <span key={`${item}-${i}`}>{item}</span>)}</div></div>

    <section className="content-section profiles-section" id="profiles"><div className="section-heading-row reveal"><div><p className="section-kicker">{text('Featured profiles', 'ವಿಶೇಷ ಪ್ರೊಫೈಲ್‌ಗಳು')}</p><h2 className="display">{text('Real people, ', 'ನಿಜ ಜನ, ')}<em>real stories</em></h2></div><div className="rail-controls"><button type="button" onClick={() => document.getElementById('railOne')?.scrollBy({ left: -300, behavior: 'smooth' })} aria-label="Previous profiles">‹</button><button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? '▶' : 'Ⅱ'}</button><button type="button" onClick={() => document.getElementById('railOne')?.scrollBy({ left: 300, behavior: 'smooth' })} aria-label="Next profiles">›</button></div></div><ProfileRail id="railOne" items={profiles} paused={paused} /><ProfileRail items={secondProfiles} reverse paused={paused} /></section>

    <section className="content-section" id="communities"><div className="center-heading reveal"><p className="section-kicker">{text('Our communities', 'ನಮ್ಮ ಸಮುದಾಯಗಳು')}</p><h2 className="display">{text('One platform. ', 'ಒಂದೇ ವೇದಿಕೆ. ')}<em>Four hearts.</em></h2></div><div className="community-grid"><a href="/register" className="bento community-large dark reveal"><span className="emoji">❤️</span><div><h3 className="display">General</h3><p>{text('Standard matrimony for everyone with AI-assisted matching.', 'ಎಲ್ಲರಿಗೂ AI ಸಹಾಯದ ಜೋಡಿ.')}</p><strong>8,000+ <small>profiles</small></strong></div></a><a href="/register" className="bento community-large glass reveal delay-one"><span className="emoji">♿</span><div><h3 className="display plum-text">Divyangjan</h3><p>{text('UDID verified. Disability-percentage filters and safe matching.', 'UDID ಪರಿಶೀಲಿತ. ಸುರಕ್ಷಿತ ಜೋಡಿ.')}</p><strong className="plum-text">1,200+ <small>profiles</small></strong></div></a><a href="/register" className="bento community-small glass reveal"><span className="emoji">🤟</span><div><h3 className="display plum-text">Hearing & Speech</h3><p>{text('Deaf & mute community with sign-language friendly profiles.', 'ಸಂಜ್ಞಾ ಭಾಷೆ ಸ್ನೇಹಿ.')}</p></div></a><a href="/register" className="bento community-small glass reveal delay-one"><span className="emoji">⭐</span><div><h3 className="display plum-text">Vitiligo</h3><p>{text('A safe, celebrated space for the Vitiligo community.', 'ಸುರಕ್ಷಿತ ಸ್ಥಳ.')}</p></div></a><div className="bento celebration-card reveal delay-two"><img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=700&h=600&fit=crop&auto=format&q=85" alt="Celebration" /><div>{text('Every love, celebrated.', 'ಪ್ರತಿ ಪ್ರೀತಿಯೂ ಸಂಭ್ರಮ.')}</div></div></div></section>

    <section className="content-section" id="safety"><div className="section-heading reveal"><p className="section-kicker">{text('Privacy & Trust', 'ಗೌಪ್ಯತೆ ಮತ್ತು ವಿಶ್ವಾಸ')}</p><h2 className="display">{text('Your safety is ', 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ ')}<em>non-negotiable.</em></h2></div><div className="safety-grid">{[['◈', 'Photo Blur + Request', 'Photos blurred by default. Only approved viewers see them.'], ['✦', 'Auto Watermark', 'Every photo watermarked to prevent misuse.'], ['✓', 'Manual Approval', 'Every profile human-reviewed. Zero fakes.'], ['▣', 'UDID Verification', 'Disability certificates verified by admin.'], ['⊘', 'Screenshot Block', 'App blocks screenshots on profile photos.'], ['⌕', 'Contact Masking', 'Numbers masked. Premium sees full.']].map(([icon, title, copy], index) => <article className="bento safety-card glass reveal" key={title}><span className={`safety-icon safety-${index}`}>{icon}</span><h3>{text(title, title)}</h3><p>{text(copy, copy)}</p></article>)}</div></section>

    <section className="content-section" id="pricing"><div className="center-heading reveal"><p className="section-kicker">{text('Membership', 'ಸದಸ್ಯತ್ವ')}</p><h2 className="display">{text('Honest, ', 'ಪ್ರಾಮಾಣಿಕ, ')}<em>simple pricing.</em></h2></div><div className="pricing-grid"><Plan title="Silver" price="₹999" period="3 mo" oldPrice="₹1,999" features={['50 profile views', '30 interests', 'Chat & contact details']} /><Plan title="Gold" price="₹1,999" period="6 mo" oldPrice="₹3,999" featured features={['Unlimited views', '100 interests', 'Unlimited chat', 'Profile highlight']} /><Plan title="Platinum" price="₹2,999" period="12 mo" oldPrice="₹5,999" features={['Everything in Gold', 'Video calls', 'VIP badge']} /></div></section>

    <section className="final-cta bento"><div className="cta-orb orb-a" /><div className="cta-orb orb-b" /><div className="cta-content"><h2 className="display">{text('Your story deserves a ', 'ನಿಮ್ಮ ಕಥೆಗೆ')}<em>beautiful beginning.</em></h2><p>{text('Join 10,000+ families. Create your profile in 2 minutes — completely free.', '10,000+ ಕುಟುಂಬಗಳೊಂದಿಗೆ ಸೇರಿ. 2 ನಿಮಿಷದಲ್ಲಿ ಉಚಿತ ಪ್ರೊಫೈಲ್.')}</p><a className="start-button gold-button" href="/register">{text('Start your journey', 'ನಿಮ್ಮ ಪ್ರಯಾಣ ಪ್ರಾರಂಭಿಸಿ')} <span>→</span></a></div></section>
    <footer className="site-footer bento glass"><a className="preview-brand" href="#top"><span className="brand-box">A</span><span><strong>Advaita Matrimony</strong><small>ಅದ್ವೈತ ಮ್ಯಾಟ್ರಿಮೋನಿ</small></span></a><div className="footer-links"><a href="/terms">{text('Terms', 'ನಿಯಮ')}</a><a href="/privacy">{text('Privacy', 'ಗೌಪ್ಯತೆ')}</a><a href="/refund">{text('Refund', 'ಮರುಪಾವತಿ')}</a></div><div className="social-links"><span>◎</span><span>f</span><span>▶</span><span>◉</span></div><p>© 2026 Advaita Matrimony · {text('All rights reserved.', 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.')}</p></footer>
  </main>;
}

function Plan({ title, price, period, oldPrice, features, featured }: { title: string; price: string; period: string; oldPrice: string; features: string[]; featured?: boolean }) {
  return <article className={`bento plan-card ${featured ? 'featured' : 'glass'}`}><h3 className="display">{title}</h3><div className="plan-price display">{price}<small> / {period}</small></div><p className="discount"><s>{oldPrice}</s> · 50% off</p><ul>{features.map(feature => <li key={feature}><span>✓</span>{feature}</li>)}</ul><a className={featured ? 'start-button gold-button' : 'outline-button'} href="/register">Get {title}</a>{featured && <span className="recommended">✦ Recommended</span>}</article>;
}
