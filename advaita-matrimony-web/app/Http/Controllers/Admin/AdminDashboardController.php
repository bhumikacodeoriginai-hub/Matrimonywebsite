<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Interest;
use App\Models\Photo;
use App\Models\SubscriptionPackage;
use App\Models\Banner;
use App\Models\StaticPage;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    /**
     * Admin Dashboard - Overview
     */
    public function index()
    {
        $stats = [
            'total_users' => User::where('role', 'user')->count(),
            'pending_approval' => User::where('profile_status', 'pending')->count(),
            'approved_users' => User::where('profile_status', 'approved')->count(),
            'premium_users' => User::where('is_premium', true)->count(),
            'today_registrations' => User::whereDate('created_at', today())->count(),
            'total_revenue' => Payment::where('status', 'completed')->sum('amount'),
            'monthly_revenue' => Payment::where('status', 'completed')
                ->whereMonth('created_at', now()->month)->sum('amount'),
            'pending_photos' => Photo::where('status', 'pending')->count(),
            'total_matches' => Interest::where('status', 'accepted')->count(),
            'active_today' => User::whereDate('last_active_at', today())->count(),
            'category_breakdown' => [
                'general' => User::whereHas('profile', fn($q) => $q->where('profile_category', 'general'))->count(),
                'physically_challenged' => User::whereHas('profile', fn($q) => $q->where('profile_category', 'physically_challenged'))->count(),
                'hearing_speech' => User::whereHas('profile', fn($q) => $q->where('profile_category', 'hearing_speech_impaired'))->count(),
                'vitiligo' => User::whereHas('profile', fn($q) => $q->where('profile_category', 'vitiligo_skin_condition'))->count(),
            ],
        ];

        $recentRegistrations = User::with('profile')
            ->where('role', 'user')
            ->latest()
            ->limit(10)
            ->get();

        $recentPayments = Payment::with(['user', 'package'])
            ->where('status', 'completed')
            ->latest()
            ->limit(10)
            ->get();

        return view('admin.dashboard', compact('stats', 'recentRegistrations', 'recentPayments'));
    }

    /**
     * Profile Approvals
     */
    public function pendingProfiles(Request $request)
    {
        $profiles = User::with('profile', 'photos')
            ->where('profile_status', 'pending')
            ->orderBy('created_at')
            ->paginate(20);

        return view('admin.profiles.pending', compact('profiles'));
    }

    /**
     * Approve a profile
     */
    public function approveProfile(int $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['profile_status' => 'approved']);

        // TODO: Send notification to user

        return back()->with('success', "Profile {$user->unique_id} approved successfully!");
    }

    /**
     * Reject a profile
     */
    public function rejectProfile(Request $request, int $userId)
    {
        $user = User::findOrFail($userId);
        $user->update(['profile_status' => 'rejected']);

        // TODO: Send notification with rejection reason

        return back()->with('success', "Profile {$user->unique_id} rejected.");
    }

    /**
     * All Members Management
     */
    public function members(Request $request)
    {
        $query = User::with('profile')->where('role', 'user');

        if ($request->status) {
            $query->where('profile_status', $request->status);
        }
        if ($request->category) {
            $query->whereHas('profile', fn($q) => $q->where('profile_category', $request->category));
        }
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%")
                  ->orWhere('unique_id', 'like', "%{$request->search}%");
            });
        }

        $members = $query->latest()->paginate(25);

        return view('admin.members.index', compact('members'));
    }

    /**
     * View member details
     */
    public function memberDetail(int $userId)
    {
        $user = User::with(['profile', 'photos', 'payments', 'subscriptions.package'])->findOrFail($userId);
        return view('admin.members.detail', compact('user'));
    }

    /**
     * Suspend/Unsuspend user
     */
    public function toggleSuspend(int $userId)
    {
        $user = User::findOrFail($userId);
        $newStatus = $user->profile_status === 'suspended' ? 'approved' : 'suspended';
        $user->update(['profile_status' => $newStatus]);

        return back()->with('success', "User {$newStatus} successfully.");
    }

    /**
     * Photo Approvals
     */
    public function pendingPhotos()
    {
        $photos = Photo::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->paginate(30);

        return view('admin.photos.pending', compact('photos'));
    }

    /**
     * Approve/Reject photo
     */
    public function updatePhotoStatus(Request $request, int $photoId)
    {
        $photo = Photo::findOrFail($photoId);
        $photo->update(['status' => $request->status]);

        return back()->with('success', "Photo {$request->status}.");
    }

    /**
     * Subscription Packages Management
     */
    public function packages()
    {
        $packages = SubscriptionPackage::orderBy('sort_order')->get();
        return view('admin.packages.index', compact('packages'));
    }

    /**
     * Create/Update Package
     */
    public function savePackage(Request $request, ?int $packageId = null)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'discounted_price' => 'nullable|numeric|min:0',
            'duration_days' => 'required|integer|min:1',
            'profile_views_limit' => 'integer',
            'contacts_limit' => 'integer',
            'messages_limit' => 'integer',
            'interest_sends_limit' => 'integer',
            'description' => 'nullable|string',
        ]);

        $data['slug'] = \Str::slug($data['name']);

        if ($packageId) {
            SubscriptionPackage::findOrFail($packageId)->update($data);
        } else {
            SubscriptionPackage::create($data);
        }

        return back()->with('success', 'Package saved successfully!');
    }

    /**
     * Banner Management
     */
    public function banners()
    {
        $banners = \App\Models\Banner::orderBy('sort_order')->get();
        return view('admin.banners.index', compact('banners'));
    }

    /**
     * Static Pages Management (Terms, Privacy, Refund)
     */
    public function staticPages()
    {
        $pages = \App\Models\StaticPage::all();
        return view('admin.pages.index', compact('pages'));
    }

    public function editStaticPage(string $slug)
    {
        $page = \App\Models\StaticPage::where('slug', $slug)->firstOrFail();
        return view('admin.pages.edit', compact('page'));
    }

    public function updateStaticPage(Request $request, string $slug)
    {
        $page = \App\Models\StaticPage::where('slug', $slug)->firstOrFail();
        $page->update($request->only(['title', 'content']));
        return back()->with('success', 'Page updated successfully!');
    }

    /**
     * Site Settings
     */
    public function settings()
    {
        $settings = \App\Models\SiteSetting::all()->groupBy('group');
        return view('admin.settings', compact('settings'));
    }

    public function updateSettings(Request $request)
    {
        foreach ($request->settings as $key => $value) {
            \App\Models\SiteSetting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
        return back()->with('success', 'Settings updated!');
    }

    /**
     * UDID Verification Management
     */
    public function udidVerifications()
    {
        $profiles = \App\Models\Profile::where('udid_verification_status', 'pending')
            ->with('user')
            ->paginate(20);

        return view('admin.udid.index', compact('profiles'));
    }

    public function updateUdidStatus(Request $request, int $profileId)
    {
        $profile = \App\Models\Profile::findOrFail($profileId);
        $profile->update(['udid_verification_status' => $request->status]);

        return back()->with('success', 'UDID status updated.');
    }

    /**
     * Reports Management
     */
    public function reports()
    {
        $reports = \App\Models\Report::with(['reporter', 'reported'])
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return view('admin.reports.index', compact('reports'));
    }

    /**
     * Revenue Analytics
     */
    public function analytics()
    {
        $monthlyRevenue = Payment::where('status', 'completed')
            ->select(DB::raw('MONTH(created_at) as month'), DB::raw('SUM(amount) as total'))
            ->whereYear('created_at', now()->year)
            ->groupBy('month')
            ->get();

        $registrationTrend = User::where('role', 'user')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->get();

        return view('admin.analytics', compact('monthlyRevenue', 'registrationTrend'));
    }

    /**
     * Toggle Free Mode
     */
    public function toggleFreeMode()
    {
        $setting = \App\Models\SiteSetting::firstOrCreate(
            ['key' => 'free_mode_enabled'],
            ['value' => 'false', 'group' => 'general']
        );

        $newValue = $setting->value === 'true' ? 'false' : 'true';
        $setting->update(['value' => $newValue]);

        return back()->with('success', 'Free mode ' . ($newValue === 'true' ? 'enabled' : 'disabled'));
    }
}
