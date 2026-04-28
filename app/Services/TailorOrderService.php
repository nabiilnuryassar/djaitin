<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Customer;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TailorOrderService
{
    public function __construct(
        protected LoyaltyService $loyaltyService,
        protected PaymentService $paymentService,
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * @param  array{
     *     customer_id: int,
     *     garment_model_id: int,
     *     fabric_id: int,
     *     measurement_id?: int|null,
     *     qty: int,
     *     unit_price: numeric-string|int|float,
     *     due_date?: string|null,
     *     spec_notes?: string|null,
     *     payment: array{
     *         method: string,
     *         amount: numeric-string|int|float,
     *         reference_number?: string|null,
     *         notes?: string|null
     *     }
     * }  $payload
     */
    public function create(
        array $payload,
        User $user,
        ?string $ipAddress = null,
        ?User $submittedBy = null,
    ): Order {
        return DB::transaction(function () use ($payload, $user, $ipAddress, $submittedBy): Order {
            $customer = Customer::query()->findOrFail($payload['customer_id']);
            $customer = $this->loyaltyService->syncCustomer($customer);

            $qty = (int) $payload['qty'];
            $unitPrice = round((float) $payload['unit_price'], 2);
            $subtotal = round($qty * $unitPrice, 2);
            $discountAmount = $this->loyaltyService->calculateDiscount($customer, $subtotal);
            $totalAmount = round($subtotal - $discountAmount, 2);
            $this->validateMinimumDownPayment(
                round((float) $payload['payment']['amount'], 2),
                $totalAmount,
            );

            $order = Order::query()->create([
                'order_number' => $this->nextOrderNumber(),
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customer->id,
                'user_id' => $submittedBy?->id,
                'created_by' => $user->id,
                'garment_model_id' => $payload['garment_model_id'],
                'fabric_id' => $payload['fabric_id'],
                'measurement_id' => $payload['measurement_id'] ?? null,
                'due_date' => $payload['due_date'] ?? null,
                'spec_notes' => $payload['spec_notes'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'outstanding_amount' => $totalAmount,
                'is_loyalty_applied' => $discountAmount > 0,
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'item_name' => $order->garmentModel()->firstOrFail()->name,
                'description' => $payload['spec_notes'] ?? null,
                'qty' => $qty,
                'unit_price' => $unitPrice,
                'discount_amount' => $discountAmount,
                'discount_percent' => $discountAmount > 0 ? $this->loyaltyService->getDiscountPercent() : 0,
                'subtotal' => $totalAmount,
            ]);

            $this->paymentService->record($order, $payload['payment'], $user, $ipAddress);

            $this->auditLogService->log(
                user: $user,
                action: 'order.created',
                auditable: $order,
                newValues: [
                    'order_type' => $order->order_type->value,
                    'status' => $order->status->value,
                    'total_amount' => (float) $order->total_amount,
                ],
                notes: 'Order tailor baru dibuat.',
                ipAddress: $ipAddress,
            );

            return $order->refresh();
        });
    }

    protected function nextOrderNumber(): string
    {
        return 'ORD-'.now()->format('YmdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    protected function validateMinimumDownPayment(float $paymentAmount, float $totalAmount): void
    {
        $minimumDownPayment = round($totalAmount * 0.5, 2);

        if ($paymentAmount < $minimumDownPayment) {
            throw ValidationException::withMessages([
                'payment.amount' => 'Order tailor wajib membayar DP minimal 50% dari total biaya.',
            ]);
        }
    }
}
