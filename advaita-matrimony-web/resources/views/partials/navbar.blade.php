<nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" id="navbar">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-20">
            <!-- Logo -->
            <a href="/" class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
                    <span class="text-white font-bold text-xl font-playfair">A</span>
                </div>
                <div>
                    <span class="text-2xl font-bold text-gradient font-playfair">Advaita</span>
                    <span class="block text-xs text-gray-500 -mt-1">Matrimony</span>
                </div>
            </a>

            <!-- Desktop Menu -->
            <div class="hidden md:flex items-center space-x-8">
                <a href="/" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">Home</a>
                <a href="/search" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">Search</a>
                <a href="/about" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">About Us</a>
                <a href="/success-stories" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">Success Stories</a>
                <a href="/plans" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">Plans</a>
                <a href="/contact" class="text-gray-700 hover:text-primary-600 font-medium transition-colors">Contact</a>
            </div>

            <!-- Auth Buttons -->
            <div class="hidden md:flex items-center space-x-4">
                <a href="/login" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                    Sign In
                </a>
                <a href="/register" class="px-6 py-2.5 gradient-bg text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                    Register Free
                </a>
            </div>

            <!-- Mobile Menu Button -->
            <button class="md:hidden text-gray-700" id="mobileMenuBtn">
                <i class="fas fa-bars text-2xl"></i>
            </button>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div class="md:hidden hidden bg-white shadow-2xl rounded-b-3xl" id="mobileMenu">
        <div class="px-4 py-6 space-y-4">
            <a href="/" class="block py-2 text-gray-700 font-medium">Home</a>
            <a href="/search" class="block py-2 text-gray-700 font-medium">Search</a>
            <a href="/about" class="block py-2 text-gray-700 font-medium">About Us</a>
            <a href="/success-stories" class="block py-2 text-gray-700 font-medium">Success Stories</a>
            <a href="/plans" class="block py-2 text-gray-700 font-medium">Plans</a>
            <div class="pt-4 border-t flex space-x-4">
                <a href="/login" class="flex-1 text-center py-2.5 border-2 border-primary-600 text-primary-600 rounded-full font-semibold">Sign In</a>
                <a href="/register" class="flex-1 text-center py-2.5 gradient-bg text-white rounded-full font-semibold">Register</a>
            </div>
        </div>
    </div>
</nav>

<script>
    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/95', 'backdrop-blur-lg', 'shadow-lg');
        } else {
            navbar.classList.remove('bg-white/95', 'backdrop-blur-lg', 'shadow-lg');
        }
    });

    // Mobile menu toggle
    document.getElementById('mobileMenuBtn').addEventListener('click', () => {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });
</script>
