@extends('admin.layouts.admin')

@section('title', 'Admin Dashboard')

@section('content')
<div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p class="text-gray-600 mt-1">Welcome back, Admin. Here's what's happening on Advaita Matrimony.</p>
        </div>
        <div class="flex space-x-3">
            <button class="px-4 py-2 bg-primary-50 text-primary-700 rounded-lg font-medium hover:bg-primary-100">
                <i class="fas fa-download mr-2"></i>Export Report
            </button>
            <a href="/admin/profiles/pending" class="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 relative">
                <i class="fas fa-user-clock mr-2"></i>Pending Approvals
                @if($stats['pending_approval'] > 0)
                    <span class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{{ $stats['pending_approval'] }}</span>
                @endif
            </a>
        </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Total Users</p>
                    <p class="text-3xl font-bold text-gray-900 mt-1">{{ number_format($stats['total_users']) }}</p>
                </div>
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-users text-blue-600 text-xl"></i>
                </div>
            </div>
            <p class="text-xs text-green-600 mt-3"><i class="fas fa-arrow-up mr-1"></i>+{{ $stats['today_registrations'] }} today</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Pending Approval</p>
                    <p class="text-3xl font-bold text-orange-600 mt-1">{{ $stats['pending_approval'] }}</p>
                </div>
                <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-clock text-orange-600 text-xl"></i>
                </div>
            </div>
            <a href="/admin/profiles/pending" class="text-xs text-primary-600 mt-3 inline-block hover:underline">Review now →</a>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Premium Members</p>
                    <p class="text-3xl font-bold text-purple-600 mt-1">{{ $stats['premium_users'] }}</p>
                </div>
                <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-crown text-purple-600 text-xl"></i>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Monthly Revenue</p>
                    <p class="text-3xl font-bold text-green-600 mt-1">₹{{ number_format($stats['monthly_revenue']) }}</p>
                </div>
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-rupee-sign text-green-600 text-xl"></i>
                </div>
            </div>
            <p class="text-xs text-gray-500 mt-3">Total: ₹{{ number_format($stats['total_revenue']) }}</p>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-500">Successful Matches</p>
                    <p class="text-3xl font-bold text-rose-600 mt-1">{{ $stats['total_matches'] }}</p>
                </div>
                <div class="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                    <i class="fas fa-heart text-rose-600 text-xl"></i>
                </div>
            </div>
        </div>
    </div>

    <!-- Category Breakdown -->
    <div class="grid md:grid-cols-4 gap-6">
        <div class="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-6 text-white">
            <i class="fas fa-heart text-2xl mb-3 opacity-80"></i>
            <p class="text-sm opacity-80">General</p>
            <p class="text-2xl font-bold">{{ $stats['category_breakdown']['general'] }}</p>
        </div>
        <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
            <i class="fas fa-wheelchair text-2xl mb-3 opacity-80"></i>
            <p class="text-sm opacity-80">Divyangjan</p>
            <p class="text-2xl font-bold">{{ $stats['category_breakdown']['physically_challenged'] }}</p>
        </div>
        <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
            <i class="fas fa-sign-language text-2xl mb-3 opacity-80"></i>
            <p class="text-sm opacity-80">Hearing & Speech</p>
            <p class="text-2xl font-bold">{{ $stats['category_breakdown']['hearing_speech'] }}</p>
        </div>
        <div class="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
            <i class="fas fa-star text-2xl mb-3 opacity-80"></i>
            <p class="text-sm opacity-80">Vitiligo</p>
            <p class="text-2xl font-bold">{{ $stats['category_breakdown']['vitiligo'] }}</p>
        </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid lg:grid-cols-2 gap-8">
        <!-- Recent Registrations -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-bold text-gray-900"><i class="fas fa-user-plus mr-2 text-primary-600"></i>Recent Registrations</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @foreach($recentRegistrations as $user)
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-gray-400"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 text-sm">{{ $user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $user->unique_id }} • {{ $user->profile?->category_display_name ?? 'General' }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <span class="px-2 py-1 text-xs rounded-full {{ $user->profile_status === 'pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700' }}">
                                {{ ucfirst($user->profile_status) }}
                            </span>
                            <p class="text-xs text-gray-400 mt-1">{{ $user->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>

        <!-- Recent Payments -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div class="p-6 border-b border-gray-100">
                <h3 class="text-lg font-bold text-gray-900"><i class="fas fa-rupee-sign mr-2 text-green-600"></i>Recent Payments</h3>
            </div>
            <div class="p-6">
                <div class="space-y-4">
                    @foreach($recentPayments as $payment)
                    <div class="flex items-center justify-between py-2">
                        <div class="flex items-center space-x-3">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-check text-green-600"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 text-sm">{{ $payment->user->name }}</p>
                                <p class="text-xs text-gray-500">{{ $payment->package?->name ?? 'N/A' }} • {{ ucfirst($payment->payment_gateway) }}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="font-bold text-green-600">₹{{ number_format($payment->amount) }}</p>
                            <p class="text-xs text-gray-400">{{ $payment->created_at->diffForHumans() }}</p>
                        </div>
                    </div>
                    @endforeach
                </div>
            </div>
        </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 class="text-lg font-bold text-gray-900 mb-4"><i class="fas fa-bolt mr-2 text-gold-500"></i>Quick Actions</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <a href="/admin/profiles/pending" class="flex flex-col items-center p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                <i class="fas fa-user-check text-xl text-orange-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Approve Profiles</span>
            </a>
            <a href="/admin/photos/pending" class="flex flex-col items-center p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                <i class="fas fa-image text-xl text-blue-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Approve Photos</span>
            </a>
            <a href="/admin/packages" class="flex flex-col items-center p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors">
                <i class="fas fa-box text-xl text-purple-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Manage Plans</span>
            </a>
            <a href="/admin/banners" class="flex flex-col items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                <i class="fas fa-image text-xl text-green-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Edit Banners</span>
            </a>
            <a href="/admin/pages" class="flex flex-col items-center p-4 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors">
                <i class="fas fa-file-alt text-xl text-rose-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Legal Pages</span>
            </a>
            <a href="/admin/settings" class="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <i class="fas fa-cog text-xl text-gray-600 mb-2"></i>
                <span class="text-xs font-medium text-gray-700">Settings</span>
            </a>
        </div>
    </div>
</div>
@endsection
