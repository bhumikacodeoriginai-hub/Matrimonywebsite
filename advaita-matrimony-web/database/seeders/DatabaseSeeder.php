<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\SubscriptionPackage;
use App\Models\StaticPage;
use App\Models\SiteSetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin User
        User::create([
            'name' => 'Admin',
            'email' => 'admin@advaitamatrimony.com',
            'phone' => '9999999999',
            'password' => Hash::make('Admin@123'),
            'gender' => 'male',
            'date_of_birth' => '1990-01-01',
            'role' => 'admin',
            'profile_status' => 'approved',
            'phone_verified_at' => now(),
            'email_verified_at' => now(),
        ]);

        // Create Subscription Packages
        SubscriptionPackage::create([
            'name' => 'Silver',
            'slug' => 'silver',
            'description' => 'Perfect for starting your search',
            'price' => 1999,
            'discounted_price' => 999,
            'duration_days' => 90,
            'profile_views_limit' => 50,
            'contacts_limit' => 20,
            'messages_limit' => 100,
            'interest_sends_limit' => 30,
            'photo_access' => true,
            'advanced_search' => true,
            'chat_enabled' => true,
            'video_call_enabled' => false,
            'profile_highlight' => false,
            'priority_support' => false,
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 1,
            'features_list' => ['View 50 Profiles', 'Send 30 Interests', 'Chat with Matches', 'View Contact Details', 'Advanced Search'],
        ]);

        SubscriptionPackage::create([
            'name' => 'Gold',
            'slug' => 'gold',
            'description' => 'Most popular choice for serious seekers',
            'price' => 3999,
            'discounted_price' => 1999,
            'duration_days' => 180,
            'profile_views_limit' => -1,
            'contacts_limit' => -1,
            'messages_limit' => -1,
            'interest_sends_limit' => 100,
            'photo_access' => true,
            'advanced_search' => true,
            'chat_enabled' => true,
            'video_call_enabled' => false,
            'profile_highlight' => true,
            'priority_support' => true,
            'is_popular' => true,
            'is_active' => true,
            'sort_order' => 2,
            'features_list' => ['Unlimited Profile Views', 'Send 100 Interests', 'Unlimited Chat', 'View All Contacts', 'Profile Highlight', 'Priority Support'],
        ]);

        SubscriptionPackage::create([
            'name' => 'Platinum',
            'slug' => 'platinum',
            'description' => 'Ultimate experience with dedicated relationship manager',
            'price' => 5999,
            'discounted_price' => 2999,
            'duration_days' => 365,
            'profile_views_limit' => -1,
            'contacts_limit' => -1,
            'messages_limit' => -1,
            'interest_sends_limit' => -1,
            'photo_access' => true,
            'advanced_search' => true,
            'chat_enabled' => true,
            'video_call_enabled' => true,
            'profile_highlight' => true,
            'priority_support' => true,
            'is_popular' => false,
            'is_active' => true,
            'sort_order' => 3,
            'features_list' => ['Everything in Gold', 'Unlimited Interests', 'Video Call Feature', 'Profile Boost (2x)', 'Dedicated Relationship Manager', 'VIP Badge'],
        ]);

        // Create Static Pages
        StaticPage::create([
            'title' => 'Terms & Conditions',
            'slug' => 'terms-conditions',
            'content' => '<h2>Terms & Conditions</h2><p>Welcome to Advaita Matrimony. By using our platform, you agree to the following terms...</p>',
        ]);

        StaticPage::create([
            'title' => 'Privacy Policy',
            'slug' => 'privacy-policy',
            'content' => '<h2>Privacy Policy</h2><p>At Advaita Matrimony, we take your privacy seriously. This policy explains how we collect, use, and protect your personal information...</p>',
        ]);

        StaticPage::create([
            'title' => 'Refund Policy',
            'slug' => 'refund-policy',
            'content' => '<h2>Refund Policy</h2><p>Advaita Matrimony offers refunds under specific conditions...</p>',
        ]);

        StaticPage::create([
            'title' => 'About Us',
            'slug' => 'about-us',
            'content' => '<h2>About Advaita Matrimony</h2><p>Advaita Matrimony is India\'s first truly inclusive matrimonial platform...</p>',
        ]);

        // Create Site Settings
        $settings = [
            ['key' => 'site_name', 'value' => 'Advaita Matrimony', 'group' => 'general'],
            ['key' => 'site_tagline', 'value' => 'Where Every Heart Finds Its Match', 'group' => 'general'],
            ['key' => 'contact_email', 'value' => 'support@advaitamatrimony.com', 'group' => 'general'],
            ['key' => 'contact_phone', 'value' => '+91 XXXXX XXXXX', 'group' => 'general'],
            ['key' => 'free_mode_enabled', 'value' => 'false', 'group' => 'general'],
            ['key' => 'manual_approval_required', 'value' => 'true', 'group' => 'general'],
            ['key' => 'max_photos_per_user', 'value' => '8', 'group' => 'limits'],
            ['key' => 'otp_expiry_minutes', 'value' => '5', 'group' => 'auth'],
            ['key' => 'max_otp_attempts', 'value' => '5', 'group' => 'auth'],
            ['key' => 'watermark_enabled', 'value' => 'true', 'group' => 'privacy'],
            ['key' => 'photo_blur_enabled', 'value' => 'true', 'group' => 'privacy'],
            ['key' => 'contact_masking_enabled', 'value' => 'true', 'group' => 'privacy'],
            ['key' => 'facebook_url', 'value' => '', 'group' => 'social'],
            ['key' => 'instagram_url', 'value' => '', 'group' => 'social'],
            ['key' => 'youtube_url', 'value' => '', 'group' => 'social'],
            ['key' => 'whatsapp_number', 'value' => '', 'group' => 'social'],
        ];

        foreach ($settings as $setting) {
            SiteSetting::create($setting);
        }
    }
}
