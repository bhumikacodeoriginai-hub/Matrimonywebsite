<!-- ================================================
     ADVAITA MATRIMONY - PREMIUM FOOTER
     ================================================ -->
<footer class="bg-gradient-to-b from-plum-900 to-ink text-white relative overflow-hidden">
    <!-- Decorative elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-plum-700/20 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-20 -left-20 w-60 h-60 bg-gold-500/10 rounded-full blur-3xl"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
            
            <!-- Brand Section -->
            <div class="lg:col-span-2">
                <a href="{{ route('home') }}" class="flex items-center gap-3 mb-6">
                    <div class="w-12 h-12 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                        <span class="font-display text-gold-300 font-bold text-xl italic">A</span>
                    </div>
                    <div class="leading-none">
                        <span class="font-display text-2xl font-semibold text-white block">Advaita</span>
                        <span class="text-[9px] tracking-[0.25em] text-gold-400/70 font-semibold uppercase">
                            <span class="lang-en">Matrimony</span>
                            <span class="lang-kn">ಮ್ಯಾಟ್ರಿಮೋನಿ</span>
                        </span>
                    </div>
                </a>
                
                <p class="text-ivory-300 leading-relaxed mb-6 max-w-sm">
                    <span class="lang-en">India's first inclusive matrimonial platform. We believe everyone deserves love, dignity, and a beautiful partnership.</span>
                    <span class="lang-kn">ಭಾರತದ ಮೊದಲ ಸಮಗ್ರ ವಿವಾಹ ವೇದಿಕೆ. ಪ್ರತಿಯೊಬ್ಬರಿಗೂ ಪ್ರೀತಿ, ಘನತೆ ಮತ್ತು ಸುಂದರವಾದ ಸಹಭಾಗಿತ್ವವನ್ನು ಪಡೆಯುವ ಹಕ್ಕಿದೆ ಎಂಬ ನಂಬಿಕೆ.</span>
                </p>

                <!-- Contact Card -->
                <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                    <p class="text-sm font-semibold text-gold-400 mb-3">
                        <span class="lang-en">Need Assistance?</span>
                        <span class="lang-kn">ಸಹಾಯ ಬೇಕೇ?</span>
                    </p>
                    <div class="space-y-2">
                        <a href="tel:+919999999999" class="flex items-center gap-3 text-white hover:text-gold-300 transition-colors">
                            <i class="fas fa-phone text-gold-400 w-5"></i>
                            <span>+91 99999 99999</span>
                        </a>
                        <a href="mailto:support@advaitamatrimony.com" class="flex items-center gap-3 text-white hover:text-gold-300 transition-colors">
                            <i class="fas fa-envelope text-gold-400 w-5"></i>
                            <span>support@advaitamatrimony.com</span>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Discover -->
            <div>
                <h4 class="font-display text-lg font-semibold text-white mb-5">
                    <span class="lang-en">Discover</span>
                    <span class="lang-kn">ಹುಡುಕಿ</span>
                </h4>
                <ul class="space-y-3">
                    <li><a href="{{ route('search') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">Search Profiles</span>
                        <span class="lang-kn">ಪ್ರೊಫೈಲ್‌ಗಳನ್ನು ಹುಡುಕಿ</span>
                    </a></li>
                    <li><a href="{{ route('how-it-works') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">How It Works</span>
                        <span class="lang-kn">ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ</span>
                    </a></li>
                    <li><a href="{{ route('success-stories') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">Success Stories</span>
                        <span class="lang-kn">ಯಶಸ್ಸಿನ ಕಥೆಗಳು</span>
                    </a></li>
                    <li><a href="{{ route('plans') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">Membership Plans</span>
                        <span class="lang-kn">ಸದಸ್ಯತ್ವ ಯೋಜನೆಗಳು</span>
                    </a></li>
                    <li><a href="{{ route('about') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">About Us</span>
                        <span class="lang-kn">ನಮ್ಮ ಬಗ್ಗೆ</span>
                    </a></li>
                    <li><a href="{{ route('contact') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <span class="lang-en">Contact Us</span>
                        <span class="lang-kn">ಸಂಪರ್ಕಿಸಿ</span>
                    </a></li>
                </ul>
            </div>

            <!-- Communities -->
            <div>
                <h4 class="font-display text-lg font-semibold text-white mb-5">
                    <span class="lang-en">Communities</span>
                    <span class="lang-kn">ಸಮುದಾಯಗಳು</span>
                </h4>
                <ul class="space-y-3">
                    <li><a href="{{ route('search') }}?category=general" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-heart text-rose-400 mr-2"></i>
                        <span class="lang-en">General</span>
                        <span class="lang-kn">ಸಾಮಾನ್ಯ</span>
                    </a></li>
                    <li><a href="{{ route('search') }}?category=divyangjan" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-wheelchair text-plum-300 mr-2"></i>
                        <span class="lang-en">Divyangjan</span>
                        <span class="lang-kn">ದಿವ್ಯಾಂಗಜನ</span>
                    </a></li>
                    <li><a href="{{ route('search') }}?category=hearing_speech" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-sign-language text-gold-400 mr-2"></i>
                        <span class="lang-en">Hearing & Speech</span>
                        <span class="lang-kn">ಶ್ರವಣ ಮತ್ತು ಮಾತು</span>
                    </a></li>
                    <li><a href="{{ route('search') }}?category=vitiligo" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-star text-amber-400 mr-2"></i>
                        <span class="lang-en">Vitiligo</span>
                        <span class="lang-kn">ವಿಟಿಲಿಗೊ</span>
                    </a></li>
                </ul>
            </div>

            <!-- Safety -->
            <div>
                <h4 class="font-display text-lg font-semibold text-white mb-5">
                    <span class="lang-en">Safety & Privacy</span>
                    <span class="lang-kn">ಸುರಕ್ಷತೆ ಮತ್ತು ಗೌಪ್ಯತೆ</span>
                </h4>
                <ul class="space-y-3">
                    <li><a href="{{ route('privacy') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-shield-heart text-trust mr-2"></i>
                        <span class="lang-en">Privacy Policy</span>
                        <span class="lang-kn">ಗೌಪ್ಯತಾ ನೀತಿ</span>
                    </a></li>
                    <li><a href="{{ route('terms') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-file-contract text-plum-300 mr-2"></i>
                        <span class="lang-en">Terms of Service</span>
                        <span class="lang-kn">ಸೇವಾ ನಿಯಮಗಳು</span>
                    </a></li>
                    <li><a href="{{ route('refund') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-rotate-left text-gold-400 mr-2"></i>
                        <span class="lang-en">Refund Policy</span>
                        <span class="lang-kn">ಹಣ ಮರಳಿ ನೀತಿ</span>
                    </a></li>
                    <li><a href="{{ route('report-abuse') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-flag text-rose-400 mr-2"></i>
                        <span class="lang-en">Report Abuse</span>
                        <span class="lang-kn">ದುರುಳುತನ ವರದಿ ಮಾಡಿ</span>
                    </a></li>
                    <li><a href="{{ route('faq') }}" class="text-ivory-300 hover:text-gold-300 transition-colors text-sm">
                        <i class="fas fa-circle-question text-plum-300 mr-2"></i>
                        <span class="lang-en">FAQ</span>
                        <span class="lang-kn">ಪ್ರಶ್ನೆಗಳು</span>
                    </a></li>
                </ul>
            </div>

            <!-- Social -->
            <div>
                <h4 class="font-display text-lg font-semibold text-white mb-5">
                    <span class="lang-en">Connect With Us</span>
                    <span class="lang-kn">ನಮ್ಮೊಂದಿಗೆ ಸಂಪರ್ಕ</span>
                </h4>
                <div class="flex flex-wrap gap-3">
                    <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold-500 hover:text-ink transition-all" aria-label="Facebook">
                        <i class="fab fa-facebook-f"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 transition-all" aria-label="Instagram">
                        <i class="fab fa-instagram"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-sky-500 transition-all" aria-label="Twitter">
                        <i class="fab fa-twitter"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-green-500 transition-all" aria-label="WhatsApp">
                        <i class="fab fa-whatsapp"></i>
                    </a>
                    <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all" aria-label="YouTube">
                        <i class="fab fa-youtube"></i>
                    </a>
                </div>

                <!-- Trust Badges -->
                <div class="mt-6 pt-6 border-t border-white/10">
                    <p class="text-xs text-ivory-400 mb-3">
                        <span class="lang-en">Secure Payments</span>
                        <span class="lang-kn">ಸುರಕ್ಷಿತ ಪಾವತಿ</span>
                    </p>
                    <div class="flex items-center gap-3">
                        <span class="text-xs bg-white/10 px-2 py-1 rounded text-ivory-300">Razorpay</span>
                        <span class="text-xs bg-white/10 px-2 py-1 rounded text-ivory-300">PhonePe</span>
                        <span class="text-xs bg-white/10 px-2 py-1 rounded text-ivory-300">UPI</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div class="flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-ivory-400 text-sm">
                    &copy; {{ date('Y') }} <span class="text-white font-semibold">Advaita Matrimony</span>. 
                    <span class="lang-en">All rights reserved.</span>
                    <span class="lang-kn">ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿವೆ.</span>
                </p>
                
                <div class="flex items-center gap-6 text-sm text-ivory-400">
                    <span class="flex items-center gap-2">
                        <i class="fas fa-circle-check text-trust text-xs"></i>
                        <span class="lang-en">100% Verified Profiles</span>
                        <span class="lang-kn">100% ಪರಿಶೀಲಿತ ಪ್ರೊಫೈಲ್‌ಗಳು</span>
                    </span>
                    <span class="hidden md:flex items-center gap-2">
                        <i class="fas fa-lock text-trust text-xs"></i>
                        <span class="lang-en">SSL Secured</span>
                        <span class="lang-kn">SSL ಸುರಕ್ಷಿತ</span>
                    </span>
                </div>
            </div>
        </div>
    </div>
</footer>