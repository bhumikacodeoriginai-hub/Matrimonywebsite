<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPackage;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private PaymentService $paymentService) {}

    /**
     * Get available subscription packages
     */
    public function packages(): JsonResponse
    {
        $packages = SubscriptionPackage::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'slug' => $package->slug,
                    'description' => $package->description,
                    'price' => $package->price,
                    'discounted_price' => $package->discounted_price,
                    'effective_price' => $package->effective_price,
                    'discount_percentage' => $package->discount_percentage,
                    'duration_days' => $package->duration_days,
                    'is_popular' => $package->is_popular,
                    'features' => $package->features_list,
                    'limits' => [
                        'profile_views' => $package->profile_views_limit,
                        'contacts' => $package->contacts_limit,
                        'messages' => $package->messages_limit,
                        'interests' => $package->interest_sends_limit,
                    ],
                    'includes' => [
                        'photo_access' => $package->photo_access,
                        'advanced_search' => $package->advanced_search,
                        'chat' => $package->chat_enabled,
                        'video_call' => $package->video_call_enabled,
                        'profile_highlight' => $package->profile_highlight,
                        'priority_support' => $package->priority_support,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'free_mode' => config('app.free_mode', false),
            'data' => $packages,
        ]);
    }

    /**
     * Initiate Razorpay payment
     */
    public function createRazorpayOrder(Request $request): JsonResponse
    {
        $request->validate(['package_id' => 'required|exists:subscription_packages,id']);

        $package = SubscriptionPackage::findOrFail($request->package_id);
        $user = $request->user();

        $result = $this->paymentService->createRazorpayOrder($user, $package);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Verify Razorpay payment
     */
    public function verifyRazorpayPayment(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_order_id' => 'required',
            'razorpay_payment_id' => 'required',
            'razorpay_signature' => 'required',
        ]);

        $result = $this->paymentService->verifyRazorpayPayment(
            $request->razorpay_order_id,
            $request->razorpay_payment_id,
            $request->razorpay_signature
        );

        return response()->json($result, $result['success'] ? 200 : 400);
    }

    /**
     * Initiate PhonePe payment
     */
    public function createPhonePePayment(Request $request): JsonResponse
    {
        $request->validate(['package_id' => 'required|exists:subscription_packages,id']);

        $package = SubscriptionPackage::findOrFail($request->package_id);
        $user = $request->user();

        $result = $this->paymentService->createPhonePePayment($user, $package);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Get payment history
     */
    public function paymentHistory(Request $request): JsonResponse
    {
        $payments = $request->user()->payments()
            ->with('package:id,name,duration_days')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $payments]);
    }

    /**
     * Get my subscription details
     */
    public function mySubscription(Request $request): JsonResponse
    {
        $subscription = $request->user()->activeSubscription()->with('package')->first();

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'has_subscription' => false,
                'message' => 'No active subscription',
            ]);
        }

        return response()->json([
            'success' => true,
            'has_subscription' => true,
            'data' => [
                'package_name' => $subscription->package->name,
                'starts_at' => $subscription->starts_at->toDateString(),
                'expires_at' => $subscription->expires_at->toDateString(),
                'days_remaining' => $subscription->daysRemaining(),
                'usage' => [
                    'profile_views' => $subscription->profile_views_used . '/' . ($subscription->package->profile_views_limit > 0 ? $subscription->package->profile_views_limit : '∞'),
                    'contacts' => $subscription->contacts_used . '/' . ($subscription->package->contacts_limit > 0 ? $subscription->package->contacts_limit : '∞'),
                    'messages' => $subscription->messages_used . '/' . ($subscription->package->messages_limit > 0 ? $subscription->package->messages_limit : '∞'),
                    'interests' => $subscription->interests_used . '/' . ($subscription->package->interest_sends_limit > 0 ? $subscription->package->interest_sends_limit : '∞'),
                ],
            ],
        ]);
    }
}
