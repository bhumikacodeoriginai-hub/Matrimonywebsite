<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfileView extends Model
{
    protected $fillable = ['viewer_id', 'viewed_id'];

    public function viewer()
    {
        return $this->belongsTo(User::class, 'viewer_id');
    }

    public function viewed()
    {
        return $this->belongsTo(User::class, 'viewed_id');
    }
}
