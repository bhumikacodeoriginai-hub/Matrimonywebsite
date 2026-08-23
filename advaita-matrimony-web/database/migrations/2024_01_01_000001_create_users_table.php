<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id')->unique()->comment('Unique Profile ID like ADV-xxxxx');
            $table->string('name');
            $table->string('email')->unique()->nullable();
            $table->string('phone', 15)->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('phone_verified_at')->nullable();
            $table->string('password');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('date_of_birth');
            $table->enum('role', ['user', 'admin', 'moderator'])->default('user');
            $table->enum('profile_status', ['pending', 'approved', 'rejected', 'suspended', 'deleted'])->default('pending');
            $table->boolean('is_premium')->default(false);
            $table->timestamp('premium_expires_at')->nullable();
            $table->string('avatar')->nullable();
            $table->string('firebase_token')->nullable();
            $table->timestamp('last_active_at')->nullable();
            $table->boolean('is_online')->default(false);
            $table->integer('profile_completion_percentage')->default(0);
            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gender', 'profile_status']);
            $table->index('last_active_at');
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('phone')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
