<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    protected $fillable = [
        'user_id', 'original_path', 'watermarked_path', 'blurred_path',
        'thumbnail_path', 'is_primary', 'privacy_level', 'status', 'sort_order',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getDisplayUrlAttribute(): string
    {
        if ($this->privacy_level === 'public') {
            return $this->watermarked_path ?? $this->original_path;
        }
        return $this->blurred_path ?? $this->watermarked_path ?? $this->original_path;
    }
}
