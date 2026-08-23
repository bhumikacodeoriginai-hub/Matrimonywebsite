<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Advaita Matrimony - India's most inclusive matrimonial platform for everyone, including Divyangjan, Hearing & Speech Impaired, and Vitiligo communities">
    <meta name="keywords" content="matrimony, disabled matrimony, divyangjan marriage, vitiligo matrimony, deaf mute marriage, inclusive matrimony India">
    <meta property="og:title" content="Advaita Matrimony - Find Your Perfect Match">
    <meta property="og:description" content="India's first truly inclusive matrimonial platform">
    <meta property="og:type" content="website">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    <title>@yield('title', 'Advaita Matrimony - Find Your Perfect Match')</title>

    <!-- Fonts: Cormorant Garamond (display) + Plus Jakarta Sans (body) + Noto Sans Kannada -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        ink: '#1C1420',
                        plum: {
                            900: '#2A1526',
                            800: '#3D1937',
                            700: '#54234C',
                            600: '#6D2F63',
                            500: '#8B4078',
                            400: '#A85A94',
                            300: '#C77BB0',
                            200: '#E4A9CD',
                            100: '#F2D4E8',
                            50: '#FAF2F7',
                        },
                        gold: {
                            600: '#9A7A3D',
                            500: '#C19A5B',
                            400: '#D4AF7A',
                            300: '#E7CFA1',
                            200: '#F2E4C9',
                            100: '#FAF3E3',
                            50: '#FDFBF5',
                        },
                        rose: {
                            600: '#B84568',
                            500: '#D4577E',
                            400: '#E8688F',
                            300: '#F08BA8',
                            200: '#F5ADC3',
                            100: '#FAD2DE',
                            50: '#FDF0F4',
                        },
                        ivory: {
                            900: '#2A2428',
                            800: '#3D363A',
                            700: '#524A4E',
                            600: '#756B72',
                            500: '#A29A9F',
                            400: '#CAC5C9',
                            300: '#E9DDD3',
                            200: '#F2E9DD',
                            100: '#F7F2ED',
                        },
                        trust: '#4C9B78',
                    },
                    fontFamily: {
                        display: ['Cormorant Garamond', 'Georgia', 'serif'],
                        body: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                        kn: ['Noto Sans Kannada', 'Plus Jakarta Sans', 'sans-serif'],
                    },
                    animation: {
                        'float': 'float 6s ease-in-out infinite',
                        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                        'fade-in': 'fadeIn 0.6s ease-out forwards',
                        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
                        'shimmer': 'shimmer 6s linear infinite',
                    },
                    keyframes: {
                        float: {
                            '0%, 100%': { transform: 'translateY(0)' },
                            '50%': { transform: 'translateY(-12px)' },
                        },
                        'pulse-soft': {
                            '0%, 100%': { opacity: '1' },
                            '50%': { opacity: '0.7' },
                        },
                        fadeIn: {
                            '0%': { opacity: '0' },
                            '100%': { opacity: '1' },
                        },
                        fadeInUp: {
                            '0%': { opacity: '0', transform: 'translateY(30px)' },
                            '100%': { opacity: '1', transform: 'translateY(0)' },
                        },
                        shimmer: {
                            '0%': { backgroundPosition: '200% center' },
                            '100%': { backgroundPosition: '-200% center' },
                        },
                    },
                    boxShadow: {
                        'card': '0 10px 40px -15px rgba(28, 20, 32, 0.15)',
                        'card-hover': '0 25px 50px -20px rgba(28, 20, 32, 0.25)',
                        'button': '0 4px 14px -3px rgba(84, 35, 76, 0.25)',
                    },
                    borderRadius: {
                        'card': '1.5rem',
                    },
                }
            }
        }
    </script>

    <!-- Design Tokens CSS -->
    <link rel="stylesheet" href="{{ asset('css/design-tokens.css') }}">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

    <!-- AOS Animation Library -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css">

    <!-- Additional Premium Styles -->
    <style>
        :root {
            --color-ink: #1C1420;
            --color-plum-700: #54234C;
            --color-gold-500: #C19A5B;
            --color-rose-500: #D4577E;
            --color-ivory: #FBF7F1;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--color-ivory);
            color: var(--color-ink);
        }

        /* Display typography */
        h1, h2, h3, h4, .display {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-weight: 400;
            letter-spacing: -0.02em;
        }

        /* Premium gradient backgrounds (sparingly) */
        .gradient-premium {
            background: linear-gradient(135deg, var(--color-plum-800) 0%, var(--color-plum-700) 50%, #3D1937 100%);
        }

        .gradient-hero {
            background: linear-gradient(135deg, rgba(42, 21, 38, 0.92) 0%, rgba(84, 35, 76, 0.88) 100%);
        }

        .gradient-gold {
            background: linear-gradient(135deg, var(--color-gold-400) 0%, var(--color-gold-500) 100%);
        }

        /* Glass morphism (sparingly) */
        .glass {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.7);
        }

        /* Gradient text */
        .text-shimmer {
            background: linear-gradient(100deg, var(--color-plum-700), var(--color-rose-500) 40%, var(--color-gold-500) 72%, var(--color-plum-700));
            -webkit-background-clip: text;
            background-clip: text;
            -webkit-text-fill-color: transparent;
            background-size: 220% auto;
            animation: shimmer 6s linear infinite;
        }

        /* Card hover effects */
        .card-premium {
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .card-premium:hover {
            transform: translateY(-6px);
            box-shadow: 0 25px 50px -20px rgba(28, 20, 32, 0.25);
        }

        /* Profile card image overlay */
        .profile-card-img-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(to top, rgba(28, 20, 32, 0.85) 0%, transparent 50%);
        }

        /* Navbar scroll behavior */
        .navbar-scrolled {
            background: rgba(251, 247, 241, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            box-shadow: 0 4px 30px rgba(28, 20, 32, 0.08);
        }

        /* Language toggle */
        .lang-toggle {
            position: relative;
            overflow: hidden;
        }

        .lang-toggle input {
            position: absolute;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .lang-toggle span {
            display: inline-block;
            transition: all 0.3s;
        }

        /* Aurora background effect */
        .aurora-bg {
            position: fixed;
            inset: -20%;
            z-index: -2;
            filter: blur(70px) saturate(1.2);
            opacity: 0.9;
            pointer-events: none;
        }

        .aurora-bg span {
            position: absolute;
            border-radius: 50%;
            mix-blend-mode: multiply;
            animation: drift 22s ease-in-out infinite;
        }

        .aurora-1 {
            width: 52vw;
            height: 52vw;
            left: -6vw;
            top: -8vw;
            background: radial-gradient(circle, rgba(212, 87, 126, 0.35), transparent 62%);
        }

        .aurora-2 {
            width: 46vw;
            height: 46vw;
            right: -6vw;
            top: 2vw;
            background: radial-gradient(circle, rgba(193, 154, 91, 0.45), transparent 62%);
            animation-delay: -6s;
        }

        .aurora-3 {
            width: 50vw;
            height: 50vw;
            left: 22vw;
            bottom: -14vw;
            background: radial-gradient(circle, rgba(84, 35, 76, 0.35), transparent 62%);
            animation-delay: -12s;
        }

        @keyframes drift {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(4vw, 3vw) scale(1.08); }
            66% { transform: translate(-3vw, 2vw) scale(0.95); }
        }

        /* Grain texture overlay */
        .grain-overlay {
            position: fixed;
            inset: 0;
            z-index: -1;
            pointer-events: none;
            opacity: 0.04;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        /* Section headings */
        .section-heading {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 2.5rem;
            font-weight: 400;
            line-height: 1.2;
            color: var(--color-ink);
        }

        .section-subheading {
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--color-plum-700);
            opacity: 0.7;
        }

        /* Button styles */
        .btn-premium {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.875rem 1.75rem;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.875rem;
            font-weight: 600;
            border-radius: 1rem;
            border: none;
            cursor: pointer;
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .btn-primary-premium {
            background: linear-gradient(135deg, #2A1526 0%, #54234C 100%);
            color: #FBF7F1;
            box-shadow: 0 10px 30px -10px rgba(42, 21, 38, 0.4);
        }

        .btn-primary-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 15px 40px -12px rgba(42, 21, 38, 0.5);
        }

        .btn-gold-premium {
            background: linear-gradient(135deg, #D4AF7A 0%, #C19A5B 100%);
            color: #1C1420;
            box-shadow: 0 4px 14px -3px rgba(193, 154, 91, 0.35);
        }

        .btn-gold-premium:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px -5px rgba(193, 154, 91, 0.4);
        }

        .btn-outline-premium {
            background: transparent;
            color: #54234C;
            border: 1.5px solid #C77BB0;
        }

        .btn-outline-premium:hover {
            background: #FAF2F7;
            border-color: #6D2F63;
        }

        /* Language support */
        .lang-kn .lang-en { display: none !important; }
        .lang-en .lang-kn { display: none !important; }

        /* Responsive adjustments */
        @media (max-width: 768px) {
            .section-heading {
                font-size: 2rem;
            }
        }

        /* Scroll animations */
        .reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal.visible {
            opacity: 1;
            transform: none;
        }

        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            .reveal {
                opacity: 1;
                transform: none;
            }
        }
    </style>

    @stack('styles')
</head>
<body class="lang-{{ app()->getLocale() == 'kn' ? 'kn' : 'en' }} antialiased">
    <!-- Aurora Background Effects -->
    <div class="aurora-bg" aria-hidden="true">
        <span class="aurora-1"></span>
        <span class="aurora-2"></span>
        <span class="aurora-3"></span>
    </div>
    <div class="grain-overlay" aria-hidden="true"></div>

    <!-- Navigation -->
    @include('partials.navbar')

    <!-- Main Content -->
    <main>
        @yield('content')
    </main>

    <!-- Footer -->
    @include('partials.footer')

    <!-- Scripts -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"></script>
    <script>
        // Initialize AOS animations
        AOS.init({
            duration: 800,
            easing: 'ease-out-cubic',
            once: true,
            offset: 50
        });

        // Navbar scroll behavior
        const navbar = document.getElementById('mainNavbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('navbar-scrolled');
                } else {
                    navbar.classList.remove('navbar-scrolled');
                }
            });
        }

        // Language toggle
        function toggleLanguage() {
            const body = document.body;
            const currentLang = body.classList.contains('lang-kn') ? 'kn' : 'en';
            const newLang = currentLang === 'kn' ? 'en' : 'kn';
            
            body.classList.remove('lang-' + currentLang);
            body.classList.add('lang-' + newLang);
            
            // Save preference
            localStorage.setItem('preferred-language', newLang);
            
            // Reload to apply (or use AJAX for dynamic content)
            // window.location.reload(); 
        }

        // Mobile menu toggle
        function toggleMobileMenu() {
            const menu = document.getElementById('mobileMenu');
            menu.classList.toggle('open');
        }

        // Load saved language preference
        document.addEventListener('DOMContentLoaded', () => {
            const savedLang = localStorage.getItem('preferred-language');
            if (savedLang && savedLang !== '{{ app()->getLocale() }}') {
                document.body.classList.remove('lang-en', 'lang-kn');
                document.body.classList.add('lang-' + savedLang);
            }
        });
    </script>
    @stack('scripts')
</body>
</html>