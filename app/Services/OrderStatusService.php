<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\ProductionStage;
use App\Models\Order;
use App\Models\User;
use App\Notifications\OrderInProgressNotification;
use App\Notifications\OrderReadyNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderStatusService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected LoyaltyService $loyaltyService,
        protected ConvectionOrderService $convectionOrderService,
    ) {}

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

            $refreshedOrder = $order->refresh();

            $this->notifyCustomerForStatus($refreshedOrder, $targetStatus);

            return $refreshedOrder;
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

        if ($targetStatus === OrderStatus::InProgress && $order->order_type === OrderType::Convection) {
            $this->convectionOrderService->validateFullPaymentGate($order);
        }

        if ($targetStatus === OrderStatus::Closed && ! $this->canClose($order)) {
            throw ValidationException::withMessages([
                'status' => 'Order tidak bisa ditutup selama masih ada sisa pembayaran.',
            ]);
        }
    }

    public function updateProductionStage(
        Order $order,
        ProductionStage $stage,
        User $user,
        ?string $ipAddress = null,
    ): Order {
        return DB::transaction(function () use ($order, $stage, $user, $ipAddress): Order {
            $oldStage = $order->production_stage;

            $order->update([
                'production_stage' => $stage,
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'order.production_stage_changed',
                auditable: $order,
                oldValues: ['production_stage' => $oldStage?->value],
                newValues: ['production_stage' => $stage->value],
                notes: 'Tahap produksi order diperbarui.',
                ipAddress: $ipAddress,
            );

            return $order->refresh();
        });
    }

    protected function notifyCustomerForStatus(Order $order, OrderStatus $targetStatus): void
    {
        $order->loadMissing(['customer.user', 'shipment']);

        $customerUser = $order->customer?->user;

        if ($customerUser === null) {
            return;
        }

        if ($targetStatus === OrderStatus::InProgress) {
            $customerUser->notify(new OrderInProgressNotification($order));
        }

        if ($targetStatus === OrderStatus::Done) {
            $deliveryMethod = $order->shipment !== null ? 'delivery' : 'pickup';

            $customerUser->notify(
                new OrderReadyNotification($order, $deliveryMethod),
            );
        }
    }
}
