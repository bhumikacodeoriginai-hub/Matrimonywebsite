<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title') · Advaita Operations</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="{{ asset('css/design-tokens.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root { --admin-plum: #2A1526; --admin-ink: #1C1420; --admin-ivory: #FBF7F1; --admin-line: #E9DDD3; --admin-gold: #C19A5B; }
        .bg-ivory\/90 { background: rgba(251,247,241,.9); }
        .bg-ivory-200 { background: #F2E9DD; }
        .bg-plum-900 { background: #2A1526; }
        .bg-plum-700 { background: #54234C; }
        .bg-gold-300 { background: #E7CFA1; }
        .bg-gold-500 { background: #C19A5B; }
        .bg-trust { background: #4C9B78; }
        .bg-rose-500 { background: #D4577E; }
        .bg-trust-light { background: #E8F5F0; }
        .text-ink { color: #1C1420; }
        .text-plum-900 { color: #2A1526; }
        .text-plum-700 { color: #54234C; }
        .text-plum-300 { color: #C77BB0; }
        .text-gold-600 { color: #9A7A3D; }
        .text-gold-300 { color: #E7CFA1; }
        .text-ivory-600 { color: #756B72; }
        .text-ivory-300 { color: #E9DDD3; }
        .text-trust { color: #4C9B78; }
        .border-ivory-300 { border-color: #E9DDD3; }
        .hover\\:border-plum-300:hover { border-color: #C77BB0; }
        .text-amber-700 { color: #B45309; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--admin-ivory); color: var(--admin-ink); }
        .admin-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .admin-shell { min-height: 100vh; }
        .admin-sidebar { background: var(--admin-plum); color: rgba(255,252,248,.68); }
        .admin-sidebar a { transition: color .2s ease, background .2s ease; }
        .admin-sidebar a:hover { color: #FFFCF8; background: rgba(255,255,255,.08); }
        .admin-sidebar a.is-active { color: #2A1526; background: #E7CFA1; }
        .admin-sidebar .section-label { color: rgba(231,207,161,.62); letter-spacing: .16em; }
        .admin-content { background: var(--admin-ivory); }
        .admin-card { background: #FFFCF8; border: 1px solid var(--admin-line); box-shadow: 0 8px 30px rgba(42,21,38,.05); }
        .admin-kpi { border-left: 3px solid var(--admin-gold); }
        .admin-table th { color: #756B72; font-size: .68rem; letter-spacing: .1em; text-transform: uppercase; font-weight: 700; }
        .admin-table td { border-top: 1px solid var(--admin-line); }
        .admin-menu-button { display: none; }
        @media (max-width: 1024px) {
            .admin-sidebar { position: fixed; inset: 0 auto 0 0; width: 280px; z-index: 50; transform: translateX(-100%); transition: transform .25s ease; }
            .admin-sidebar.is-open { transform: translateX(0); }
            .admin-menu-button { display: inline-flex; }
        }
    </style>
</head>
<body>
<div class="admin-shell flex">
    <aside id="adminSidebar" aria-label="Admin navigation" class="admin-sidebar w-72 flex-shrink-0 min-h-screen overflow-y-auto">
        <div class="px-6 py-7 border-b border-white/10">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3">
                <span class="w-11 h-11 rounded-xl bg-gold-300 text-plum-900 flex items-center justify-center admin-display text-2xl font-bold italic">A</span>
                <span><strong class="admin-display text-2xl leading-none text-white block">Advaita</strong><small class="block text-[10px] tracking-[.18em] uppercase text-gold-300/70 mt-1">Operations</small></span>
            </a>
        </div>
        <nav class="p-4 space-y-1" aria-label="Admin navigation">
            <p class="section-label text-[10px] uppercase px-3 pt-2 pb-3">Overview</p>
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.dashboard') ? 'is-active' : '' }}"><i class="fa-solid fa-chart-line w-5 text-center"></i>Dashboard</a>
            <a href="{{ route('admin.analytics') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.analytics') ? 'is-active' : '' }}"><i class="fa-solid fa-compass w-5 text-center"></i>Analytics</a>

            <p class="section-label text-[10px] uppercase px-3 pt-7 pb-3">Trust operations</p>
            <a href="{{ route('admin.profiles.pending') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.profiles.*') ? 'is-active' : '' }}"><i class="fa-solid fa-user-check w-5 text-center"></i>Profile approvals</a>
            <a href="{{ route('admin.photos.pending') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.photos.*') ? 'is-active' : '' }}"><i class="fa-solid fa-images w-5 text-center"></i>Photo review</a>
            <a href="{{ route('admin.udid') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.udid') ? 'is-active' : '' }}"><i class="fa-solid fa-id-card w-5 text-center"></i>UDID verification</a>
            <a href="{{ route('admin.reports') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.reports') ? 'is-active' : '' }}"><i class="fa-solid fa-flag w-5 text-center"></i>Reports</a>

            <p class="section-label text-[10px] uppercase px-3 pt-7 pb-3">Members & revenue</p>
            <a href="{{ route('admin.members') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.members*') ? 'is-active' : '' }}"><i class="fa-solid fa-users w-5 text-center"></i>Members</a>
            <a href="{{ route('admin.packages') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.packages*') ? 'is-active' : '' }}"><i class="fa-solid fa-layer-group w-5 text-center"></i>Plans</a>

            <p class="section-label text-[10px] uppercase px-3 pt-7 pb-3">Content & system</p>
            <a href="{{ route('admin.banners') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.banners') ? 'is-active' : '' }}"><i class="fa-solid fa-image w-5 text-center"></i>Banners</a>
            <a href="{{ route('admin.pages') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.pages*') ? 'is-active' : '' }}"><i class="fa-solid fa-file-lines w-5 text-center"></i>Legal pages</a>
            <a href="{{ route('admin.settings') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl {{ request()->routeIs('admin.settings*') ? 'is-active' : '' }}"><i class="fa-solid fa-sliders w-5 text-center"></i>Settings</a>
            <a href="{{ route('admin.free-mode') }}" class="flex items-center gap-3 px-3 py-3 rounded-xl"><i class="fa-solid fa-toggle-on w-5 text-center"></i>Free mode</a>
        </nav>
    </aside>

    <div class="admin-content min-w-0 flex-1">
        <header class="sticky top-0 z-30 bg-ivory/90 backdrop-blur border-b border-ivory-300 px-4 sm:px-8 py-4 flex items-center justify-between">
            <div class="flex items-center gap-4"><button id="adminMenuButton" type="button" class="admin-menu-button w-10 h-10 items-center justify-center rounded-xl border border-ivory-300 bg-white text-plum-700" aria-label="Open navigation" aria-controls="adminSidebar" aria-expanded="false"><i class="fa-solid fa-bars"></i></button><div><p class="text-[10px] uppercase tracking-[.16em] text-gold-600">Advaita / Admin</p><h1 class="admin-display text-3xl leading-none text-ink mt-1">@yield('title')</h1></div></div>
            <div class="flex items-center gap-3"><button type="button" class="w-10 h-10 rounded-full border border-ivory-300 bg-white text-plum-700" aria-label="Notifications"><i class="fa-regular fa-bell"></i></button><div class="hidden sm:flex items-center gap-2 pl-3 border-l border-ivory-300"><span class="w-9 h-9 rounded-full bg-plum-700 text-gold-300 flex items-center justify-center admin-display font-bold">A</span><span class="text-sm font-semibold text-ink">Admin</span></div></div>
        </header>
        <main class="p-4 sm:p-8 max-w-[1600px] mx-auto">
            @if(session('success'))<div class="mb-6 p-4 bg-trust-light border border-green-200 text-green-800 rounded-xl flex items-center gap-3" role="status"><i class="fa-solid fa-circle-check"></i>{{ session('success') }}</div>@endif
            @yield('content')
        </main>
    </div>
</div>
<script>
    const adminMenuButton = document.getElementById('adminMenuButton');
    const adminSidebar = document.getElementById('adminSidebar');
    adminMenuButton?.addEventListener('click', () => {
        const isOpen = adminSidebar?.classList.toggle('is-open') ?? false;
        adminMenuButton.setAttribute('aria-expanded', String(isOpen));
        adminMenuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    });
    adminSidebar?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
        adminSidebar.classList.remove('is-open');
        adminMenuButton?.setAttribute('aria-expanded', 'false');
    }));
</script>
</body>
</html>
