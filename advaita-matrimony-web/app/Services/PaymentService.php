<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\SubscriptionPackage;
use App\Models\User;
use App\Models\UserSubscription;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentService
{
    /**
     * Create Razorpay Order
     */
    public function createRazorpayOrder(User $user, SubscriptionPackage $package): array
    {
        try {
            $receipt = 'ADV_' . time() . '_' . $user->id;
            $amount = $package->effective_price * 100; // Razorpay accepts amount in paise

            $response = Http::withBasicAuth(
                config('services.razorpay.key_id'),
                config('services.razorpay.key_secret')
            )->post('https://api.razorpay.com/v1/orders', [
                'amount' => (int)$amount,
                'currency' => 'INR',
                'receipt' => $receipt,
                'notes' => [
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'package_name' => $package->name,
                ]
            ]);

            if ($response->successful()) {
                $orderData = $response->json();

                // Create payment record
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'payment_gateway' => 'razorpay',
                    'gateway_order_id' => $orderData['id'],
                    'amount' => $package->effective_price,
                    'currency' => 'INR',
                    'status' => 'created',
                    'receipt_number' => $receipt,
                ]);

                return [
                    'success' => true,
                    'order_id' => $orderData['id'],
                    'amount' => $amount,
                    'currency' => 'INR',
                    'key_id' => config('services.razorpay.key_id'),
                    'payment_id' => $payment->id,
                    'user_name' => $user->name,
                    'user_email' => $user->email,
                    'user_phone' => $user->phone,
                ];
            }

            return ['success' => false, 'message' => 'Failed to create order'];
        } catch (\Exception $e) {
            Log::error('Razorpay Order Error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Payment gateway error'];
        }
    }

    /**
     * Verify Razorpay Payment
     */
    public function verifyRazorpayPayment(string $orderId, string $paymentId, string $signature): array
    {
        $payment = Payment::where('gateway_order_id', $orderId)->first();

        if (!$payment) {
            return ['success' => false, 'message' => 'Payment not found'];
        }

        // Verify signature
        $expectedSignature = hash_hmac(
            'sha256',
            $orderId . '|' . $paymentId,
            config('services.razorpay.key_secret')
        );

        if ($expectedSignature !== $signature) {
            $payment->update(['status' => 'failed', 'failure_reason' => 'Invalid signature']);
            return ['success' => false, 'message' => 'Payment verification failed'];
        }

        // Mark payment as completed
        $payment->update([
            'gateway_payment_id' => $paymentId,
            'gateway_signature' => $signature,
            'status' => 'completed',
        ]);

        // Activate subscription
        $this->activateSubscription($payment);

        return ['success' => true, 'message' => 'Payment successful! Subscription activated.'];
    }

    /**
     * Create PhonePe Payment
     */
    public function createPhonePePayment(User $user, SubscriptionPackage $package): array
    {
        try {
            $transactionId = 'ADV' . time() . $user->id;
            $amount = $package->effective_price * 100;

            $payload = [
                'merchantId' => config('services.phonepe.merchant_id'),
                'merchantTransactionId' => $transactionId,
                'merchantUserId' => 'MUID_' . $user->id,
                'amount' => (int)$amount,
                'redirectUrl' => route('payment.phonepe.callback'),
                'redirectMode' => 'POST',
                'callbackUrl' => route('payment.phonepe.webhook'),
                'mobileNumber' => $user->phone,
                'paymentInstrument' => ['type' => 'PAY_PAGE'],
            ];

            $base64Payload = base64_encode(json_encode($payload));
            $saltKey = config('services.phonepe.salt_key');
            $saltIndex = config('services.phonepe.salt_index');
            $checksum = hash('sha256', $base64Payload . '/pg/v1/pay' . $saltKey) . '###' . $saltIndex;

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
                'X-VERIFY' => $checksum,
            ])->post('https://api.phonepe.com/apis/hermes/pg/v1/pay', [
                'request' => $base64Payload,
            ]);

            if ($response->successful()) {
                $data = $response->json();

                Payment::create([
                    'user_id' => $user->id,
                    'package_id' => $package->id,
                    'payment_gateway' => 'phonepe',
                    'gateway_order_id' => $transactionId,
                    'amount' => $package->effective_price,
                    'currency' => 'INR',
                    'status' => 'pending',
                ]);

                return [
                    'success' => true,
                    'redirect_url' => $data['data']['instrumentResponse']['redirectInfo']['url'] ?? null,
                    'transaction_id' => $transactionId,
                ];
            }

            return ['success' => false, 'message' => 'PhonePe payment initiation failed'];
        } catch (\Exception $e) {
            Log::error('PhonePe Error: ' . $e->getMessage());
            return ['success' => false, 'message' => 'Payment gateway error'];
        }
    }

    /**
     * Activate user subscription after successful payment
     */
    public function activateSubscription(Payment $payment): void
    {
        $package = $payment->package;
        $user = $payment->user;

        // Deactivate any existing subscription
        UserSubscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        // Create new subscription
        UserSubscription::create([
            'user_id' => $user->id,
            'package_id' => $package->id,
            'starts_at' => now(),
            'expires_at' => now()->addDays($package->duration_days),
            'status' => 'active',
        ]);

        // Update user premium status
        $user->update([
            'is_premium' => true,
            'premium_expires_at' => now()->addDays($package->duration_days),
        ]);
    }
}
