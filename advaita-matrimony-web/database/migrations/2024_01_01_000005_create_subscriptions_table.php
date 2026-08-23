<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_packages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2);
            $table->decimal('discounted_price', 10, 2)->nullable();
            $table->integer('duration_days');
            $table->integer('profile_views_limit')->default(-1)->comment('-1 = unlimited');
            $table->integer('contacts_limit')->default(-1);
            $table->integer('messages_limit')->default(-1);
            $table->integer('interest_sends_limit')->default(-1);
            $table->boolean('photo_access')->default(true);
            $table->boolean('advanced_search')->default(true);
            $table->boolean('chat_enabled')->default(true);
            $table->boolean('video_call_enabled')->default(false);
            $table->boolean('profile_highlight')->default(false);
            $table->boolean('priority_support')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->json('features_list')->nullable();
            $table->timestamps();
        });

        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained('subscription_packages')->onDelete('cascade');
            $table->timestamp('starts_at');
            $table->timestamp('expires_at');
            $table->enum('status', ['active', 'expired', 'cancelled', 'refunded'])->default('active');
            $table->integer('profile_views_used')->default(0);
            $table->integer('contacts_used')->default(0);
            $table->integer('messages_used')->default(0);
            $table->integer('interests_used')->default(0);
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('expires_at');
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->nullable()->constrained('subscription_packages');
            $table->string('payment_gateway')->comment('razorpay, phonepe, manual');
            $table->string('gateway_order_id')->nullable();
            $table->string('gateway_payment_id')->nullable();
            $table->string('gateway_signature')->nullable();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 5)->default('INR');
            $table->enum('status', ['created', 'pending', 'completed', 'failed', 'refunded'])->default('created');
            $table->json('gateway_response')->nullable();
            $table->string('receipt_number')->nullable();
            $table->text('failure_reason')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('gateway_order_id');
            $table->index('gateway_payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('subscription_packages');
    }
};
