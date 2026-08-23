<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('original_path');
            $table->string('watermarked_path')->nullable();
            $table->string('blurred_path')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->enum('privacy_level', ['public', 'members_only', 'request_access'])->default('members_only');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'is_primary']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('photo_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requester_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('requested_user_id')->constrained('users')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->text('message')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->unique(['requester_id', 'requested_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photo_access_requests');
        Schema::dropIfExists('photos');
    }
};
