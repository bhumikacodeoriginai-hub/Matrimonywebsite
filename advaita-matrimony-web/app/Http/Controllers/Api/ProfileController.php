<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use App\Models\ProfileView;
use App\Models\User;
use App\Services\PhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function __construct(private PhotoService $photoService) {}

    /**
     * Get current user's full profile
     */
    public function getMyProfile(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile', 'photos', 'partnerPreferences', 'activeSubscription.package']);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
                'profile_completion' => $this->calculateProfileCompletion($user),
            ]
        ]);
    }

    /**
     * Update profile information
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        if (!$profile) {
            $profile = $user->profile()->create($request->all());
        } else {
            $profile->update($request->only($profile->getFillable()));
        }

        // Update user fields if provided
        $userFields = $request->only(['name', 'email', 'date_of_birth']);
        if (!empty($userFields)) {
            $user->update($userFields);
        }

        // Recalculate profile completion
        $completion = $this->calculateProfileCompletion($user->fresh(['profile']));
        $user->update(['profile_completion_percentage' => $completion]);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profile_completion' => $completion,
        ]);
    }

    /**
     * Update partner preferences
     */
    public function updatePartnerPreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        $prefs = $user->partnerPreferences;

        if (!$prefs) {
            $user->partnerPreferences()->create($request->all());
        } else {
            $prefs->update($request->all());
        }

        return response()->json([
            'success' => true,
            'message' => 'Partner preferences updated successfully',
        ]);
    }

    /**
     * View another user's profile
     */
    public function viewProfile(Request $request, int $userId): JsonResponse
    {
        $viewer = $request->user();
        $user = User::with(['profile', 'photos' => function ($q) {
            $q->where('status', 'approved')->orderBy('is_primary', 'desc');
        }])->where('profile_status', 'approved')->findOrFail($userId);

        // Check if blocked
        if ($viewer->hasBlockedUser($userId) || $user->hasBlockedUser($viewer->id)) {
            return response()->json(['success' => false, 'message' => 'Profile not available'], 403);
        }

        // Record profile view
        ProfileView::create(['viewer_id' => $viewer->id, 'viewed_id' => $userId]);

        // Determine what to show based on subscription
        $canViewContact = $viewer->isPremium() || config('app.free_mode');
        $hasPhotoAccess = $this->hasPhotoAccess($viewer, $user);

        $profileData = [
            'id' => $user->id,
            'unique_id' => $user->unique_id,
            'name' => $user->name,
            'age' => $user->age,
            'gender' => $user->gender,
            'profile_category' => $user->profile?->profile_category,
            'category_display' => $user->profile?->category_display_name,
            'is_premium' => $user->isPremium(),
            'last_active' => $user->last_active_at?->diffForHumans(),
            'profile' => $user->profile,
            'photos' => $user->photos->map(function ($photo) use ($hasPhotoAccess) {
                return [
                    'id' => $photo->id,
                    'url' => $hasPhotoAccess ? $photo->watermarked_path : $photo->blurred_path,
                    'is_blurred' => !$hasPhotoAccess,
                    'is_primary' => $photo->is_primary,
                ];
            }),
            'phone' => $canViewContact ? $user->phone : $user->getMaskedPhone(),
            'email' => $canViewContact ? $user->email : null,
            'contact_visible' => $canViewContact,
        ];

        return response()->json(['success' => true, 'data' => $profileData]);
    }

    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        if ($user->photos()->count() >= 8) {
            return response()->json(['success' => false, 'message' => 'Maximum 8 photos allowed'], 422);
        }

        $photo = $this->photoService->uploadPhoto(
            $request->file('photo'),
            $user->id,
            $request->boolean('is_primary', false)
        );

        return response()->json([
            'success' => true,
            'message' => 'Photo uploaded! It will be visible after admin approval.',
            'photo' => $photo,
        ], 201);
    }

    /**
     * Delete a photo
     */
    public function deletePhoto(Request $request, int $photoId): JsonResponse
    {
        $photo = Photo::where('user_id', $request->user()->id)->findOrFail($photoId);
        $photo->delete();

        return response()->json(['success' => true, 'message' => 'Photo deleted']);
    }

    /**
     * Request photo access from another user
     */
    public function requestPhotoAccess(Request $request, int $userId): JsonResponse
    {
        $requester = $request->user();

        $existing = $requester->sentPhotoRequests()
            ->where('requested_user_id', $userId)
            ->whereIn('status', ['pending', 'approved'])
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => $existing->status === 'approved' ? 'Access already granted' : 'Request already pending'
            ]);
        }

        \App\Models\PhotoAccessRequest::create([
            'requester_id' => $requester->id,
            'requested_user_id' => $userId,
            'message' => $request->message,
        ]);

        return response()->json(['success' => true, 'message' => 'Photo access request sent']);
    }

    /**
     * Get who viewed my profile
     */
    public function getProfileViewers(Request $request): JsonResponse
    {
        $viewers = ProfileView::where('viewed_id', $request->user()->id)
            ->with(['viewer:id,name,unique_id,gender,date_of_birth', 'viewer.primaryPhoto', 'viewer.profile:id,user_id,profile_category,city,state'])
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $viewers]);
    }

    /**
     * Calculate profile completion percentage
     */
    private function calculateProfileCompletion(User $user): int
    {
        $profile = $user->profile;
        if (!$profile) return 5;

        $fields = [
            'basic' => ['name' => $user->name, 'gender' => $user->gender, 'dob' => $user->date_of_birth],
            'personal' => ['religion' => $profile->religion, 'caste' => $profile->caste, 'mother_tongue' => $profile->mother_tongue, 'marital_status' => $profile->marital_status],
            'physical' => ['height' => $profile->height_cm, 'weight' => $profile->weight_kg, 'body_type' => $profile->body_type],
            'education' => ['education' => $profile->highest_education, 'employed' => $profile->employed_in, 'occupation' => $profile->occupation],
            'location' => ['state' => $profile->state, 'city' => $profile->city],
            'family' => ['family_type' => $profile->family_type, 'father' => $profile->father_occupation],
            'about' => ['about_me' => $profile->about_me],
            'photo' => ['has_photo' => $user->photos()->count() > 0],
        ];

        $totalSections = count($fields);
        $completedSections = 0;

        foreach ($fields as $section => $sectionFields) {
            $filled = collect($sectionFields)->filter(fn($v) => !empty($v))->count();
            if ($filled >= ceil(count($sectionFields) * 0.5)) {
                $completedSections++;
            }
        }

        return (int)(($completedSections / $totalSections) * 100);
    }

    private function hasPhotoAccess(User $viewer, User $profileUser): bool
    {
        if (config('app.free_mode')) return true;
        if ($viewer->isPremium()) return true;

        // Check if photo access was granted
        return \App\Models\PhotoAccessRequest::where('requester_id', $viewer->id)
            ->where('requested_user_id', $profileUser->id)
            ->where('status', 'approved')
            ->exists();
    }
}
