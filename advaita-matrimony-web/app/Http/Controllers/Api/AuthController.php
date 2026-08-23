<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function __construct(private OtpService $otpService) {}

    /**
     * Send OTP for login/registration
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|digits:10',
            'purpose' => 'in:login,registration',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->otpService->sendOtp($request->phone, $request->purpose ?? 'login');

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Verify OTP and login/register
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|digits:10',
            'otp' => 'required|digits:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $result = $this->otpService->verifyOtp($request->phone, $request->otp);

        if (!$result['success']) {
            return response()->json($result, 401);
        }

        // Find or indicate registration needed
        $user = User::where('phone', $request->phone)->first();

        if ($user) {
            $user->update(['phone_verified_at' => now(), 'last_active_at' => now()]);
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'is_new_user' => false,
                'token' => $token,
                'user' => $this->getUserData($user),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP verified. Please complete registration.',
            'is_new_user' => true,
            'phone_verified' => true,
        ]);
    }

    /**
     * Complete registration after OTP verification
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|digits:10|unique:users',
            'name' => 'required|string|min:3|max:100',
            'email' => 'nullable|email|unique:users',
            'gender' => 'required|in:male,female,other',
            'date_of_birth' => 'required|date|before:-18 years',
            'password' => 'required|min:6|confirmed',
            'profile_category' => 'required|in:general,physically_challenged,hearing_speech_impaired,vitiligo_skin_condition',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'password' => Hash::make($request->password),
            'gender' => $request->gender,
            'date_of_birth' => $request->date_of_birth,
            'phone_verified_at' => now(),
            'profile_status' => 'pending',
        ]);

        // Create profile with category
        $user->profile()->create([
            'profile_category' => $request->profile_category,
        ]);

        // Create empty partner preferences
        $user->partnerPreferences()->create([]);

        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful! Your profile is pending approval.',
            'token' => $token,
            'user' => $this->getUserData($user),
        ], 201);
    }

    /**
     * Email/Password Login
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'login' => 'required', // email or phone
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->login)
            ->orWhere('phone', $request->login)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials'], 401);
        }

        if ($user->profile_status === 'suspended') {
            return response()->json(['success' => false, 'message' => 'Your account has been suspended'], 403);
        }

        $user->update(['last_active_at' => now(), 'is_online' => true]);
        $token = $user->createToken('mobile-app')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'token' => $token,
            'user' => $this->getUserData($user),
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->update(['is_online' => false]);
        $request->user()->currentAccessToken()->delete();

        return response()->json(['success' => true, 'message' => 'Logged out successfully']);
    }

    /**
     * Update Firebase Token
     */
    public function updateFcmToken(Request $request): JsonResponse
    {
        $request->user()->update(['firebase_token' => $request->token]);
        return response()->json(['success' => true]);
    }

    private function getUserData(User $user): array
    {
        $user->load(['profile', 'primaryPhoto', 'activeSubscription.package']);

        return [
            'id' => $user->id,
            'unique_id' => $user->unique_id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'gender' => $user->gender,
            'age' => $user->age,
            'avatar' => $user->primaryPhoto?->thumbnail_path,
            'profile_status' => $user->profile_status,
            'is_premium' => $user->isPremium(),
            'profile_category' => $user->profile?->profile_category,
            'profile_completion' => $user->profile_completion_percentage,
            'subscription' => $user->activeSubscription ? [
                'package_name' => $user->activeSubscription->package->name,
                'expires_at' => $user->activeSubscription->expires_at->toDateString(),
                'days_remaining' => $user->activeSubscription->daysRemaining(),
            ] : null,
        ];
    }
}
