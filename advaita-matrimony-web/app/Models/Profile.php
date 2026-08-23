<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'profile_category', 'disability_type', 'disability_percentage',
        'udid_verification_status', 'udid_certificate_number', 'udid_document_path',
        'uses_wheelchair', 'uses_prosthetics', 'uses_hearing_aid', 'disability_description',
        'hearing_condition', 'speech_condition', 'knows_sign_language',
        'preferred_communication_method', 'skin_condition', 'vitiligo_coverage',
        'vitiligo_affected_areas', 'vitiligo_stable', 'religion', 'caste', 'sub_caste',
        'mother_tongue', 'marital_status', 'number_of_children', 'children_living_status',
        'height_cm', 'weight_kg', 'body_type', 'complexion', 'blood_group',
        'highest_education', 'education_institution', 'education_field',
        'employed_in', 'occupation', 'company_name', 'annual_income_range',
        'country', 'state', 'city', 'pincode', 'latitude', 'longitude',
        'family_type', 'family_status', 'father_occupation', 'mother_occupation',
        'number_of_brothers', 'number_of_sisters', 'family_details',
        'diet', 'smoking', 'drinking', 'gotra', 'rashi', 'nakshatra',
        'manglik', 'birth_time', 'birth_place', 'about_me',
        'partner_preferences_text', 'hobbies', 'languages_known',
    ];

    protected $casts = [
        'uses_wheelchair' => 'boolean',
        'uses_prosthetics' => 'boolean',
        'uses_hearing_aid' => 'boolean',
        'knows_sign_language' => 'boolean',
        'vitiligo_stable' => 'boolean',
        'manglik' => 'boolean',
        'hobbies' => 'array',
        'languages_known' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getCategoryDisplayNameAttribute(): string
    {
        return match ($this->profile_category) {
            'general' => 'General Public',
            'physically_challenged' => 'Physically Challenged (Divyangjan)',
            'hearing_speech_impaired' => 'Hearing & Speech Impaired',
            'vitiligo_skin_condition' => 'Vitiligo / Skin Condition',
            default => 'General',
        };
    }

    public function getHeightDisplayAttribute(): string
    {
        if (!$this->height_cm) return 'Not specified';
        $feet = floor($this->height_cm / 30.48);
        $inches = round(($this->height_cm - ($feet * 30.48)) / 2.54);
        return "{$feet}'{$inches}\" ({$this->height_cm} cm)";
    }
}
