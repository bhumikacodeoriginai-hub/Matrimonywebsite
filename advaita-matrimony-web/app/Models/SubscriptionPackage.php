<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionPackage extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'discounted_price',
        'duration_days', 'profile_views_limit', 'contacts_limit',
        'messages_limit', 'interest_sends_limit', 'photo_access',
        'advanced_search', 'chat_enabled', 'video_call_enabled',
        'profile_highlight', 'priority_support', 'is_popular',
        'is_active', 'sort_order', 'features_list',
    ];

    protected $casts = [
        'photo_access' => 'boolean',
        'advanced_search' => 'boolean',
        'chat_enabled' => 'boolean',
        'video_call_enabled' => 'boolean',
        'profile_highlight' => 'boolean',
        'priority_support' => 'boolean',
        'is_popular' => 'boolean',
        'is_active' => 'boolean',
        'features_list' => 'array',
    ];

    public function getEffectivePriceAttribute(): float
    {
        return $this->discounted_price ?? $this->price;
    }

    public function getDiscountPercentageAttribute(): int
    {
        if (!$this->discounted_price) return 0;
        return round((($this->price - $this->discounted_price) / $this->price) * 100);
    }
}
