<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            // Age & Physical
            $table->integer('min_age')->nullable();
            $table->integer('max_age')->nullable();
            $table->decimal('min_height_cm', 5, 2)->nullable();
            $table->decimal('max_height_cm', 5, 2)->nullable();
            $table->json('body_type_preferences')->nullable();
            $table->json('complexion_preferences')->nullable();

            // Category Preferences
            $table->json('accepted_categories')->nullable()->comment('Which categories they accept');
            $table->boolean('open_to_disability')->default(true);
            $table->integer('max_disability_percentage')->nullable();

            // Education & Career
            $table->json('education_preferences')->nullable();
            $table->json('employed_in_preferences')->nullable();
            $table->string('min_annual_income')->nullable();

            // Location
            $table->json('preferred_states')->nullable();
            $table->json('preferred_cities')->nullable();
            $table->integer('max_distance_km')->nullable();

            // Personal
            $table->json('marital_status_preferences')->nullable();
            $table->json('religion_preferences')->nullable();
            $table->json('caste_preferences')->nullable();
            $table->json('mother_tongue_preferences')->nullable();
            $table->json('diet_preferences')->nullable();
            $table->enum('smoking_preference', ['no', 'doesnt_matter'])->default('doesnt_matter');
            $table->enum('drinking_preference', ['no', 'doesnt_matter'])->default('doesnt_matter');

            // Horoscope
            $table->boolean('manglik_preference')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_preferences');
    }
};
