<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shortlist extends Model
{
    protected $fillable = ['user_id', 'shortlisted_id', 'note'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shortlistedUser()
    {
        return $this->belongsTo(User::class, 'shortlisted_id');
    }
}
