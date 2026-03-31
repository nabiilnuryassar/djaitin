<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Measurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'label',
        'chest',
        'waist',
        'hips',
        'shoulder',
        'sleeve_length',
        'shirt_length',
        'inseam',
        'trouser_waist',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'chest' => 'decimal:2',
            'waist' => 'decimal:2',
            'hips' => 'decimal:2',
            'shoulder' => 'decimal:2',
            'sleeve_length' => 'decimal:2',
            'shirt_length' => 'decimal:2',
            'inseam' => 'decimal:2',
            'trouser_waist' => 'decimal:2',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
