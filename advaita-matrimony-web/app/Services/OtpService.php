<?php

namespace App\Services;

use App\Models\OtpVerification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OtpService
{
    /**
     * Generate and send OTP via SMS
     */
    public function sendOtp(string $phone, string $purpose = 'login'): array
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in database
        OtpVerification::updateOrCreate(
            ['phone' => $phone, 'purpose' => $purpose, 'is_verified' => false],
            [
                'otp' => $otp,
                'attempts' => 0,
                'expires_at' => now()->addMinutes(5),
            ]
        );

        // Send via Fast2SMS
        $sent = $this->sendViaFast2SMS($phone, $otp);

        if (!$sent) {
            // Fallback to MSG91
            $sent = $this->sendViaMSG91($phone, $otp);
        }

        return [
            'success' => $sent,
            'message' => $sent ? 'OTP sent successfully' : 'Failed to send OTP',
        ];
    }

    /**
     * Verify OTP
     */
    public function verifyOtp(string $phone, string $otp, string $purpose = 'login'): array
    {
        $record = OtpVerification::where('phone', $phone)
            ->where('purpose', $purpose)
            ->where('is_verified', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if (!$record) {
            return ['success' => false, 'message' => 'OTP expired or not found'];
        }

        if ($record->attempts >= 5) {
            return ['success' => false, 'message' => 'Maximum attempts exceeded. Please request a new OTP'];
        }

        if ($record->otp !== $otp) {
            $record->increment('attempts');
            return ['success' => false, 'message' => 'Invalid OTP'];
        }

        $record->update(['is_verified' => true]);

        return ['success' => true, 'message' => 'OTP verified successfully'];
    }

    /**
     * Send OTP via Fast2SMS
     */
    private function sendViaFast2SMS(string $phone, string $otp): bool
    {
        try {
            $response = Http::withHeaders([
                'authorization' => config('services.fast2sms.api_key'),
            ])->post('https://www.fast2sms.com/dev/bulkV2', [
                'route' => 'otp',
                'variables_values' => $otp,
                'numbers' => $phone,
                'flash' => 0,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('Fast2SMS Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via MSG91
     */
    private function sendViaMSG91(string $phone, string $otp): bool
    {
        try {
            $response = Http::withHeaders([
                'authkey' => config('services.msg91.auth_key'),
            ])->post('https://api.msg91.com/api/v5/otp', [
                'template_id' => config('services.msg91.template_id'),
                'mobile' => '91' . $phone,
                'otp' => $otp,
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('MSG91 Error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send OTP via WhatsApp
     */
    public function sendWhatsAppOtp(string $phone, string $otp): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . config('services.whatsapp.api_key'),
            ])->post(config('services.whatsapp.api_url') . '/messages', [
                'to' => '91' . $phone,
                'type' => 'template',
                'template' => [
                    'name' => 'otp_verification',
                    'language' => ['code' => 'en'],
                    'components' => [
                        ['type' => 'body', 'parameters' => [['type' => 'text', 'text' => $otp]]]
                    ]
                ]
            ]);

            return $response->successful();
        } catch (\Exception $e) {
            Log::error('WhatsApp OTP Error: ' . $e->getMessage());
            return false;
        }
    }
}
