<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'unique_id', 'name', 'email', 'phone', 'password', 'gender',
        'date_of_birth', 'role', 'profile_status', 'is_premium',
        'premium_expires_at', 'avatar', 'firebase_token',
        'last_active_at', 'is_online', 'profile_completion_percentage',
        'email_verified_at', 'phone_verified_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'phone_verified_at' => 'datetime',
        'premium_expires_at' => 'datetime',
        'last_active_at' => 'datetime',
        'date_of_birth' => 'date',
        'is_premium' => 'boolean',
        'is_online' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($user) {
            $user->unique_id = 'ADV-' . strtoupper(substr(md5(uniqid()), 0, 8));
        });
    }

    // Relationships
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function partnerPreferences()
    {
        return $this->hasOne(PartnerPreference::class);
    }

    public function photos()
    {
        return $this->hasMany(Photo::class);
    }

    public function primaryPhoto()
    {
        return $this->hasOne(Photo::class)->where('is_primary', true)->where('status', 'approved');
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)->where('status', 'active')->where('expires_at', '>', now());
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function sentInterests()
    {
        return $this->hasMany(Interest::class, 'sender_id');
    }

    public function receivedInterests()
    {
        return $this->hasMany(Interest::class, 'receiver_id');
    }

    public function profileViews()
    {
        return $this->hasMany(ProfileView::class, 'viewed_id');
    }

    public function viewedProfiles()
    {
        return $this->hasMany(ProfileView::class, 'viewer_id');
    }

    public function shortlists()
    {
        return $this->hasMany(Shortlist::class);
    }

    public function shortlistedBy()
    {
        return $this->hasMany(Shortlist::class, 'shortlisted_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'user_one_id')
            ->orWhere('user_two_id', $this->id);
    }

    public function blocks()
    {
        return $this->hasMany(Block::class, 'blocker_id');
    }

    // Helpers
    public function getAgeAttribute()
    {
        return $this->date_of_birth ? $this->date_of_birth->age : null;
    }

    public function isPremium(): bool
    {
        return $this->is_premium && $this->premium_expires_at && $this->premium_expires_at->isFuture();
    }

    public function isApproved(): bool
    {
        return $this->profile_status === 'approved';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasBlockedUser($userId): bool
    {
        return $this->blocks()->where('blocked_id', $userId)->exists();
    }

    public function getMaskedPhone(): string
    {
        return substr($this->phone, 0, 4) . '****' . substr($this->phone, -2);
    }
}
