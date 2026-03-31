<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Order;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected LoyaltyService $loyaltyService,
    ) {
    }

    public function canClose(Order $order): bool
    {
        return (float) $order->outstanding_amount <= 0;
    }

    public function transition(
        Order $order,
        OrderStatus $targetStatus,
        User $user,
        ?string $ipAddress = null,
    ): Order {
        $this->validateTransition($order, $targetStatus);

        return DB::transaction(function () use ($order, $targetStatus, $user, $ipAddress): Order {
            $oldStatus = $order->status;

            $order->update([
                'status' => $targetStatus,
            ]);

            if ($targetStatus === OrderStatus::Closed) {
                $this->loyaltyService->syncCustomer($order->customer()->firstOrFail());
            }

            $this->auditLogService->log(
                user: $user,
                action: 'order.status_changed',
                auditable: $order,
                oldValues: ['status' => $oldStatus->value],
                newValues: ['status' => $targetStatus->value],
                notes: 'Status order diperbarui.',
                ipAddress: $ipAddress,
            );

            return $order->refresh();
        });
    }

    public function validateTransition(Order $order, OrderStatus $targetStatus): void
    {
        if ($order->status === $targetStatus) {
            throw ValidationException::withMessages([
                'status' => 'Status tujuan sama dengan status saat ini.',
            ]);
        }

        if ($targetStatus === OrderStatus::InProgress && $order->order_type === OrderType::Tailor) {
            $paidRatio = $order->total_amount > 0
                ? ((float) $order->paid_amount / (float) $order->total_amount)
                : 0;

            if ($paidRatio < 0.5) {
                throw ValidationException::withMessages([
                    'status' => 'Order tailor hanya bisa dimulai jika pembayaran terverifikasi minimal 50% dari total.',
                ]);
            }
        }

        if ($targetStatus === OrderStatus::Closed && ! $this->canClose($order)) {
            throw ValidationException::withMessages([
                'status' => 'Order tidak bisa ditutup selama masih ada sisa pembayaran.',
            ]);
        }
    }
}
