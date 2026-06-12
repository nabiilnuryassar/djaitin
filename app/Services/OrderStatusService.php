<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentStatus;
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
        protected StockService $stockService,
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
            $minimumRatio = (float) config('djaitin.tailor.minimum_dp_ratio', 0.5);
            $paidRatio = $order->total_amount > 0
                ? ((float) $order->paid_amount / (float) $order->total_amount)
                : 0;

            if ($paidRatio < $minimumRatio) {
                $percentageLabel = (int) round($minimumRatio * 100);

                throw ValidationException::withMessages([
                    'status' => "Order tailor hanya bisa dimulai jika pembayaran terverifikasi minimal {$percentageLabel}% dari total.",
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

    public function cancelOrder(
        Order $order,
        User $user,
        string $reason,
        ?string $ipAddress = null,
    ): Order {
        if (in_array($order->status, [OrderStatus::Closed, OrderStatus::Cancelled], true)) {
            throw ValidationException::withMessages([
                'status' => "Order dengan status {$order->status->value} tidak dapat dibatalkan.",
            ]);
        }

        return DB::transaction(function () use ($order, $user, $reason, $ipAddress): Order {
            $order = Order::query()
                ->whereKey($order->id)
                ->lockForUpdate()
                ->firstOrFail();

            $previousStatus = $order->status;
            $hasVerifiedPayment = $order->payments()
                ->where('status', PaymentStatus::Verified)
                ->exists();

            if ($order->order_type === OrderType::ReadyWear && ! $hasVerifiedPayment) {
                $order->loadMissing('items.product');

                foreach ($order->items as $item) {
                    if ($item->product === null) {
                        continue;
                    }

                    $this->stockService->release($item->product, (int) $item->qty);
                }
            }

            $order->update([
                'status' => OrderStatus::Cancelled,
                'cancellation_reason' => $reason,
                'cancelled_by' => $user->id,
                'cancelled_at' => now(),
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'order.cancelled',
                auditable: $order,
                oldValues: ['status' => $previousStatus->value],
                newValues: [
                    'status' => OrderStatus::Cancelled->value,
                    'reason' => $reason,
                ],
                notes: 'Order dibatalkan.',
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
