<?php

namespace App\Services;

use App\Enums\OrderAttachmentType;
use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\File;

class AttachmentService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function upload(
        Order $order,
        UploadedFile $file,
        User $user,
        array $metadata = [],
        ?string $ipAddress = null,
    ): OrderAttachment {
        Validator::validate([
            'file' => $file,
        ], [
            'file' => [
                'required',
                File::types(['jpg', 'jpeg', 'png', 'pdf'])->max(5 * 1024),
            ],
        ]);

        $attachmentType = $metadata['attachment_type'] instanceof OrderAttachmentType
            ? $metadata['attachment_type']
            : OrderAttachmentType::from($metadata['attachment_type'] ?? OrderAttachmentType::Other->value);

        $attachment = OrderAttachment::query()->create([
            'order_id' => $order->id,
            'file_path' => $file->store('order-attachments', 'public'),
            'file_name' => $file->getClientOriginalName(),
            'title' => $metadata['title'] ?? null,
            'notes' => $metadata['notes'] ?? null,
            'attachment_type' => $attachmentType,
            'file_type' => $file->getClientMimeType() ?? $file->getMimeType() ?? 'application/octet-stream',
            'uploaded_by' => $user->id,
        ]);

        $this->auditLogService->log(
            user: $user,
            action: 'order.attachment_uploaded',
            auditable: $attachment,
            newValues: [
                'order_id' => $order->id,
                'file_name' => $attachment->file_name,
                'attachment_type' => $attachment->attachment_type->value,
                'file_type' => $attachment->file_type,
            ],
            notes: 'Lampiran order diunggah.',
            ipAddress: $ipAddress,
        );

        return $attachment->refresh();
    }
}
