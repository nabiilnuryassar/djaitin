<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentRefundService
{
    public function __construct(
        protected OrderStatusService $orderStatusService,
        protected PaymentService $paymentService,
        protected AuditLogService $auditLogService,
    ) {}

    public function refund(
        Payment $payment,
        string $reason,
        User $user,
        ?string $ipAddress = null,
    ): Payment {
        return DB::transaction(function () use ($payment, $reason, $user, $ipAddress): Payment {
            $payment = Payment::query()
                ->whereKey($payment->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($payment->status !== PaymentStatus::Verified) {
                throw ValidationException::withMessages([
                    'payment' => 'Hanya pembayaran berstatus verified yang dapat di-refund.',
                ]);
            }

            $order = $payment->order()->firstOrFail();

            $payment->update([
                'status' => PaymentStatus::Refunded,
                'refunded_at' => now(),
                'refunded_by' => $user->id,
                'refund_reason' => $reason,
            ]);

            $updatedOrder = $this->paymentService->updateOrderAmounts($order);

            if (! in_array($updatedOrder->status, [OrderStatus::Closed, OrderStatus::Cancelled], true)) {
                $updatedOrder = $this->orderStatusService->cancelOrder(
                    $updatedOrder,
                    $user,
                    "refund: {$reason}",
                    $ipAddress,
                );
            }

            $this->auditLogService->log(
                user: $user,
                action: 'payment.refunded',
                auditable: $payment,
                oldValues: ['status' => PaymentStatus::Verified->value],
                newValues: [
                    'status' => PaymentStatus::Refunded->value,
                    'reason' => $reason,
                    'order_status' => $updatedOrder->status->value,
                ],
                notes: 'Pembayaran direfund oleh office.',
                ipAddress: $ipAddress,
            );

            return $payment->refresh();
        });
    }
}
