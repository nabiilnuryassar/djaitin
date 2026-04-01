<?php

namespace App\Services;

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

        $attachment = OrderAttachment::query()->create([
            'order_id' => $order->id,
            'file_path' => $file->store('order-attachments', 'public'),
            'file_name' => $file->getClientOriginalName(),
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
                'file_type' => $attachment->file_type,
            ],
            notes: 'Lampiran order diunggah.',
            ipAddress: $ipAddress,
        );

        return $attachment->refresh();
    }
}
