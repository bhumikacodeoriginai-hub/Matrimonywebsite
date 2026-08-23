<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id', 'package_id', 'payment_gateway', 'gateway_order_id',
        'gateway_payment_id', 'gateway_signature', 'amount', 'currency',
        'status', 'gateway_response', 'receipt_number', 'failure_reason',
    ];

    protected $casts = [
        'gateway_response' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(SubscriptionPackage::class, 'package_id');
    }
}
