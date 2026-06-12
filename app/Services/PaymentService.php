<?php

namespace App\Services;

use App\Enums\OrderStatus;
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
use Illuminate\Support\Facades\Storage;
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
        $proofImagePath = $payload['proof_image_path'] ?? null;

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal pembayaran harus lebih besar dari nol.',
            ]);
        }

        if ($method === PaymentMethod::Transfer && blank($proofImagePath)) {
            throw ValidationException::withMessages([
                'proof' => 'Bukti transfer wajib dilampirkan.',
            ]);
        }

        return DB::transaction(function () use ($order, $payload, $user, $ipAddress, $method, $amount, $proofImagePath): Payment {
            $lockedOrder = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->validateRecordAmount($lockedOrder, $amount);

            if ($method === PaymentMethod::Transfer) {
                $this->ensureNoPendingVerificationExists($lockedOrder);
            }

            $shouldDecrementStock = $method === PaymentMethod::Cash
                && $this->shouldDecrementStock($lockedOrder);

            $payment = Payment::query()->create([
                'payment_number' => $this->nextPaymentNumber(),
                'order_id' => $lockedOrder->id,
                'method' => $method,
                'status' => $method === PaymentMethod::Cash
                    ? PaymentStatus::Verified
                    : PaymentStatus::PendingVerification,
                'amount' => $amount,
                'reference_number' => $payload['reference_number'] ?? null,
                'proof_image_path' => $proofImagePath,
                'payment_date' => now(),
                'created_by' => $user->id,
                'verified_by' => $method === PaymentMethod::Cash ? $user->id : null,
                'verified_at' => $method === PaymentMethod::Cash ? now() : null,
                'notes' => $payload['notes'] ?? null,
            ]);

            if ($payment->status === PaymentStatus::Verified) {
                $refreshedOrder = $this->updateOrderAmounts($lockedOrder);

                if ($shouldDecrementStock) {
                    $this->stockService->decrementOnVerifiedPayment($refreshedOrder);
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
        $proofResult = DB::transaction(function () use ($payment, $proof, $user, $ipAddress): array {
            $payment = Payment::query()
                ->with('order')
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureCanUploadProof($payment);

            $oldStatus = $payment->status;
            $proofPath = $proof->store('payments/proofs', 'public');
            $oldProofPath = $payment->proof_image_path;

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

            return [
                'payment' => $payment->refresh(),
                'old_proof_path' => $oldProofPath,
                'new_proof_path' => $proofPath,
            ];
        });

        $oldProofPath = $proofResult['old_proof_path'];
        $newProofPath = $proofResult['new_proof_path'];

        if ($oldProofPath !== null && $oldProofPath !== $newProofPath && Storage::disk('public')->exists($oldProofPath)) {
            Storage::disk('public')->delete($oldProofPath);
        }

        return $proofResult['payment'];
    }

    public function verifyTransfer(Payment $payment, User $user, ?string $ipAddress = null): Payment
    {
        $verified = DB::transaction(function () use ($payment, $user, $ipAddress): array {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTransferPending($payment);

            $lockedOrder = Order::query()
                ->whereKey($payment->order_id)
                ->lockForUpdate()
                ->firstOrFail();

            $shouldDecrementStock = $this->shouldDecrementStock($lockedOrder);

            $payment->update([
                'status' => PaymentStatus::Verified,
                'verified_by' => $user->id,
                'verified_at' => now(),
                'rejection_reason' => null,
            ]);

            $updatedOrder = $this->updateOrderAmounts($lockedOrder);

            if ($shouldDecrementStock) {
                $this->stockService->decrementOnVerifiedPayment($updatedOrder);
            }

            $this->auditLogService->log(
                user: $user,
                action: 'payment.verified',
                auditable: $payment,
                oldValues: ['status' => PaymentStatus::PendingVerification->value],
                newValues: ['status' => PaymentStatus::Verified->value],
                notes: 'Transfer berhasil diverifikasi.',
                ipAddress: $ipAddress,
            );

            return [
                'payment' => $payment->refresh(),
                'order' => $updatedOrder->refresh(),
            ];
        });

        $this->notifyCustomer(
            $verified['order'],
            new PaymentVerifiedNotification($verified['order'], $verified['payment']),
        );

        return $verified['payment'];
    }

    public function reject(Payment $payment, User $user, string $reason, ?string $ipAddress = null): Payment
    {
        $rejectedPayment = DB::transaction(function () use ($payment, $user, $reason, $ipAddress): Payment {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTransferPending($payment);

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
        $lockedOrder = Order::query()
            ->whereKey($order->id)
            ->lockForUpdate()
            ->firstOrFail();

        $verifiedAmount = (float) $lockedOrder->payments()
            ->where('status', PaymentStatus::Verified)
            ->sum('amount');

        $outstandingAmount = max((float) $lockedOrder->total_amount - $verifiedAmount, 0);

        $lockedOrder->update([
            'paid_amount' => $verifiedAmount,
            'outstanding_amount' => $outstandingAmount,
        ]);

        return $lockedOrder->refresh();
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

    protected function ensureCanUploadProof(Payment $payment): void
    {
        if ($payment->method !== PaymentMethod::Transfer) {
            throw ValidationException::withMessages([
                'payment' => 'Hanya pembayaran transfer yang dapat menerima bukti transfer.',
            ]);
        }

        if (! in_array($payment->status, [PaymentStatus::PendingVerification, PaymentStatus::Rejected], true)) {
            throw ValidationException::withMessages([
                'payment' => 'Status pembayaran saat ini tidak dapat menerima upload bukti transfer.',
            ]);
        }

        $orderStatus = $payment->order?->status;
        if (in_array($orderStatus, [OrderStatus::Closed, OrderStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'payment' => 'Order terkait sudah ditutup. Upload bukti transfer tidak diizinkan.',
            ]);
        }
    }

    protected function validateRecordAmount(Order $order, float $amount): void
    {
        if ($amount > (float) $order->outstanding_amount) {
            throw ValidationException::withMessages([
                'amount' => 'Nominal pembayaran tidak boleh melebihi sisa tagihan order.',
            ]);
        }
    }

    protected function ensureNoPendingVerificationExists(Order $order): void
    {
        $hasPendingVerification = $order->payments()
            ->where('status', PaymentStatus::PendingVerification)
            ->exists();

        if ($hasPendingVerification) {
            throw ValidationException::withMessages([
                'payment' => 'Masih ada pembayaran yang menunggu verifikasi.',
            ]);
        }
    }

    protected function notifyCustomer(Order $order, Notification $notification): void
    {
        $order->loadMissing('customer.user');

        $order->customer?->user?->notify($notification);
    }
}
