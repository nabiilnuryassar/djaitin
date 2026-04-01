<?php

namespace App\Services;

use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\PaymentRejectedNotification;
use App\Notifications\PaymentVerifiedNotification;
use Illuminate\Http\UploadedFile;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected StockService $stockService,
    ) {}

    /**
     * @param  array{
     *     method: string,
     *     amount: numeric-string|int|float,
     *     reference_number?: string|null,
     *     notes?: string|null,
     *     proof_image_path?: string|null
     * }  $payload
     */
    public function record(Order $order, array $payload, User $user, ?string $ipAddress = null): Payment
    {
        $method = PaymentMethod::from($payload['method']);
        $amount = round((float) $payload['amount'], 2);
        $shouldDecrementStock = $method === PaymentMethod::Cash
            && $this->shouldDecrementStock($order);

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal pembayaran harus lebih besar dari nol.',
            ]);
        }

        if ($amount > (float) $order->outstanding_amount) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal pembayaran tidak boleh melebihi sisa tagihan order.',
            ]);
        }

        return DB::transaction(function () use ($order, $payload, $user, $ipAddress, $method, $amount, $shouldDecrementStock): Payment {
            $payment = Payment::query()->create([
                'payment_number' => $this->nextPaymentNumber(),
                'order_id' => $order->id,
                'method' => $method,
                'status' => $method === PaymentMethod::Cash
                    ? PaymentStatus::Verified
                    : PaymentStatus::PendingVerification,
                'amount' => $amount,
                'reference_number' => $payload['reference_number'] ?? null,
                'proof_image_path' => $payload['proof_image_path'] ?? null,
                'payment_date' => now(),
                'created_by' => $user->id,
                'verified_by' => $method === PaymentMethod::Cash ? $user->id : null,
                'verified_at' => $method === PaymentMethod::Cash ? now() : null,
                'notes' => $payload['notes'] ?? null,
            ]);

            if ($payment->status === PaymentStatus::Verified) {
                $this->updateOrderAmounts($order);

                if ($shouldDecrementStock) {
                    $this->stockService->decrementOnVerifiedPayment($order->refresh());
                }
            }

            $this->auditLogService->log(
                user: $user,
                action: 'payment.recorded',
                auditable: $payment,
                newValues: [
                    'status' => $payment->status->value,
                    'method' => $payment->method->value,
                    'amount' => (float) $payment->amount,
                ],
                notes: 'Pembayaran baru dicatat.',
                ipAddress: $ipAddress,
            );

            return $payment->refresh();
        });
    }

    public function uploadProof(
        Payment $payment,
        UploadedFile $proof,
        User $user,
        ?string $ipAddress = null,
    ): Payment {
        if ($payment->method !== PaymentMethod::Transfer) {
            throw ValidationException::withMessages([
                'payment' => 'Hanya pembayaran transfer yang dapat menerima bukti transfer.',
            ]);
        }

        return DB::transaction(function () use ($payment, $proof, $user, $ipAddress): Payment {
            $oldStatus = $payment->status;
            $proofPath = $proof->store('payments/proofs', 'public');

            $payment->update([
                'proof_image_path' => $proofPath,
                'status' => PaymentStatus::PendingVerification,
                'rejection_reason' => null,
                'verified_by' => null,
                'verified_at' => null,
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'payment.proof_uploaded',
                auditable: $payment,
                oldValues: ['status' => $oldStatus->value],
                newValues: [
                    'status' => $payment->status->value,
                    'proof_image_path' => $proofPath,
                ],
                notes: 'Bukti transfer diunggah ulang melalui portal customer.',
                ipAddress: $ipAddress,
            );

            return $payment->refresh();
        });
    }

    public function verifyTransfer(Payment $payment, User $user, ?string $ipAddress = null): Payment
    {
        $this->ensureTransferPending($payment);
        $order = $payment->order()->firstOrFail();
        $shouldDecrementStock = $this->shouldDecrementStock($order);

        $verifiedPayment = DB::transaction(function () use ($payment, $user, $ipAddress): Payment {
            $payment->update([
                'status' => PaymentStatus::Verified,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'rejection_reason' => null,
            ]);

            $this->updateOrderAmounts($payment->order()->firstOrFail());

            $this->auditLogService->log(
                user: $user,
                action: 'payment.verified',
                auditable: $payment,
                oldValues: ['status' => PaymentStatus::PendingVerification->value],
                newValues: ['status' => PaymentStatus::Verified->value],
                notes: 'Transfer berhasil diverifikasi.',
                ipAddress: $ipAddress,
            );

            return $payment->refresh();
        });

        if ($shouldDecrementStock) {
            $this->stockService->decrementOnVerifiedPayment($order->refresh());
        }

        $refreshedOrder = $order->refresh();

        $this->notifyCustomer(
            $refreshedOrder,
            new PaymentVerifiedNotification($refreshedOrder, $verifiedPayment),
        );

        return $verifiedPayment;
    }

    public function reject(Payment $payment, User $user, string $reason, ?string $ipAddress = null): Payment
    {
        $this->ensureTransferPending($payment);

        $rejectedPayment = DB::transaction(function () use ($payment, $user, $reason, $ipAddress): Payment {
            $payment->update([
                'status' => PaymentStatus::Rejected,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'rejection_reason' => $reason,
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'payment.rejected',
                auditable: $payment,
                oldValues: ['status' => PaymentStatus::PendingVerification->value],
                newValues: [
                    'status' => PaymentStatus::Rejected->value,
                    'rejection_reason' => $reason,
                ],
                notes: 'Transfer ditolak.',
                ipAddress: $ipAddress,
            );

            return $payment->refresh();
        });

        $this->notifyCustomer(
            $rejectedPayment->order()->firstOrFail(),
            new PaymentRejectedNotification(
                $rejectedPayment->order()->firstOrFail(),
                $rejectedPayment,
                $reason,
            ),
        );

        return $rejectedPayment;
    }

    public function updateOrderAmounts(Order $order): Order
    {
        $verifiedAmount = (float) $order->payments()
            ->where('status', PaymentStatus::Verified)
            ->sum('amount');

        $outstandingAmount = max((float) $order->total_amount - $verifiedAmount, 0);

        $order->update([
            'paid_amount' => $verifiedAmount,
            'outstanding_amount' => $outstandingAmount,
        ]);

        return $order->refresh();
    }

    protected function ensureTransferPending(Payment $payment): void
    {
        if (
            $payment->method !== PaymentMethod::Transfer
            || $payment->status !== PaymentStatus::PendingVerification
        ) {
            throw ValidationException::withMessages([
                'payment' => 'Hanya transfer dengan status pending verification yang bisa diproses.',
            ]);
        }
    }

    protected function nextPaymentNumber(): string
    {
        return 'PAY-'.now()->format('YmdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    protected function shouldDecrementStock(Order $order): bool
    {
        return $order->order_type === OrderType::ReadyWear
            && ! $order->payments()
                ->where('status', PaymentStatus::Verified)
                ->exists();
    }

    protected function notifyCustomer(Order $order, Notification $notification): void
    {
        $order->loadMissing('customer.user');

        $order->customer?->user?->notify($notification);
    }
}
