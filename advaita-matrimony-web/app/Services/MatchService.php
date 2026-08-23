<?php

namespace App\Services;

use App\Models\User;
use App\Models\Profile;
use App\Models\PartnerPreference;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class MatchService
{
    /**
     * Get recommended matches for a user based on preferences
     */
    public function getRecommendedMatches(User $user, int $limit = 20): Collection
    {
        $preferences = $user->partnerPreferences;
        $profile = $user->profile;

        if (!$profile) return collect();

        $query = User::where('id', '!=', $user->id)
            ->where('profile_status', 'approved')
            ->where('gender', '!=', $user->gender)
            ->whereDoesntHave('blocks', function ($q) use ($user) {
                $q->where('blocked_id', $user->id);
            })
            ->whereNotIn('id', $user->blocks()->pluck('blocked_id'))
            ->with(['profile', 'primaryPhoto']);

        if ($preferences) {
            $this->applyPreferenceFilters($query, $preferences);
        }

        $matches = $query->limit($limit * 2)->get();

        // Calculate match score
        return $matches->map(function ($match) use ($user, $preferences) {
            $match->match_score = $this->calculateMatchScore($user, $match, $preferences);
            return $match;
        })->sortByDesc('match_score')->take($limit)->values();
    }

    /**
     * Advanced Search
     */
    public function advancedSearch(User $user, array $filters): Builder
    {
        $query = User::where('id', '!=', $user->id)
            ->where('profile_status', 'approved')
            ->whereHas('profile')
            ->with(['profile', 'primaryPhoto']);

        // Gender filter
        if (!empty($filters['gender'])) {
            $query->where('gender', $filters['gender']);
        }

        // Age filter
        if (!empty($filters['min_age'])) {
            $query->whereDate('date_of_birth', '<=', now()->subYears($filters['min_age']));
        }
        if (!empty($filters['max_age'])) {
            $query->whereDate('date_of_birth', '>=', now()->subYears($filters['max_age']));
        }

        // Profile category filter (important for Advaita)
        if (!empty($filters['profile_category'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                if (is_array($filters['profile_category'])) {
                    $q->whereIn('profile_category', $filters['profile_category']);
                } else {
                    $q->where('profile_category', $filters['profile_category']);
                }
            });
        }

        // Disability type filter
        if (!empty($filters['disability_type'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                $q->where('disability_type', $filters['disability_type']);
            });
        }

        // Skin condition filter
        if (!empty($filters['skin_condition'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                $q->where('skin_condition', $filters['skin_condition']);
            });
        }

        // Location filters
        if (!empty($filters['state'])) {
            $query->whereHas('profile', fn($q) => $q->where('state', $filters['state']));
        }
        if (!empty($filters['city'])) {
            $query->whereHas('profile', fn($q) => $q->where('city', $filters['city']));
        }

        // Religion & Community
        if (!empty($filters['religion'])) {
            $query->whereHas('profile', fn($q) => $q->where('religion', $filters['religion']));
        }
        if (!empty($filters['caste'])) {
            $query->whereHas('profile', fn($q) => $q->where('caste', $filters['caste']));
        }

        // Marital Status
        if (!empty($filters['marital_status'])) {
            $query->whereHas('profile', fn($q) => $q->where('marital_status', $filters['marital_status']));
        }

        // Education
        if (!empty($filters['education'])) {
            $query->whereHas('profile', fn($q) => $q->where('highest_education', $filters['education']));
        }

        // Height range
        if (!empty($filters['min_height'])) {
            $query->whereHas('profile', fn($q) => $q->where('height_cm', '>=', $filters['min_height']));
        }
        if (!empty($filters['max_height'])) {
            $query->whereHas('profile', fn($q) => $q->where('height_cm', '<=', $filters['max_height']));
        }

        // Mother tongue
        if (!empty($filters['mother_tongue'])) {
            $query->whereHas('profile', fn($q) => $q->where('mother_tongue', $filters['mother_tongue']));
        }

        // Premium profiles only
        if (!empty($filters['premium_only'])) {
            $query->where('is_premium', true);
        }

        // With photo only
        if (!empty($filters['with_photo'])) {
            $query->whereHas('photos', fn($q) => $q->where('status', 'approved'));
        }

        // Recently active
        if (!empty($filters['recently_active'])) {
            $query->where('last_active_at', '>=', now()->subDays(7));
        }

        return $query->orderByDesc('last_active_at');
    }

    /**
     * Apply partner preference filters to query
     */
    private function applyPreferenceFilters(Builder &$query, PartnerPreference $prefs): void
    {
        if ($prefs->min_age) {
            $query->whereDate('date_of_birth', '<=', now()->subYears($prefs->min_age));
        }
        if ($prefs->max_age) {
            $query->whereDate('date_of_birth', '>=', now()->subYears($prefs->max_age));
        }

        if ($prefs->accepted_categories && count($prefs->accepted_categories) > 0) {
            $query->whereHas('profile', fn($q) => $q->whereIn('profile_category', $prefs->accepted_categories));
        }

        if ($prefs->preferred_states && count($prefs->preferred_states) > 0) {
            $query->whereHas('profile', fn($q) => $q->whereIn('state', $prefs->preferred_states));
        }

        if ($prefs->religion_preferences && count($prefs->religion_preferences) > 0) {
            $query->whereHas('profile', fn($q) => $q->whereIn('religion', $prefs->religion_preferences));
        }
    }

    /**
     * Calculate match compatibility score (0-100)
     */
    private function calculateMatchScore(User $user, User $match, ?PartnerPreference $prefs): int
    {
        if (!$prefs) return 50;

        $score = 0;
        $factors = 0;
        $matchProfile = $match->profile;

        if (!$matchProfile) return 30;

        // Age match (20 points)
        $matchAge = $match->age;
        if ($matchAge) {
            $factors += 20;
            if ((!$prefs->min_age || $matchAge >= $prefs->min_age) &&
                (!$prefs->max_age || $matchAge <= $prefs->max_age)) {
                $score += 20;
            }
        }

        // Location match (15 points)
        if ($prefs->preferred_states && count($prefs->preferred_states) > 0) {
            $factors += 15;
            if (in_array($matchProfile->state, $prefs->preferred_states)) {
                $score += 15;
            }
        }

        // Religion match (15 points)
        if ($prefs->religion_preferences && count($prefs->religion_preferences) > 0) {
            $factors += 15;
            if (in_array($matchProfile->religion, $prefs->religion_preferences)) {
                $score += 15;
            }
        }

        // Category match (20 points)
        if ($prefs->accepted_categories && count($prefs->accepted_categories) > 0) {
            $factors += 20;
            if (in_array($matchProfile->profile_category, $prefs->accepted_categories)) {
                $score += 20;
            }
        }

        // Education match (10 points)
        if ($prefs->education_preferences && count($prefs->education_preferences) > 0) {
            $factors += 10;
            if (in_array($matchProfile->highest_education, $prefs->education_preferences)) {
                $score += 10;
            }
        }

        // Diet match (10 points)
        if ($prefs->diet_preferences && count($prefs->diet_preferences) > 0) {
            $factors += 10;
            if (in_array($matchProfile->diet, $prefs->diet_preferences)) {
                $score += 10;
            }
        }

        // Profile completeness bonus (10 points)
        $factors += 10;
        $score += (int)(($match->profile_completion_percentage / 100) * 10);

        return $factors > 0 ? (int)(($score / $factors) * 100) : 50;
    }
}
