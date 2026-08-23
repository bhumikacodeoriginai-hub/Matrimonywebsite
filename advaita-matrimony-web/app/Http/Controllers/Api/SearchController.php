<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function __construct(private MatchService $matchService) {}

    /**
     * Get recommended matches
     */
    public function recommendations(Request $request): JsonResponse
    {
        $user = $request->user();
        $matches = $this->matchService->getRecommendedMatches($user, 20);

        $data = $matches->map(function ($match) {
            return [
                'id' => $match->id,
                'unique_id' => $match->unique_id,
                'name' => $match->name,
                'age' => $match->age,
                'gender' => $match->gender,
                'city' => $match->profile?->city,
                'state' => $match->profile?->state,
                'profile_category' => $match->profile?->profile_category,
                'category_display' => $match->profile?->category_display_name,
                'highest_education' => $match->profile?->highest_education,
                'occupation' => $match->profile?->occupation,
                'photo' => $match->primaryPhoto?->thumbnail_path,
                'match_score' => $match->match_score ?? 0,
                'is_premium' => $match->isPremium(),
                'last_active' => $match->last_active_at?->diffForHumans(),
            ];
        });

        return response()->json(['success' => true, 'data' => $data]);
    }

    /**
     * Advanced search with filters
     */
    public function search(Request $request): JsonResponse
    {
        $user = $request->user();
        $filters = $request->only([
            'gender', 'min_age', 'max_age', 'profile_category',
            'disability_type', 'skin_condition', 'state', 'city',
            'religion', 'caste', 'marital_status', 'education',
            'min_height', 'max_height', 'mother_tongue',
            'premium_only', 'with_photo', 'recently_active',
        ]);

        $query = $this->matchService->advancedSearch($user, $filters);
        $results = $query->paginate($request->per_page ?? 20);

        $results->getCollection()->transform(function ($match) {
            return [
                'id' => $match->id,
                'unique_id' => $match->unique_id,
                'name' => $match->name,
                'age' => $match->age,
                'gender' => $match->gender,
                'city' => $match->profile?->city,
                'state' => $match->profile?->state,
                'profile_category' => $match->profile?->profile_category,
                'category_display' => $match->profile?->category_display_name,
                'highest_education' => $match->profile?->highest_education,
                'occupation' => $match->profile?->occupation,
                'photo' => $match->primaryPhoto?->thumbnail_path,
                'is_premium' => $match->isPremium(),
                'last_active' => $match->last_active_at?->diffForHumans(),
            ];
        });

        return response()->json(['success' => true, 'data' => $results]);
    }

    /**
     * Search by Profile ID
     */
    public function searchById(Request $request): JsonResponse
    {
        $request->validate(['profile_id' => 'required|string']);

        $user = \App\Models\User::where('unique_id', $request->profile_id)
            ->where('profile_status', 'approved')
            ->with(['profile', 'primaryPhoto'])
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Profile not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'unique_id' => $user->unique_id,
                'name' => $user->name,
                'age' => $user->age,
                'city' => $user->profile?->city,
                'profile_category' => $user->profile?->profile_category,
                'photo' => $user->primaryPhoto?->thumbnail_path,
            ]
        ]);
    }

    /**
     * Get filter options (for dropdowns)
     */
    public function filterOptions(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'profile_categories' => [
                    ['value' => 'general', 'label' => 'General Public'],
                    ['value' => 'physically_challenged', 'label' => 'Physically Challenged (Divyangjan)'],
                    ['value' => 'hearing_speech_impaired', 'label' => 'Hearing & Speech Impaired'],
                    ['value' => 'vitiligo_skin_condition', 'label' => 'Vitiligo / Skin Condition'],
                ],
                'religions' => ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'],
                'marital_statuses' => [
                    ['value' => 'never_married', 'label' => 'Never Married'],
                    ['value' => 'divorced', 'label' => 'Divorced'],
                    ['value' => 'widowed', 'label' => 'Widowed'],
                    ['value' => 'separated', 'label' => 'Separated'],
                ],
                'education_levels' => [
                    'Below 10th', '10th Pass', '12th Pass', 'Diploma', 'Graduate',
                    'Post Graduate', 'PhD', 'Professional (B.Tech/BE)', 'Professional (MBBS/MD)',
                    'Professional (MBA)', 'Professional (CA/CS)', 'Other',
                ],
                'states' => $this->getIndianStates(),
            ]
        ]);
    }

    private function getIndianStates(): array
    {
        return [
            'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
            'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
            'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
            'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
            'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
            'Delhi', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh',
        ];
    }
}
