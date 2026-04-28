<?php

namespace App\Services;

use App\Enums\OrderAttachmentType;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductionStage;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConvectionOrderService
{
    public function __construct(
        protected PaymentService $paymentService,
        protected AttachmentService $attachmentService,
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * Buat order konveksi baru dengan pembayaran penuh.
     *
     * Sesuai PRD: customer wajib menyertakan item + harga + full payment.
     * Tidak ada flow quotation/request_quote.
     *
     * @param  array{
     *     company_name: string,
     *     spec_notes?: string|null,
     *     reference_file: UploadedFile,
     *     items: array<int, array{
     *         item_name: string,
     *         qty: int,
     *         unit_price: numeric-string|int|float,
     *         description?: string|null
     *     }>,
     *     payment: array{
     *         method: string,
     *         amount: numeric-string|int|float,
     *         reference_number?: string|null,
     *         notes?: string|null,
     *         proof_image_path?: string|null
     *     }
     * }  $payload
     */
    public function create(array $payload, User $user, ?string $ipAddress = null): Order
    {
        return DB::transaction(function () use ($payload, $user, $ipAddress): Order {
            $customer = $user->customer()->firstOrFail();
            $subtotal = round(collect($payload['items'])->sum(
                fn (array $item): float => (int) $item['qty'] * round((float) ($item['unit_price'] ?? 0), 2),
            ), 2);
            $paymentAmount = round((float) data_get($payload, 'payment.amount', 0), 2);

            if ($subtotal <= 0) {
                throw ValidationException::withMessages([
                    'items' => 'Total item konveksi harus lebih besar dari nol.',
                ]);
            }

            if ($paymentAmount !== $subtotal) {
                throw ValidationException::withMessages([
                    'payment.amount' => 'Konveksi wajib dibayar penuh sesuai total pesanan.',
                ]);
            }

            $order = Order::query()->create([
                'order_number' => $this->nextOrderNumber(),
                'order_type' => OrderType::Convection,
                'status' => OrderStatus::PendingPayment,
                'production_stage' => ProductionStage::Design,
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'created_by' => $user->id,
                'company_name' => $payload['company_name'],
                'spec_notes' => $payload['spec_notes'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'shipping_cost' => 0,
                'total_amount' => $subtotal,
                'paid_amount' => 0,
                'outstanding_amount' => $subtotal,
                'is_loyalty_applied' => false,
            ]);

            foreach ($payload['items'] as $item) {
                $unitPrice = round((float) ($item['unit_price'] ?? 0), 2);

                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'item_name' => $item['item_name'],
                    'description' => $item['description'] ?? null,
                    'qty' => (int) $item['qty'],
                    'unit_price' => $unitPrice,
                    'discount_amount' => 0,
                    'discount_percent' => 0,
                    'subtotal' => round((int) $item['qty'] * $unitPrice, 2),
                ]);
            }

            $this->paymentService->record($order, [
                'method' => $payload['payment']['method'],
                'amount' => $paymentAmount,
                'reference_number' => $payload['payment']['reference_number'] ?? null,
                'notes' => $payload['payment']['notes'] ?? null,
                'proof_image_path' => $payload['payment']['method'] === PaymentMethod::Transfer->value
                    ? ($payload['payment']['proof_image_path'] ?? null)
                    : null,
            ], $user, $ipAddress);

            $this->attachmentService->upload(
                $order,
                $payload['reference_file'],
                $user,
                [
                    'title' => 'Referensi awal customer',
                    'notes' => $payload['spec_notes'] ?? null,
                    'attachment_type' => OrderAttachmentType::Reference,
                ],
                $ipAddress,
            );

            $this->auditLogService->log(
                user: $user,
                action: 'order.convection_created',
                auditable: $order,
                newValues: [
                    'order_type' => $order->order_type->value,
                    'status' => $order->status->value,
                    'production_stage' => $order->production_stage?->value,
                    'company_name' => $order->company_name,
                    'total_amount' => (float) $order->total_amount,
                ],
                notes: 'Order konveksi baru dibuat dari customer portal.',
                ipAddress: $ipAddress,
            );

            return $order->refresh();
        });
    }

    public function validateFullPaymentGate(Order $order): void
    {
        $hasVerifiedPayment = $order->payments()
            ->where('status', PaymentStatus::Verified)
            ->exists();

        if ((float) $order->outstanding_amount > 0 || ! $hasVerifiedPayment) {
            throw ValidationException::withMessages([
                'status' => 'Order konveksi hanya bisa masuk produksi setelah pembayaran lunas terverifikasi.',
            ]);
        }
    }

    protected function nextOrderNumber(): string
    {
        return 'CNV-'.now()->format('YmdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }
}
