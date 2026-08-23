<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\InterestController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Advaita Matrimony
|--------------------------------------------------------------------------
*/

// ===================== PUBLIC ROUTES =====================
Route::prefix('v1')->group(function () {

    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('send-otp', [AuthController::class, 'sendOtp']);
        Route::post('verify-otp', [AuthController::class, 'verifyOtp']);
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    // Public data
    Route::get('filter-options', [SearchController::class, 'filterOptions']);
    Route::get('packages', [PaymentController::class, 'packages']);

    // ===================== PROTECTED ROUTES =====================
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::post('auth/fcm-token', [AuthController::class, 'updateFcmToken']);

        // Profile
        Route::prefix('profile')->group(function () {
            Route::get('me', [ProfileController::class, 'getMyProfile']);
            Route::put('update', [ProfileController::class, 'updateProfile']);
            Route::put('partner-preferences', [ProfileController::class, 'updatePartnerPreferences']);
            Route::post('photo/upload', [ProfileController::class, 'uploadPhoto']);
            Route::delete('photo/{photoId}', [ProfileController::class, 'deletePhoto']);
            Route::get('viewers', [ProfileController::class, 'getProfileViewers']);
        });

        // View other profiles
        Route::get('profiles/{userId}', [ProfileController::class, 'viewProfile']);
        Route::post('profiles/{userId}/request-photo', [ProfileController::class, 'requestPhotoAccess']);

        // Search & Discovery
        Route::get('matches/recommended', [SearchController::class, 'recommendations']);
        Route::get('search', [SearchController::class, 'search']);
        Route::get('search/by-id', [SearchController::class, 'searchById']);

        // Interests & Matching
        Route::prefix('interests')->group(function () {
            Route::post('send/{userId}', [InterestController::class, 'sendInterest']);
            Route::put('{interestId}/respond', [InterestController::class, 'respondToInterest']);
            Route::get('sent', [InterestController::class, 'sentInterests']);
            Route::get('received', [InterestController::class, 'receivedInterests']);
            Route::get('mutual', [InterestController::class, 'mutualMatches']);
        });

        // Chat
        Route::prefix('chat')->group(function () {
            Route::get('conversations', [ChatController::class, 'conversations']);
            Route::get('conversations/{conversationId}/messages', [ChatController::class, 'messages']);
            Route::post('conversations/{conversationId}/send', [ChatController::class, 'sendMessage']);
            Route::get('unread-count', [ChatController::class, 'unreadCount']);
        });

        // Payments & Subscriptions
        Route::prefix('payments')->group(function () {
            Route::post('razorpay/create-order', [PaymentController::class, 'createRazorpayOrder']);
            Route::post('razorpay/verify', [PaymentController::class, 'verifyRazorpayPayment']);
            Route::post('phonepe/create', [PaymentController::class, 'createPhonePePayment']);
            Route::get('history', [PaymentController::class, 'paymentHistory']);
        });
        Route::get('my-subscription', [PaymentController::class, 'mySubscription']);

        // Shortlist & Block
        Route::post('shortlist/{userId}', function (\Illuminate\Http\Request $request, int $userId) {
            $request->user()->shortlists()->firstOrCreate(['shortlisted_id' => $userId]);
            return response()->json(['success' => true, 'message' => 'Profile shortlisted']);
        });
        Route::delete('shortlist/{userId}', function (\Illuminate\Http\Request $request, int $userId) {
            $request->user()->shortlists()->where('shortlisted_id', $userId)->delete();
            return response()->json(['success' => true, 'message' => 'Removed from shortlist']);
        });
        Route::get('shortlist', function (\Illuminate\Http\Request $request) {
            $shortlists = $request->user()->shortlists()
                ->with(['shortlistedUser:id,name,unique_id,gender,date_of_birth', 'shortlistedUser.primaryPhoto', 'shortlistedUser.profile:id,user_id,profile_category,city,state'])
                ->paginate(20);
            return response()->json(['success' => true, 'data' => $shortlists]);
        });

        Route::post('block/{userId}', function (\Illuminate\Http\Request $request, int $userId) {
            $request->user()->blocks()->firstOrCreate(['blocked_id' => $userId], ['reason' => $request->reason]);
            return response()->json(['success' => true, 'message' => 'User blocked']);
        });
    });
});
