<!-- ================================================
     ADVAITA MATRIMONY - PREMIUM NAVBAR
     ================================================ -->
<nav class="fixed top-0 left-0 right-0 z-[900] transition-all duration-500" id="mainNavbar">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
            
            <!-- Logo -->
            <a href="{{ route('home') }}" class="flex items-center gap-3 group">
                <div class="w-12 h-12 rounded-xl gradient-premium flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <span class="font-display text-gold-300 font-bold text-xl italic">A</span>
                </div>
                <div class="leading-none">
                    <span class="font-display text-2xl font-semibold text-ink block">Advaita</span>
                    <span class="text-[9px] tracking-[0.25em] text-plum-700/70 font-semibold uppercase">
                        <span class="lang-en">Matrimony</span>
                        <span class="lang-kn">ಮ್ಯಾಟ್ರಿಮೋನಿ</span>
                    </span>
                </div>
            </a>

            <!-- Desktop Navigation -->
            <div class="hidden lg:flex items-center gap-8">
                <a href="{{ route('home') }}" class="nav-link group">
                    <span class="lang-en">Home</span>
                    <span class="lang-kn">ಮುಖ್ಯ ಪುಟ</span>
                </a>
                <a href="{{ auth()->check() ? route('dashboard.search') : route('register') }}?intent=discover" class="nav-link group">
                    <span class="lang-en">Discover</span>
                        <span class="lang-kn">ಹುಡುಕಿ</span>
                </a>
                <a href="{{ route('how-it-works') }}" class="nav-link group">
                    <span class="lang-en">How It Works</span>
                    <span class="lang-kn">ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ</span>
                </a>
                <a href="{{ route('register') }}?intent=communities" class="nav-link group">
                    <span class="lang-en">Communities</span>
                    <span class="lang-kn">ಸಮುದಾಯಗಳು</span>
                </a>
                <a href="{{ route('success-stories') }}" class="nav-link group">
                    <span class="lang-en">Success Stories</span>
                    <span class="lang-kn">ಯಶಸ್ಸಿನ ಕಥೆಗಳು</span>
                </a>
                <a href="{{ route('plans') }}" class="nav-link group">
                    <span class="lang-en">Plans</span>
                    <span class="lang-kn">ಯೋಜನೆಗಳು</span>
                </a>
            </div>

            <!-- Right Section: Language + Auth -->
            <div class="flex items-center gap-3">
                
                <!-- Language Toggle -->
                <button onclick="toggleLanguage()" 
                        class="lang-toggle flex items-center gap-2 px-3 py-2 rounded-xl border border-plum-200 bg-white/60 hover:bg-white transition-all text-sm font-semibold text-plum-700"
                        aria-label="Switch language">
                    <i class="fas fa-language"></i>
                    <span class="lang-en">ಕನ್ನಡ</span>
                    <span class="lang-kn">English</span>
                </button>

                <!-- Sign In -->
                @auth
                    <a href="{{ route('dashboard') }}" class="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-plum-700 font-semibold hover:bg-plum-50 transition-all">
                        <i class="fas fa-user"></i>
                        <span class="lang-en">Dashboard</span>
                        <span class="lang-kn">ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-plum-700 font-semibold hover:bg-plum-50 transition-all">
                        <span class="lang-en">Sign In</span>
                        <span class="lang-kn">ಲಾಗಿನ್</span>
                    </a>
                @endauth

                <!-- Register CTA -->
                <a href="{{ route('register') }}" 
                   class="btn-premium btn-primary-premium shadow-button hover:shadow-xl">
                    <span class="lang-en">Get Started</span>
                    <span class="lang-kn">ಪ್ರಾರಂಭಿಸಿ</span>
                    <i class="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                </a>

                <!-- Mobile Menu Button -->
                <button onclick="toggleMobileMenu()" 
                        id="menuBtn"
                        class="lg:hidden w-11 h-11 rounded-xl bg-white/70 border border-plum-200 flex items-center justify-center text-ink hover:bg-white transition-all"
                        aria-label="Toggle menu"
                        aria-expanded="false">
                    <i class="fas fa-bars text-lg"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div id="mobileMenu" class="lg:hidden mobile-menu glass rounded-b-2xl mx-4 absolute left-0 right-0 overflow-hidden transition-all duration-400">
        <div class="p-4 space-y-1">
            <a href="{{ route('home') }}" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-home w-6"></i>
                <span class="lang-en">Home</span>
                <span class="lang-kn">ಮುಖ್ಯ ಪುಟ</span>
            </a>
            <a href="{{ auth()->check() ? route('dashboard.search') : route('register') }}?intent=discover" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-search w-6"></i>
                <span class="lang-en">Discover</span>
                <span class="lang-kn">ಹುಡುಕಿ</span>
            </a>
            <a href="{{ route('how-it-works') }}" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-heart w-6"></i>
                <span class="lang-en">How It Works</span>
                <span class="lang-kn">ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ</span>
            </a>
            <a href="{{ route('register') }}?intent=communities" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-users w-6"></i>
                <span class="lang-en">Communities</span>
                <span class="lang-kn">ಸಮುದಾಯಗಳು</span>
            </a>
            <a href="{{ route('success-stories') }}" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-star w-6"></i>
                <span class="lang-en">Success Stories</span>
                <span class="lang-kn">ಯಶಸ್ಸಿನ ಕಥೆಗಳು</span>
            </a>
            <a href="{{ route('plans') }}" onclick="toggleMobileMenu()" class="mobile-nav-link">
                <i class="fas fa-crown w-6"></i>
                <span class="lang-en">Plans</span>
                <span class="lang-kn">ಯೋಜನೆಗಳು</span>
            </a>
            
            <div class="pt-3 mt-3 border-t border-plum-200/50">
                @auth
                    <a href="{{ route('dashboard') }}" class="mobile-nav-link">
                        <i class="fas fa-user-circle w-6"></i>
                        <span class="lang-en">Dashboard</span>
                        <span class="lang-kn">ಡ್ಯಾಶ್‌ಬೋರ್ಡ್</span>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="mobile-nav-link">
                        <i class="fas fa-sign-in-alt w-6"></i>
                        <span class="lang-en">Sign In</span>
                        <span class="lang-kn">ಲಾಗಿನ್</span>
                    </a>
                    <a href="{{ route('register') }}" class="mobile-nav-link text-plum-700">
                        <i class="fas fa-user-plus w-6"></i>
                        <span class="lang-en">Register Free</span>
                        <span class="lang-kn">ಉಚಿತ ನೋಂದಣಿ</span>
                    </a>
                @endauth
            </div>
        </div>
    </div>
</nav>

<style>
    /* Navbar link styles */
    .nav-link {
        position: relative;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--color-ink);
        opacity: 0.7;
        transition: all 0.3s ease;
    }
    
    .nav-link:hover {
        opacity: 1;
        color: var(--color-plum-700);
    }
    
    .nav-link::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -4px;
        width: 0;
        height: 2px;
        background: var(--color-gold-500);
        transition: width 0.3s ease;
    }
    
    .nav-link:hover::after {
        width: 100%;
    }

    /* Mobile nav link */
    .mobile-nav-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.875rem 1rem;
        border-radius: 0.75rem;
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--color-ink);
        opacity: 0.7;
        transition: all 0.2s ease;
    }
    
    .mobile-nav-link:hover {
        background: rgba(84, 35, 76, 0.08);
        opacity: 1;
        color: var(--color-plum-700);
    }

    /* Mobile menu states */
    .mobile-menu {
        max-height: 0;
        opacity: 0;
        transform: translateY(-10px);
    }
    
    .mobile-menu.open {
        max-height: 500px;
        opacity: 1;
        transform: translateY(0);
    }

    /* Navbar scrolled state */
    .navbar-scrolled {
        background: rgba(251, 247, 241, 0.95) !important;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 4px 30px rgba(28, 20, 32, 0.08);
    }

    /* Language toggle */
    .lang-toggle {
        position: relative;
        overflow: hidden;
    }
    
    .lang-toggle:hover {
        border-color: var(--color-plum-300);
    }
</style>