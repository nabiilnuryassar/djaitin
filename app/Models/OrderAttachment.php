<?php

namespace App\Models;

use App\Enums\OrderAttachmentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderAttachment extends Model
{
    /** @use HasFactory<\Database\Factories\OrderAttachmentFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'file_path',
        'file_name',
        'title',
        'notes',
        'attachment_type',
        'file_type',
        'uploaded_by',
    ];

    protected function casts(): array
    {
        return [
            'attachment_type' => OrderAttachmentType::class,
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
