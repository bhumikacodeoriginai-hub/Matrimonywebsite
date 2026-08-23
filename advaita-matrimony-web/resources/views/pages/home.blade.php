@extends('layouts.app')

@section('title', 'Advaita Matrimony | Where Every Heart Finds Its Match')

@php
    $images = config('advaita_images');
    $featuredProfiles = collect($featuredProfiles ?? []);
@endphp

@push('styles')
<style>
    /* Homepage v3: editorial match journey, not a dashboard/template */
    .home-page { background: var(--color-ivory); overflow: hidden; }
    .home-page .eyebrow { color: var(--color-gold-600); font-size: .7rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
    .home-page .serif { font-family: var(--font-display); }
    .hero-editorial { min-height: min(860px, 100vh); background: var(--color-plum-900); color: var(--color-ivory-light); position: relative; isolation: isolate; }
    .hero-editorial::after { content: ''; position: absolute; inset: 0; z-index: -1; background: linear-gradient(90deg, rgba(42,21,38,.98) 0%, rgba(42,21,38,.86) 43%, rgba(42,21,38,.2) 78%, rgba(42,21,38,.34) 100%); }
    .hero-photo { position: absolute; inset: 0 0 0 38%; z-index: -2; overflow: hidden; }
    .hero-photo img { width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: .9; }
    .hero-topline { border-bottom: 1px solid rgba(231,207,161,.26); }
    .hero-copy { max-width: 640px; padding: 11rem 0 8rem; }
    .hero-title { font-size: clamp(3.5rem, 7vw, 7.2rem); line-height: .88; letter-spacing: -.045em; font-weight: 400; }
    .hero-title em { color: var(--color-gold-300); font-weight: 500; }
    .hero-intent { background: rgba(255,252,248,.97); color: var(--color-ink); box-shadow: 0 24px 60px rgba(20,8,20,.28); }
    .hero-intent select { min-height: 50px; border: 1px solid var(--color-ivory-300); border-radius: 8px; background: var(--color-ivory-light); padding: .8rem .9rem; color: var(--color-ink); font: inherit; font-size: .85rem; }
    .hero-intent select:focus { outline: 2px solid var(--color-gold-400); outline-offset: 1px; }
    .trust-line { border-top: 1px solid var(--color-ivory-300); border-bottom: 1px solid var(--color-ivory-300); background: var(--color-ivory-light); }
    .trust-item { display: flex; align-items: center; gap: .8rem; padding: 1.45rem 0; }
    .trust-item + .trust-item { border-left: 1px solid var(--color-ivory-300); padding-left: 2rem; }
    .trust-mark { color: var(--color-plum-700); font-family: var(--font-display); font-size: 1.8rem; line-height: 1; }
    .editorial-section { padding: 7rem 0; }
    .section-intro { max-width: 680px; }
    .section-title { color: var(--color-ink); font: 400 clamp(2.7rem, 5vw, 5.4rem)/.92 var(--font-display); letter-spacing: -.04em; }
    .section-title em { color: var(--color-plum-600); }
    .section-copy { color: var(--color-ivory-600); font-size: 1rem; line-height: 1.8; }
    .discovery-panel { display: grid; grid-template-columns: 1.1fr .9fr; margin-top: 4rem; background: var(--color-plum-800); color: var(--color-ivory-light); min-height: 460px; }
    .discovery-visual { position: relative; min-height: 460px; overflow: hidden; }
    .discovery-visual img { width: 100%; height: 100%; object-fit: cover; object-position: center; opacity: .8; }
    .discovery-visual::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(42,21,38,.1), rgba(42,21,38,.78)); }
    .discovery-caption { position: absolute; left: 2rem; bottom: 2rem; z-index: 1; max-width: 300px; }
    .discovery-content { display: flex; flex-direction: column; justify-content: center; padding: clamp(2rem, 5vw, 5rem); }
    .discovery-content h3 { color: var(--color-gold-300); font: 400 clamp(2.2rem, 4vw, 4rem)/.95 var(--font-display); letter-spacing: -.035em; }
    .discovery-row { display: flex; align-items: center; gap: 1rem; border-top: 1px solid rgba(255,255,255,.18); padding: 1rem 0; }
    .discovery-row:last-of-type { border-bottom: 1px solid rgba(255,255,255,.18); }
    .discovery-number { color: var(--color-gold-400); font: 500 1.5rem var(--font-display); width: 2rem; }
    .profile-rail { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; margin-top: 3.5rem; }
    .profile-frame { background: var(--color-white); border: 1px solid var(--color-ivory-300); }
    .profile-frame-image { aspect-ratio: 4/5; overflow: hidden; position: relative; background: var(--color-plum-50); }
    .profile-frame-image img { width: 100%; height: 100%; object-fit: cover; transition: transform .7s var(--transition-smooth); }
    .profile-frame:hover .profile-frame-image img { transform: scale(1.04); }
    .profile-frame-copy { padding: 1.25rem; }
    .profile-frame-copy h3 { font: 500 1.65rem/1 var(--font-display); color: var(--color-ink); }
    .profile-frame-copy p { font-size: .8rem; margin: .35rem 0 0; color: var(--color-ivory-600); }
    .profile-placeholder { height: 100%; display: grid; place-items: center; padding: 2rem; text-align: center; color: var(--color-plum-700); }
    .profile-placeholder span { display: block; font: 400 2.2rem/1 var(--font-display); }
    .profile-placeholder small { display: block; margin-top: .75rem; color: var(--color-ivory-600); font-size: .78rem; line-height: 1.5; }
    .community-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--color-ivory-300); margin-top: 4rem; border: 1px solid var(--color-ivory-300); }
    .community-card { min-height: 370px; background: var(--color-ivory-light); position: relative; overflow: hidden; display: flex; align-items: end; }
    .community-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: saturate(.84); transition: transform .7s var(--transition-smooth); }
    .community-card:hover img { transform: scale(1.04); }
    .community-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(28,20,32,.9), rgba(28,20,32,.02) 72%); }
    .community-copy { position: relative; z-index: 1; padding: 1.7rem; color: var(--color-white); }
    .community-copy h3 { font: 500 2rem/1 var(--font-display); margin: .45rem 0; }
    .community-copy p { color: rgba(255,255,255,.76); max-width: 350px; font-size: .84rem; line-height: 1.55; }
    .text-link { color: var(--color-gold-500); font-weight: 700; font-size: .78rem; letter-spacing: .03em; }
    .text-link:hover { color: var(--color-plum-600); }
    .principles-section { background: var(--color-plum-900); color: var(--color-ivory-light); }
    .principles-section .section-title { color: var(--color-ivory-light); }
    .principles-section .section-title em { color: var(--color-gold-300); }
    .principles-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; margin-top: 4rem; border-top: 1px solid rgba(231,207,161,.25); }
    .principle { padding: 2.2rem 2rem 2.2rem 0; border-bottom: 1px solid rgba(231,207,161,.25); }
    .principle:nth-child(3n+2), .principle:nth-child(3n+3) { padding-left: 2rem; border-left: 1px solid rgba(231,207,161,.25); }
    .principle-index { color: var(--color-gold-400); font-size: .72rem; letter-spacing: .12em; }
    .principle h3 { font: 500 1.8rem/1 var(--font-display); margin: 1.25rem 0 .65rem; }
    .principle p { color: rgba(255,252,248,.64); font-size: .84rem; line-height: 1.65; margin: 0; }
    .privacy-layout { display: grid; grid-template-columns: .95fr 1.05fr; min-height: 540px; background: var(--color-white); border: 1px solid var(--color-ivory-300); }
    .privacy-photo { min-height: 540px; overflow: hidden; }
    .privacy-photo img { width: 100%; height: 100%; object-fit: cover; }
    .privacy-copy { padding: clamp(2rem, 5vw, 5rem); display: flex; flex-direction: column; justify-content: center; }
    .privacy-list { margin: 2rem 0; border-top: 1px solid var(--color-ivory-300); }
    .privacy-list div { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--color-ivory-300); }
    .privacy-list strong { display: block; color: var(--color-ink); font-size: .86rem; }
    .privacy-list span { display: block; color: var(--color-ivory-600); font-size: .78rem; margin-top: .2rem; }
    .privacy-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--color-trust); margin-top: .45rem; flex: 0 0 auto; }
    .story-grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 1.25rem; margin-top: 3.5rem; }
    .story-card { position: relative; overflow: hidden; min-height: 560px; background: var(--color-plum-800); }
    .story-card.small { min-height: 270px; }
    .story-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .7s var(--transition-smooth); }
    .story-card:hover img { transform: scale(1.04); }
    .story-card::after { content: ''; position: absolute; inset: 0; background: linear-gradient(0deg, rgba(28,20,32,.88), rgba(28,20,32,.02) 70%); }
    .story-copy { position: absolute; z-index: 1; left: 1.75rem; right: 1.75rem; bottom: 1.75rem; color: var(--color-white); }
    .story-copy p { color: rgba(255,255,255,.82); font: italic 1.35rem/1.15 var(--font-display); max-width: 520px; margin: .75rem 0 0; }
    .story-column { display: grid; gap: 1.25rem; }
    .app-section { background: var(--color-ivory-200); }
    .app-showcase { display: grid; grid-template-columns: .9fr 1.1fr; gap: 3rem; align-items: center; }
    .phone-cluster { display: flex; justify-content: center; align-items: flex-end; min-height: 440px; }
    .phone { width: 175px; height: 365px; border: 7px solid var(--color-ink); border-radius: 28px; background: var(--color-white); box-shadow: 16px 18px 0 rgba(84,35,76,.14); overflow: hidden; transform: rotate(-7deg); }
    .phone + .phone { margin-left: -38px; transform: rotate(7deg) translateY(-35px); border-color: var(--color-plum-700); }
    .phone-screen { height: 100%; padding: 1rem .8rem; background: var(--color-ivory-light); }
    .phone-bar { height: 8px; width: 44px; border-radius: 10px; background: var(--color-ink); margin: 0 auto 1.4rem; }
    .phone-photo { height: 150px; overflow: hidden; background: var(--color-plum-100); }
    .phone-photo img { width: 100%; height: 100%; object-fit: cover; }
    .phone-line { height: 8px; border-radius: 8px; background: var(--color-ivory-300); margin-top: .7rem; }
    .phone-line.short { width: 58%; }
    .phone-pill { display: inline-block; margin-top: 1rem; padding: .4rem .55rem; background: var(--color-gold-200); color: var(--color-plum-800); border-radius: 99px; font-size: .52rem; font-weight: 700; }
    .faq-list { max-width: 860px; margin: 3rem auto 0; border-top: 1px solid var(--color-ivory-300); }
    .faq-list details { border-bottom: 1px solid var(--color-ivory-300); }
    .faq-list summary { cursor: pointer; list-style: none; padding: 1.35rem 0; display: flex; justify-content: space-between; align-items: center; font: 500 1.35rem var(--font-display); color: var(--color-ink); }
    .faq-list summary::-webkit-details-marker { display: none; }
    .faq-list summary::after { content: '+'; font: 400 1.5rem var(--font-body); color: var(--color-plum-600); }
    .faq-list details[open] summary::after { content: '−'; }
    .faq-list details p { max-width: 680px; font-size: .88rem; line-height: 1.7; padding: 0 2rem 1.35rem 0; margin: 0; }
    .final-cta { position: relative; min-height: 540px; display: flex; align-items: center; color: var(--color-white); background: var(--color-plum-900); overflow: hidden; }
    .final-cta img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 45%; opacity: .42; }
    .final-cta::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(42,21,38,.96), rgba(42,21,38,.45)); }
    .final-cta-content { position: relative; z-index: 1; max-width: 650px; }
    .final-cta h2 { font: 400 clamp(3rem, 6vw, 6.5rem)/.88 var(--font-display); letter-spacing: -.045em; }
    .reveal-home { opacity: 0; transform: translateY(24px); transition: opacity .7s ease, transform .7s var(--transition-smooth); }
    .reveal-home.is-visible { opacity: 1; transform: none; }
    @media (max-width: 900px) {
        .hero-photo { inset: 0; opacity: .5; }
        .hero-editorial::after { background: linear-gradient(90deg, rgba(42,21,38,.96), rgba(42,21,38,.62)); }
        .hero-copy { padding: 9rem 0 5rem; }
        .trust-item + .trust-item { padding-left: 1rem; }
        .discovery-panel, .privacy-layout, .app-showcase { grid-template-columns: 1fr; }
        .discovery-visual, .privacy-photo { min-height: 360px; }
        .story-grid { grid-template-columns: 1fr; }
        .story-column { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 640px) {
        .editorial-section { padding: 4.5rem 0; }
        .hero-title { font-size: clamp(3.4rem, 17vw, 5.2rem); }
        .hero-intent { margin-top: 2rem; }
        .trust-line .grid { grid-template-columns: 1fr 1fr; }
        .trust-item { padding: 1rem 0; }
        .trust-item + .trust-item { border-left: 0; padding-left: 0; }
        .profile-rail, .community-layout, .principles-grid { grid-template-columns: 1fr; }
        .community-card { min-height: 330px; }
        .principles-grid { border-top: 1px solid rgba(231,207,161,.25); }
        .principle, .principle:nth-child(3n+2), .principle:nth-child(3n+3) { padding: 1.75rem 0; border-left: 0; }
        .story-column { grid-template-columns: 1fr; }
        .story-card, .story-card.small { min-height: 390px; }
        .phone-cluster { transform: scale(.82); margin: -2rem 0; }
    }
    @media (prefers-reduced-motion: reduce) {
        .reveal-home { opacity: 1; transform: none; }
        .profile-frame-image img, .community-card img, .story-card img { transition: none; }
    }
</style>
@endpush

@section('content')
<div class="home-page">
    <!-- HERO: a confident first impression, not a feature collage -->
    <section class="hero-editorial">
        <div class="hero-photo" aria-hidden="true">
            <picture>
                <source media="(max-width: 640px)" srcset="{{ $images['hero']['mobile'] }}">
                <img src="{{ $images['hero']['desktop'] }}" alt="">
            </picture>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="hero-topline py-4 flex items-center justify-between gap-4 text-xs text-gold-300/90">
                <span class="tracking-[.18em] uppercase">Advaita / A more human way to meet</span>
                <span class="hidden sm:block">English · ಕನ್ನಡ</span>
            </div>
            <div class="hero-copy">
                <p class="eyebrow text-gold-300 mb-6">India's inclusive matrimony</p>
                <h1 class="hero-title serif">Where every<br><em>heart</em> finds<br>its match.</h1>
                <p class="mt-8 max-w-lg text-base sm:text-lg leading-relaxed text-white/72">
                    A thoughtful place to meet someone who understands your values, your family, and the life you want to build together.
                </p>
                <div class="mt-9 flex flex-wrap gap-3">
                    <a href="{{ route('register') }}" class="btn-premium btn-gold-premium btn-lg">Begin your story <span aria-hidden="true">↗</span></a>
                    <a href="#discover" class="inline-flex items-center px-5 py-3 text-sm font-semibold text-white/88 hover:text-gold-300 transition-colors">See how it works <span class="ml-2" aria-hidden="true">↓</span></a>
                </div>
                <div class="hero-intent mt-12 max-w-2xl p-5 sm:p-6">
                    <div class="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <p class="eyebrow text-plum-700">Start with intention</p>
                            <h2 class="serif text-2xl sm:text-3xl text-ink mt-1">Who would you like to meet?</h2>
                        </div>
                        <span class="text-xs text-ivory-600 mt-1">Step 1 of 1</span>
                    </div>
                    <form action="{{ route('register') }}" method="GET" class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <label class="sr-only" for="home-gender">Looking for</label>
                        <select id="home-gender" name="gender">
                            <option value="">Looking for</option>
                            <option value="female">A bride</option>
                            <option value="male">A groom</option>
                        </select>
                        <label class="sr-only" for="home-location">Location</label>
                        <select id="home-location" name="location">
                            <option value="">Any location</option>
                            <option value="Bengaluru">Bengaluru</option>
                            <option value="Mumbai">Mumbai</option>
                            <option value="Chennai">Chennai</option>
                            <option value="Hyderabad">Hyderabad</option>
                        </select>
                        <button type="submit" class="btn-premium btn-primary-premium min-h-[50px]">Explore matches <span aria-hidden="true">→</span></button>
                    </form>
                    <p class="mt-3 text-xs text-ivory-600">You can refine your preferences after creating your private profile.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- TRUST: quiet proof, no invented numbers -->
    <section class="trust-line" aria-label="Advaita trust commitments">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-x-5">
            <div class="trust-item"><span class="trust-mark">01</span><div><strong class="block text-sm text-ink">Human review</strong><span class="text-xs text-ivory-600">Profiles are reviewed before approval.</span></div></div>
            <div class="trust-item"><span class="trust-mark">02</span><div><strong class="block text-sm text-ink">Privacy by choice</strong><span class="text-xs text-ivory-600">You decide who sees your photos.</span></div></div>
            <div class="trust-item"><span class="trust-mark">03</span><div><strong class="block text-sm text-ink">Inclusive by design</strong><span class="text-xs text-ivory-600">Every community belongs here.</span></div></div>
            <div class="trust-item"><span class="trust-mark">04</span><div><strong class="block text-sm text-ink">Secure conversations</strong><span class="text-xs text-ivory-600">Connect at your own pace.</span></div></div>
        </div>
    </section>

    <!-- DISCOVERY -->
    <section class="editorial-section" id="discover">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="section-intro reveal-home">
                <p class="eyebrow">A calmer beginning</p>
                <h2 class="section-title mt-4">Less browsing.<br><em>More belonging.</em></h2>
                <p class="section-copy mt-6">Advaita is designed around the conversations that matter — not endless swiping. Begin with what you value, see the context behind a match, and take the next step when it feels right.</p>
            </div>
            <div class="discovery-panel reveal-home">
                <div class="discovery-visual">
                    <img src="{{ $images['communities']['general']['image'] }}" alt="{{ $images['communities']['general']['alt'] }}" loading="lazy">
                    <div class="discovery-caption">
                        <p class="eyebrow text-gold-300">The Advaita approach</p>
                        <p class="serif text-3xl leading-none mt-2">A meaningful introduction starts with context.</p>
                    </div>
                </div>
                <div class="discovery-content">
                    <h3>Meet with<br>more clarity.</h3>
                    <div class="mt-8">
                        <div class="discovery-row"><span class="discovery-number">01</span><span class="text-sm text-white/78">Tell us what matters in a partner.</span></div>
                        <div class="discovery-row"><span class="discovery-number">02</span><span class="text-sm text-white/78">Explore people through shared values and life details.</span></div>
                        <div class="discovery-row"><span class="discovery-number">03</span><span class="text-sm text-white/78">Connect privately, with no pressure to perform.</span></div>
                    </div>
                    <a href="{{ route('register') }}" class="btn-premium btn-gold-premium self-start mt-8">Create a private profile <span aria-hidden="true">↗</span></a>
                </div>
            </div>
        </div>
    </section>

    <!-- PROFILE PREVIEWS: data-aware and honest fallback -->
    <section class="editorial-section pt-0">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div class="section-intro reveal-home">
                    <p class="eyebrow">A glimpse of discovery</p>
                    <h2 class="section-title mt-4">Profiles with a<br><em>point of view.</em></h2>
                </div>
                <a href="{{ route('register') }}" class="text-link reveal-home">Join to explore profiles <span aria-hidden="true">↗</span></a>
            </div>
            <div class="profile-rail reveal-home">
                @forelse($featuredProfiles as $profile)
                    @php
                        $profileName = data_get($profile, 'name', 'Advaita member');
                        $profileImage = data_get($profile, 'primary_photo.url') ?: data_get($profile, 'primaryPhoto.url');
                        $profileMeta = collect([data_get($profile, 'profile.city'), data_get($profile, 'profile.occupation')])->filter()->implode(' · ');
                    @endphp
                    <article class="profile-frame">
                        <div class="profile-frame-image">
                            @if($profileImage)
                                <img src="{{ $profileImage }}" alt="{{ $profileName }}" loading="lazy">
                            @else
                                <div class="profile-placeholder"><div><span>Photo protected</span><small>This member has chosen to share their photo privately.</small></div></div>
                            @endif
                        </div>
                        <div class="profile-frame-copy"><h3>{{ $profileName }}</h3><p>{{ $profileMeta ?: 'Profile details available after joining' }}</p></div>
                    </article>
                @empty
                    <article class="profile-frame"><div class="profile-frame-image"><div class="profile-placeholder"><div><span>Start with values</span><small>See people through the details that shape their everyday life.</small></div></div></div><div class="profile-frame-copy"><h3>Shared values</h3><p>A more meaningful way to discover.</p></div></article>
                    <article class="profile-frame"><div class="profile-frame-image"><div class="profile-placeholder"><div><span>Privacy first</span><small>Protected photos stay protected until a member chooses to share them.</small></div></div></div><div class="profile-frame-copy"><h3>At your pace</h3><p>Connection without pressure.</p></div></article>
                    <article class="profile-frame"><div class="profile-frame-image"><div class="profile-placeholder"><div><span>Your story</span><small>Build a profile that feels like you, not a checklist.</small></div></div></div><div class="profile-frame-copy"><h3>Be understood</h3><p>Begin with a private profile.</p></div></article>
                @endforelse
            </div>
        </div>
    </section>

    <!-- COMMUNITIES: equal editorial treatment -->
    <section class="editorial-section bg-white" id="communities">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="section-intro reveal-home">
                <p class="eyebrow">One home, many stories</p>
                <h2 class="section-title mt-4">There is no single<br><em>way to belong.</em></h2>
                <p class="section-copy mt-6">Our communities are represented with equal care — because inclusion is not a category filter. It is how the whole experience is built.</p>
            </div>
            <div class="community-layout reveal-home">
                @foreach([
                    ['key' => 'general', 'label' => 'General matrimony', 'copy' => 'For people looking for a thoughtful, values-led life partnership.'],
                    ['key' => 'divyangjan', 'label' => 'Divyangjan', 'copy' => 'A dignified space where disability is part of the story, never the whole story.'],
                    ['key' => 'hearing_speech', 'label' => 'Hearing & speech', 'copy' => 'Connect with people who understand different ways of communicating and being heard.'],
                    ['key' => 'vitiligo', 'label' => 'Vitiligo community', 'copy' => 'A place to meet with openness, confidence, and respect for every kind of beauty.'],
                ] as $community)
                    <article class="community-card">
                        <img src="{{ $images['communities'][$community['key']]['image'] }}" alt="{{ $images['communities'][$community['key']]['alt'] }}" loading="lazy">
                        <div class="community-copy"><p class="eyebrow text-gold-300">Community</p><h3>{{ $community['label'] }}</h3><p>{{ $community['copy'] }}</p><a href="{{ route('register') }}?category={{ $community['key'] === 'general' ? 'general' : ($community['key'] === 'divyangjan' ? 'physically_challenged' : ($community['key'] === 'hearing_speech' ? 'hearing_speech_impaired' : 'vitiligo_skin_condition')) }}" class="text-link">Explore this community <span aria-hidden="true">↗</span></a></div>
                    </article>
                @endforeach
            </div>
        </div>
    </section>

    <!-- PRINCIPLES -->
    <section class="editorial-section principles-section">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="section-intro reveal-home"><p class="eyebrow text-gold-300">Why Advaita</p><h2 class="section-title mt-4">Technology with<br><em>human judgement.</em></h2><p class="mt-6 text-white/65 leading-relaxed max-w-xl">The best matchmaking experience should feel reassuring, not addictive. Every feature is here to help you make a better decision — not a faster one.</p></div>
            <div class="principles-grid reveal-home">
                <div class="principle"><span class="principle-index">01 / TRUST</span><h3>Profiles with context</h3><p>Move beyond a photo and a headline with details about values, family, work, lifestyle, and preferences.</p></div>
                <div class="principle"><span class="principle-index">02 / PRIVACY</span><h3>Visibility by consent</h3><p>Photo access, contact details, and conversations stay within the controls chosen by each member.</p></div>
                <div class="principle"><span class="principle-index">03 / INCLUSION</span><h3>Designed for everyone</h3><p>Inclusive categories, Kannada support, clear language, and respectful representation are part of the foundation.</p></div>
                <div class="principle"><span class="principle-index">04 / COMPATIBILITY</span><h3>Explain the why</h3><p>Compatibility should be understandable — shared preferences and life details matter more than a mysterious score.</p></div>
                <div class="principle"><span class="principle-index">05 / SAFETY</span><h3>Human support</h3><p>Verification, profile approval, reporting, and privacy tools help create a more accountable community.</p></div>
                <div class="principle"><span class="principle-index">06 / PACE</span><h3>Connection without pressure</h3><p>Send an interest, ask for a photo, or start a conversation when you are ready. There is no swipe timer.</p></div>
            </div>
        </div>
    </section>

    <!-- PRIVACY -->
    <section class="editorial-section" id="safety">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="privacy-layout reveal-home">
                <div class="privacy-photo"><img src="{{ $images['privacy']['image'] }}" alt="{{ $images['privacy']['alt'] }}" loading="lazy"></div>
                <div class="privacy-copy"><p class="eyebrow">Your boundaries matter</p><h2 class="section-title mt-4">Your privacy<br><em>comes first.</em></h2><p class="section-copy mt-6">You should never have to trade personal privacy for the chance to meet someone. Advaita keeps important decisions in your hands.</p><div class="privacy-list"><div><span class="privacy-dot"></span><div><strong>Protected photos</strong><span>Share access only when you are comfortable.</span></div></div><div><span class="privacy-dot"></span><div><strong>Contact masking</strong><span>Keep phone and email details private until you choose.</span></div></div><div><span class="privacy-dot"></span><div><strong>Profile and UDID review</strong><span>Verification helps make introductions more trustworthy.</span></div></div></div><a href="{{ route('privacy') }}" class="btn-premium btn-primary-premium self-start">Read our privacy promise <span aria-hidden="true">↗</span></a></div>
            </div>
        </div>
    </section>

    <!-- STORIES -->
    <section class="editorial-section bg-white" id="stories">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5"><div class="section-intro reveal-home"><p class="eyebrow">The human outcome</p><h2 class="section-title mt-4">Every match has<br><em>a story behind it.</em></h2></div><a href="{{ route('success-stories') }}" class="text-link reveal-home">Read more stories <span aria-hidden="true">↗</span></a></div>
            <div class="story-grid reveal-home">
                <article class="story-card"><img src="{{ $images['stories'][0]['image'] }}" alt="{{ $images['stories'][0]['alt'] }}" loading="lazy"><div class="story-copy"><p class="eyebrow text-gold-300">{{ $images['stories'][0]['eyebrow'] }}</p><p>“{{ $images['stories'][0]['quote'] }}”</p></div></article>
                <div class="story-column"><article class="story-card small"><img src="{{ $images['stories'][1]['image'] }}" alt="{{ $images['stories'][1]['alt'] }}" loading="lazy"><div class="story-copy"><p class="eyebrow text-gold-300">{{ $images['stories'][1]['eyebrow'] }}</p><p>“{{ $images['stories'][1]['quote'] }}”</p></div></article><article class="story-card small"><img src="{{ $images['stories'][2]['image'] }}" alt="{{ $images['stories'][2]['alt'] }}" loading="lazy"><div class="story-copy"><p class="eyebrow text-gold-300">{{ $images['stories'][2]['eyebrow'] }}</p><p>“{{ $images['stories'][2]['quote'] }}”</p></div></article></div>
            </div>
        </div>
    </section>

    <!-- APP -->
    <section class="editorial-section app-section" id="app">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="app-showcase"><div class="phone-cluster reveal-home" aria-label="Preview of the Advaita mobile experience"><div class="phone"><div class="phone-screen"><div class="phone-bar"></div><div class="phone-photo"><img src="{{ $images['hero']['mobile'] }}" alt="" loading="lazy"></div><div class="phone-line"></div><div class="phone-line short"></div><span class="phone-pill">Profile verified</span><div class="phone-line"></div><div class="phone-line short"></div></div></div><div class="phone"><div class="phone-screen"><div class="phone-bar"></div><p class="eyebrow text-plum-700">For you</p><div class="phone-photo mt-3"><img src="{{ $images['communities']['general']['image'] }}" alt="" loading="lazy"></div><div class="phone-line"></div><div class="phone-line short"></div><span class="phone-pill">Shared values</span><div class="phone-line"></div></div></div></div><div class="reveal-home"><p class="eyebrow">A quieter way to connect</p><h2 class="section-title mt-4">Your matches,<br><em>wherever you are.</em></h2><p class="section-copy mt-6">Keep your discovery, conversations, interests, and privacy controls close — with the same warm, considered experience on mobile.</p><div class="mt-8 flex flex-wrap gap-3"><span class="inline-flex items-center gap-2 px-4 py-3 bg-white border border-ivory-300 text-sm font-semibold text-ink">Android app</span><span class="inline-flex items-center gap-2 px-4 py-3 bg-white border border-ivory-300 text-sm font-semibold text-ink">iOS coming soon</span></div></div></div></div>
    </section>

    <!-- FAQ -->
    <section class="editorial-section" id="faq">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div class="text-center section-intro mx-auto reveal-home"><p class="eyebrow">Good questions are welcome</p><h2 class="section-title mt-4">Before you<br><em>begin.</em></h2></div><div class="faq-list reveal-home"><details><summary>How does Advaita work?</summary><p>Create a profile, share what matters to you, explore compatible people, and choose when to send an interest or begin a conversation.</p></details><details><summary>Are profiles reviewed?</summary><p>The existing platform includes profile approval, photo moderation, OTP verification, and UDID verification flows. The interface will show each status clearly rather than hiding it behind decorative badges.</p></details><details><summary>Can I protect my photos?</summary><p>Yes. The existing photo privacy model supports protected access, blurred images, member-only visibility, and photo requests. Your profile experience will communicate those states clearly.</p></details><details><summary>Can I use Kannada?</summary><p>English and Kannada are supported in the product direction. The remaining screens need broader copy coverage so language switching is not limited to a few labels.</p></details><details><summary>Is registration free?</summary><p>Registration is available through the existing OTP flow. Subscription features and payment availability depend on the plans configured by the platform.</p></details></div></div>
    </section>

    <!-- FINAL CTA -->
    <section class="final-cta"><img src="{{ $images['stories'][0]['image'] }}" alt="" loading="lazy"><div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full"><div class="final-cta-content reveal-home"><p class="eyebrow text-gold-300">Your next chapter starts here</p><h2 class="mt-5">Your story could be the next one we celebrate.</h2><p class="mt-7 max-w-md text-white/72 leading-relaxed">Create a profile that feels like you. Meet with intention. Let the right beginning take its time.</p><div class="mt-8 flex flex-wrap gap-3"><a href="{{ route('register') }}" class="btn-premium btn-gold-premium btn-lg">Create free profile <span aria-hidden="true">↗</span></a><a href="{{ route('login') }}" class="inline-flex items-center px-5 py-3 text-sm font-semibold text-white hover:text-gold-300 transition-colors">Already a member? Sign in</a></div></div></div></section>
</div>
@endsection

@push('scripts')
<script>
    (function () {
        const elements = document.querySelectorAll('.reveal-home');
        if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    instance.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        elements.forEach((element) => observer.observe(element));
    }());
</script>
@endpush
