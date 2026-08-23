<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PartnerPreference extends Model
{
    protected $fillable = [
        'user_id', 'min_age', 'max_age', 'min_height_cm', 'max_height_cm',
        'body_type_preferences', 'complexion_preferences', 'accepted_categories',
        'open_to_disability', 'max_disability_percentage', 'education_preferences',
        'employed_in_preferences', 'min_annual_income', 'preferred_states',
        'preferred_cities', 'max_distance_km', 'marital_status_preferences',
        'religion_preferences', 'caste_preferences', 'mother_tongue_preferences',
        'diet_preferences', 'smoking_preference', 'drinking_preference', 'manglik_preference',
    ];

    protected $casts = [
        'body_type_preferences' => 'array',
        'complexion_preferences' => 'array',
        'accepted_categories' => 'array',
        'education_preferences' => 'array',
        'employed_in_preferences' => 'array',
        'preferred_states' => 'array',
        'preferred_cities' => 'array',
        'marital_status_preferences' => 'array',
        'religion_preferences' => 'array',
        'caste_preferences' => 'array',
        'mother_tongue_preferences' => 'array',
        'diet_preferences' => 'array',
        'open_to_disability' => 'boolean',
        'manglik_preference' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
