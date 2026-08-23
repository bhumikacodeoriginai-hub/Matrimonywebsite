<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Category & Disability Information
            $table->enum('profile_category', [
                'general',
                'physically_challenged',
                'hearing_speech_impaired',
                'vitiligo_skin_condition'
            ])->default('general');

            // Disability Details
            $table->enum('disability_type', [
                'none',
                'locomotor_impairment',
                'cerebral_palsy',
                'muscular_dystrophy',
                'polio_affected',
                'amputation',
                'dwarfism',
                'spinal_cord_injury',
                'other_physical'
            ])->nullable();
            $table->integer('disability_percentage')->nullable()->comment('0-100%');
            $table->enum('udid_verification_status', ['not_uploaded', 'pending', 'verified', 'rejected'])->default('not_uploaded');
            $table->string('udid_certificate_number')->nullable();
            $table->string('udid_document_path')->nullable();
            $table->boolean('uses_wheelchair')->default(false);
            $table->boolean('uses_prosthetics')->default(false);
            $table->boolean('uses_hearing_aid')->default(false);
            $table->text('disability_description')->nullable();

            // Hearing & Speech Details
            $table->enum('hearing_condition', ['normal', 'partial_hearing_loss', 'complete_hearing_loss', 'deaf_since_birth'])->nullable();
            $table->enum('speech_condition', ['normal', 'speech_impaired', 'mute', 'stuttering'])->nullable();
            $table->boolean('knows_sign_language')->default(false);
            $table->string('preferred_communication_method')->nullable();

            // Vitiligo / Skin Condition
            $table->enum('skin_condition', ['normal', 'vitiligo', 'leucoderma', 'other_skin_condition'])->default('normal');
            $table->enum('vitiligo_coverage', ['minimal', 'moderate', 'extensive', 'universal'])->nullable();
            $table->string('vitiligo_affected_areas')->nullable();
            $table->boolean('vitiligo_stable')->nullable();

            // Personal Information
            $table->string('religion')->nullable();
            $table->string('caste')->nullable();
            $table->string('sub_caste')->nullable();
            $table->string('mother_tongue')->nullable();
            $table->enum('marital_status', ['never_married', 'divorced', 'widowed', 'separated'])->default('never_married');
            $table->integer('number_of_children')->default(0);
            $table->enum('children_living_status', ['not_applicable', 'living_with_me', 'not_living_with_me'])->default('not_applicable');

            // Physical Attributes
            $table->decimal('height_cm', 5, 2)->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->enum('body_type', ['slim', 'average', 'athletic', 'heavy'])->nullable();
            $table->enum('complexion', ['very_fair', 'fair', 'wheatish', 'dark'])->nullable();
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])->nullable();

            // Education & Career
            $table->string('highest_education')->nullable();
            $table->string('education_institution')->nullable();
            $table->string('education_field')->nullable();
            $table->enum('employed_in', ['government', 'private', 'business', 'self_employed', 'not_working', 'student'])->nullable();
            $table->string('occupation')->nullable();
            $table->string('company_name')->nullable();
            $table->string('annual_income_range')->nullable();

            // Location
            $table->string('country')->default('India');
            $table->string('state')->nullable();
            $table->string('city')->nullable();
            $table->string('pincode', 10)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Family Information
            $table->enum('family_type', ['joint', 'nuclear'])->nullable();
            $table->enum('family_status', ['middle_class', 'upper_middle_class', 'rich', 'affluent'])->nullable();
            $table->string('father_occupation')->nullable();
            $table->string('mother_occupation')->nullable();
            $table->integer('number_of_brothers')->default(0);
            $table->integer('number_of_sisters')->default(0);
            $table->text('family_details')->nullable();

            // Lifestyle
            $table->enum('diet', ['vegetarian', 'non_vegetarian', 'eggetarian', 'vegan', 'jain'])->nullable();
            $table->enum('smoking', ['no', 'occasionally', 'yes'])->default('no');
            $table->enum('drinking', ['no', 'occasionally', 'yes'])->default('no');

            // Horoscope
            $table->string('gotra')->nullable();
            $table->string('rashi')->nullable();
            $table->string('nakshatra')->nullable();
            $table->boolean('manglik')->nullable();
            $table->time('birth_time')->nullable();
            $table->string('birth_place')->nullable();

            // About & Preferences
            $table->text('about_me')->nullable();
            $table->text('partner_preferences_text')->nullable();
            $table->json('hobbies')->nullable();
            $table->json('languages_known')->nullable();

            $table->timestamps();

            $table->index('profile_category');
            $table->index(['disability_type', 'disability_percentage']);
            $table->index('skin_condition');
            $table->index(['state', 'city']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
