<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title') - Advaita Matrimony Admin</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
        .sidebar-active { background: linear-gradient(135deg, #1e40af, #7c3aed); color: white; }
    </style>
</head>
<body class="bg-gray-50">
    <div class="flex h-screen overflow-hidden">
        <!-- Sidebar -->
        <aside class="w-72 bg-white shadow-xl border-r border-gray-100 flex-shrink-0 overflow-y-auto">
            <!-- Logo -->
            <div class="p-6 border-b border-gray-100">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <span class="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                        <h2 class="font-bold text-gray-900">Advaita</h2>
                        <p class="text-xs text-gray-500">Admin Panel</p>
                    </div>
                </div>
            </div>

            <!-- Menu -->
            <nav class="p-4 space-y-1">
                <p class="text-xs text-gray-400 uppercase tracking-wider px-4 py-2">Main</p>

                <a href="/admin" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors {{ request()->is('admin') ? 'sidebar-active' : '' }}">
                    <i class="fas fa-chart-pie w-5 mr-3"></i>Dashboard
                </a>

                <p class="text-xs text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">Users</p>

                <a href="/admin/profiles/pending" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-user-clock w-5 mr-3"></i>Pending Approvals
                    <span class="ml-auto bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">!</span>
                </a>

                <a href="/admin/members" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-users w-5 mr-3"></i>All Members
                </a>

                <a href="/admin/photos/pending" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-images w-5 mr-3"></i>Photo Approvals
                </a>

                <a href="/admin/udid" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-id-card w-5 mr-3"></i>UDID Verification
                </a>

                <a href="/admin/reports" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-flag w-5 mr-3"></i>Reports
                </a>

                <p class="text-xs text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">Finance</p>

                <a href="/admin/packages" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-box w-5 mr-3"></i>Subscription Plans
                </a>

                <a href="/admin/payments" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-rupee-sign w-5 mr-3"></i>Payments
                </a>

                <a href="/admin/analytics" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-chart-bar w-5 mr-3"></i>Analytics
                </a>

                <p class="text-xs text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">Content</p>

                <a href="/admin/banners" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-image w-5 mr-3"></i>Banners
                </a>

                <a href="/admin/pages" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-file-alt w-5 mr-3"></i>Legal Pages
                </a>

                <a href="/admin/success-stories" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-heart w-5 mr-3"></i>Success Stories
                </a>

                <p class="text-xs text-gray-400 uppercase tracking-wider px-4 py-2 mt-4">System</p>

                <a href="/admin/settings" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-cog w-5 mr-3"></i>Settings
                </a>

                <a href="/admin/free-mode/toggle" class="flex items-center px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                    <i class="fas fa-toggle-on w-5 mr-3"></i>Free Mode Toggle
                </a>
            </nav>
        </aside>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Top Bar -->
            <header class="bg-white shadow-sm border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                <h2 class="text-xl font-semibold text-gray-900">@yield('title')</h2>
                <div class="flex items-center space-x-4">
                    <button class="relative p-2 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-bell text-xl"></i>
                        <span class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
                    </button>
                    <div class="flex items-center space-x-3">
                        <div class="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-bold">A</span>
                        </div>
                        <span class="text-sm font-medium text-gray-700">Admin</span>
                    </div>
                </div>
            </header>

            <!-- Page Content -->
            <main class="flex-1 overflow-y-auto p-8">
                @if(session('success'))
                    <div class="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
                        <i class="fas fa-check-circle mr-3"></i>{{ session('success') }}
                    </div>
                @endif

                @yield('content')
            </main>
        </div>
    </div>
</body>
</html>
