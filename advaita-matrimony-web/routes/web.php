<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes - Advaita Matrimony
|--------------------------------------------------------------------------
*/

// ===================== PUBLIC PAGES =====================
Route::get('/', fn() => view('pages.home'))->name('home');
Route::get('/about', fn() => view('pages.about'))->name('about');
Route::get('/how-it-works', fn() => view('pages.how-it-works'))->name('how-it-works');
Route::get('/success-stories', fn() => view('pages.success-stories'))->name('success-stories');
Route::get('/plans', fn() => view('pages.plans'))->name('plans');
Route::get('/contact', fn() => view('pages.contact'))->name('contact');

// Legal Pages
Route::get('/terms', fn() => view('pages.legal', ['slug' => 'terms-conditions']))->name('terms');
Route::get('/privacy', fn() => view('pages.legal', ['slug' => 'privacy-policy']))->name('privacy');
Route::get('/refund', fn() => view('pages.legal', ['slug' => 'refund-policy']))->name('refund');

// ===================== AUTH ROUTES =====================
Route::get('/login', fn() => view('auth.login'))->name('login');
Route::get('/register', fn() => view('auth.register'))->name('register');

// ===================== USER DASHBOARD (Authenticated) =====================
Route::middleware(['auth'])->prefix('dashboard')->group(function () {
    Route::get('/', fn() => view('dashboard.index'))->name('dashboard');
    Route::get('/profile', fn() => view('dashboard.profile'))->name('dashboard.profile');
    Route::get('/search', fn() => view('dashboard.search'))->name('dashboard.search');
    Route::get('/matches', fn() => view('dashboard.matches'))->name('dashboard.matches');
    Route::get('/interests', fn() => view('dashboard.interests'))->name('dashboard.interests');
    Route::get('/chat', fn() => view('dashboard.chat'))->name('dashboard.chat');
    Route::get('/shortlist', fn() => view('dashboard.shortlist'))->name('dashboard.shortlist');
    Route::get('/subscription', fn() => view('dashboard.subscription'))->name('dashboard.subscription');
    Route::get('/settings', fn() => view('dashboard.settings'))->name('dashboard.settings');
});

// ===================== ADMIN ROUTES =====================
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    // Profile Management
    Route::get('/profiles/pending', [AdminDashboardController::class, 'pendingProfiles'])->name('admin.profiles.pending');
    Route::post('/profiles/{userId}/approve', [AdminDashboardController::class, 'approveProfile'])->name('admin.profiles.approve');
    Route::post('/profiles/{userId}/reject', [AdminDashboardController::class, 'rejectProfile'])->name('admin.profiles.reject');

    // Members
    Route::get('/members', [AdminDashboardController::class, 'members'])->name('admin.members');
    Route::get('/members/{userId}', [AdminDashboardController::class, 'memberDetail'])->name('admin.members.detail');
    Route::post('/members/{userId}/toggle-suspend', [AdminDashboardController::class, 'toggleSuspend'])->name('admin.members.suspend');

    // Photos
    Route::get('/photos/pending', [AdminDashboardController::class, 'pendingPhotos'])->name('admin.photos.pending');
    Route::post('/photos/{photoId}/status', [AdminDashboardController::class, 'updatePhotoStatus'])->name('admin.photos.status');

    // Packages
    Route::get('/packages', [AdminDashboardController::class, 'packages'])->name('admin.packages');
    Route::post('/packages/{packageId?}', [AdminDashboardController::class, 'savePackage'])->name('admin.packages.save');

    // Banners
    Route::get('/banners', [AdminDashboardController::class, 'banners'])->name('admin.banners');

    // Static Pages
    Route::get('/pages', [AdminDashboardController::class, 'staticPages'])->name('admin.pages');
    Route::get('/pages/{slug}', [AdminDashboardController::class, 'editStaticPage'])->name('admin.pages.edit');
    Route::put('/pages/{slug}', [AdminDashboardController::class, 'updateStaticPage'])->name('admin.pages.update');

    // Settings
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('admin.settings');
    Route::post('/settings', [AdminDashboardController::class, 'updateSettings'])->name('admin.settings.update');

    // UDID Verification
    Route::get('/udid', [AdminDashboardController::class, 'udidVerifications'])->name('admin.udid');
    Route::post('/udid/{profileId}/status', [AdminDashboardController::class, 'updateUdidStatus'])->name('admin.udid.status');

    // Reports
    Route::get('/reports', [AdminDashboardController::class, 'reports'])->name('admin.reports');

    // Analytics
    Route::get('/analytics', [AdminDashboardController::class, 'analytics'])->name('admin.analytics');

    // Free Mode Toggle
    Route::get('/free-mode/toggle', [AdminDashboardController::class, 'toggleFreeMode'])->name('admin.free-mode');
});

// Payment Callbacks
Route::post('/payment/phonepe/callback', fn() => 'PhonePe Callback Handler')->name('payment.phonepe.callback');
Route::post('/payment/phonepe/webhook', fn() => 'PhonePe Webhook Handler')->name('payment.phonepe.webhook');
