'use client';

import Link from 'next/link';
import { useState } from 'react';

const profiles = [
  { name: 'Priya Sharma', detail: '26 · Designer · Mumbai', score: '94', color: 'rose', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=420&h=520&fit=crop&crop=face&auto=format&q=85' },
  { name: 'Aditya Mehta', detail: '29 · CA · Jaipur', score: '91', color: 'plum', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=420&h=520&fit=crop&crop=face&auto=format&q=85' },
  { name: 'Sneha Patel', detail: '25 · Doctor · Ahmedabad', score: '89', color: 'gold', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=420&h=520&fit=crop&crop=face&auto=format&q=85' },
];

type Language = 'en' | 'kn';

const copy = {
  en: {
    dashboard: 'Dashboard', discover: 'Discover', connections: 'Connections', messages: 'Messages', saved: 'Saved profiles', settings: 'Settings',
    greeting: 'Good morning, Ananya', subtitle: 'Your next meaningful introduction may be closer than you think.', signal: 'Your discovery signal', values: 'Shared values', access: 'Accessibility', pace: 'Your pace',
    complete: 'Profile completeness', finish: 'Finish your profile', recommendations: 'Recommended for you', viewAll: 'View all', activity: 'Your activity', shortlist: 'Shortlisted', interests: 'Interests sent', views: 'Profile views', today: 'today', thisWeek: 'this week', seeAll: 'See all activity', quick: 'Quick actions', edit: 'Edit profile', preferences: 'Update preferences', invite: 'Invite a friend', privacy: 'Privacy is always in your control', privacyCopy: 'Photos and contact details stay protected until you decide to share them.', explore: 'Explore with intention', signOut: 'Sign out',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', discover: 'ಹುಡುಕಿ', connections: 'ಸಂಪರ್ಕಗಳು', messages: 'ಸಂದೇಶಗಳು', saved: 'ಉಳಿಸಿದ ಪ್ರೊಫೈಲ್‌ಗಳು', settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    greeting: 'ಶುಭೋದಯ, ಅನನ್ಯಾ', subtitle: 'ನಿಮ್ಮ ಮುಂದಿನ ಅರ್ಥಪೂರ್ಣ ಪರಿಚಯ ನೀವು ಯೋಚಿಸುವುದಕ್ಕಿಂತ ಹತ್ತಿರದಲ್ಲಿರಬಹುದು.', signal: 'ನಿಮ್ಮ ಸಂಪರ್ಕ ದಿಕ್ಕು', values: 'ಹಂಚಿದ ಮೌಲ್ಯಗಳು', access: 'ಸುಲಭ ಪ್ರವೇಶ', pace: 'ನಿಮ್ಮ ವೇಗ',
    complete: 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣತೆ', finish: 'ಪ್ರೊಫೈಲ್ ಪೂರ್ಣಗೊಳಿಸಿ', recommendations: 'ನಿಮಗಾಗಿ ಶಿಫಾರಸು', viewAll: 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', activity: 'ನಿಮ್ಮ ಚಟುವಟಿಕೆ', shortlist: 'ಉಳಿಸಿದವು', interests: 'ಕಳುಹಿಸಿದ ಆಸಕ್ತಿಗಳು', views: 'ಪ್ರೊಫೈಲ್ ವೀಕ್ಷಣೆಗಳು', today: 'ಇಂದು', thisWeek: 'ಈ ವಾರ', seeAll: 'ಎಲ್ಲಾ ಚಟುವಟಿಕೆ', quick: 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', edit: 'ಪ್ರೊಫೈಲ್ ಬದಲಾಯಿಸಿ', preferences: 'ಆದ್ಯತೆ ಬದಲಾಯಿಸಿ', invite: 'ಸ್ನೇಹಿತರನ್ನು ಆಹ್ವಾನಿಸಿ', privacy: 'ಗೌಪ್ಯತೆ ಯಾವಾಗಲೂ ನಿಮ್ಮ ನಿಯಂತ್ರಣದಲ್ಲಿ', privacyCopy: 'ನೀವು ಹಂಚಿಕೊಳ್ಳಲು ನಿರ್ಧರಿಸುವವರೆಗೆ ಫೋಟೋಗಳು ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು ಸುರಕ್ಷಿತವಾಗಿರುತ್ತವೆ.', explore: 'ಉದ್ದೇಶದಿಂದ ಅನ್ವೇಷಿಸಿ', signOut: 'ಸೈನ್ ಔಟ್',
  },
};

export default function DashboardPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeSignal, setActiveSignal] = useState<'values' | 'access' | 'pace'>('values');
  const [menuOpen, setMenuOpen] = useState(false);
  const t = copy[language];

  return (
    <main className="dashboard-page">
      <div className="dashboard-aurora" aria-hidden="true" />
      <aside className={`dashboard-sidebar ${menuOpen ? 'open' : ''}`}>
        <Link className="dashboard-brand" href="/">
          <span className="brand-box">A</span><span><strong>Advaita</strong><small>{language === 'en' ? 'MATRIMONY' : 'ಮ್ಯಾಟ್ರಿಮೋನಿ'}</small></span>
        </Link>
        <div className="sidebar-label">{language === 'en' ? 'YOUR SPACE' : 'ನಿಮ್ಮ ಸ್ಥಳ'}</div>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className="active" href="#overview" onClick={() => setMenuOpen(false)}><span>⌂</span>{t.dashboard}</a>
          <a href="#discover" onClick={() => setMenuOpen(false)}><span>◌</span>{t.discover}</a>
          <a href="#connections" onClick={() => setMenuOpen(false)}><span>♡</span>{t.connections}<b>3</b></a>
          <a href="#messages" onClick={() => setMenuOpen(false)}><span>⌁</span>{t.messages}<b>2</b></a>
          <a href="#saved" onClick={() => setMenuOpen(false)}><span>☆</span>{t.saved}</a>
        </nav>
        <div className="sidebar-label sidebar-lower">{language === 'en' ? 'ACCOUNT' : 'ಖಾತೆ'}</div>
        <nav className="dashboard-nav"><a href="#settings"><span>⚙</span>{t.settings}</a></nav>
        <div className="sidebar-bottom"><div className="mini-avatar">A</div><div><strong>Ananya Rao</strong><small>General · Bengaluru</small></div><button type="button" aria-label={t.settings}>•••</button></div>
      </aside>

      <section className="dashboard-main" id="overview">
        <header className="dashboard-header"><button className="dashboard-menu" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? '×' : '☰'}</button><div><p className="dashboard-kicker">{t.dashboard}</p><h1>{t.greeting}</h1></div><div className="dashboard-header-actions"><button className="dashboard-language" type="button" onClick={() => setLanguage(language === 'en' ? 'kn' : 'en')} aria-label="Change language">{language === 'en' ? 'ಕನ್ನಡ' : 'English'}</button><button className="notification-button" type="button" aria-label={t.messages}>♧<i /></button><div className="header-avatar">A</div></div></header>
        <p className="dashboard-subtitle">{t.subtitle}</p>

        <div className="dashboard-grid">
          <section className="welcome-card dashboard-bento"><div className="welcome-copy"><p className="dashboard-kicker light">{language === 'en' ? 'A NEW CHAPTER, CONSIDERED' : 'ಒಂದು ಹೊಸ ಅಧ್ಯಾಯ'}</p><h2>{language === 'en' ? <>Your story is<br /><em>unfolding.</em></> : <>ನಿಮ್ಮ ಕಥೆ<br /><em>ತೆರೆಯುತ್ತಿದೆ.</em></>}</h2><p>{language === 'en' ? 'Take a moment to shape your profile. The details you choose to share help the right people find you.' : 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರೂಪಿಸಲು ಸ್ವಲ್ಪ ಸಮಯ ತೆಗೆದುಕೊಳ್ಳಿ. ನೀವು ಹಂಚಿಕೊಳ್ಳುವ ವಿವರಗಳು ಸರಿಯಾದ ಜನರನ್ನು ನಿಮ್ಮ ಬಳಿಗೆ ತರುತ್ತವೆ.'}</p><Link className="dashboard-gold-button" href="#profile">{t.finish}<span>→</span></Link></div><div className="welcome-orbit"><div className="orbit-ring-main"><span>68%</span></div><div className="orbit-dot dot-one" /><div className="orbit-dot dot-two" /><span className="orbit-caption">{t.complete}</span></div></section>

          <section className="completion-card dashboard-bento" id="profile"><div className="card-topline"><span>{t.complete}</span><strong>68%</strong></div><div className="progress-track"><span /></div><p>{language === 'en' ? 'Add your preferences and a short introduction to make your profile feel complete.' : 'ನಿಮ್ಮ ಆದ್ಯತೆಗಳು ಮತ್ತು ಚಿಕ್ಕ ಪರಿಚಯವನ್ನು ಸೇರಿಸಿ.'}</p><Link className="text-action" href="#edit">{t.edit} <span>↗</span></Link></section>

          <section className="signal-card dashboard-bento" id="discover"><div className="signal-heading"><div><p className="dashboard-kicker light">{t.signal}</p><h2>{t.explore}</h2></div><span className="signal-pulse" /></div><div className="signal-options">{([['values', '♡', t.values, '92'], ['access', '♿', t.access, '88'], ['pace', '⌛', t.pace, '96']] as const).map(([key, icon, label, score]) => <button key={key} type="button" className={activeSignal === key ? 'selected' : ''} onClick={() => setActiveSignal(key)} aria-pressed={activeSignal === key}><i>{icon}</i><span>{label}</span><b>{score}</b></button>)}</div><div className="signal-note"><strong>{activeSignal === 'values' ? 'Values first' : activeSignal === 'access' ? 'Designed for understanding' : 'At your pace'}</strong><span>{activeSignal === 'values' ? 'Start with the details that shape everyday life.' : activeSignal === 'access' ? 'Keep communication visible from the beginning.' : 'A thoughtful introduction without pressure.'}</span></div></section>

          <section className="stats-row" id="connections"><article className="stat-card stat-plum dashboard-bento"><span className="stat-icon">♡</span><strong>12</strong><small>{t.shortlist}</small><em>+3 {t.thisWeek}</em></article><article className="stat-card dashboard-bento"><span className="stat-icon rose">✦</span><strong>08</strong><small>{t.interests}</small><em>+2 {t.today}</em></article><article className="stat-card dashboard-bento"><span className="stat-icon gold">◉</span><strong>146</strong><small>{t.views}</small><em>+18 {t.thisWeek}</em></article></section>

          <section className="recommendations dashboard-section" id="saved"><div className="section-title-row"><div><p className="dashboard-kicker">{t.discover}</p><h2>{t.recommendations}</h2></div><a href="#saved">{t.viewAll} <span>→</span></a></div><div className="dashboard-profiles">{profiles.map(profile => <article className="dashboard-profile" key={profile.name}><div className="dashboard-profile-photo"><img src={profile.image} alt={profile.name} /><span className={`profile-score ${profile.color}`}>{profile.score}%</span><button type="button" aria-label={`Save ${profile.name}`}>♡</button></div><div className="dashboard-profile-info"><h3>{profile.name}</h3><p>{profile.detail}</p><span>✦ {language === 'en' ? 'Thoughtful match' : 'ಚಿಂತನಶೀಲ ಜೋಡಿ'}</span></div></article>)}</div></section>

          <section className="activity-card dashboard-bento" id="messages"><div className="section-title-row"><div><p className="dashboard-kicker">{t.activity}</p><h2>{language === 'en' ? 'Small steps matter.' : 'ಚಿಕ್ಕ ಹೆಜ್ಜೆಗಳು ಮುಖ್ಯ.'}</h2></div><a href="#messages">{t.seeAll} <span>→</span></a></div><div className="activity-list"><div><span className="activity-mark rose-bg">♡</span><p><strong>Priya viewed your profile</strong><small>12 minutes ago · Mumbai</small></p><b>↗</b></div><div><span className="activity-mark gold-bg">✦</span><p><strong>New connection signal</strong><small>Yesterday · Shared values 92%</small></p><b>↗</b></div><div><span className="activity-mark plum-bg">⌁</span><p><strong>Complete your introduction</strong><small>2 days ago · 68% complete</small></p><b>↗</b></div></div></section>

          <section className="privacy-dashboard dashboard-bento"><span className="privacy-dashboard-icon">◈</span><div><p className="dashboard-kicker">{t.privacy}</p><h2>{t.privacyCopy}</h2></div><Link href="/privacy">↗</Link></section>
        </div>
        <footer className="dashboard-footer"><span>© 2026 Advaita Matrimony</span><span>{language === 'en' ? 'Two journeys. One beginning.' : 'ಎರಡು ಪಯಣ. ಒಂದು ಆರಂಭ.'}</span><Link href="/">{t.signOut}</Link></footer>
      </section>
    </main>
  );
}
