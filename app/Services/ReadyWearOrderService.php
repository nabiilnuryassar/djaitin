<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\ShipmentStatus;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Courier;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Shipment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ReadyWearOrderService
{
    public function __construct(
        protected CartService $cartService,
        protected StockService $stockService,
        protected PaymentService $paymentService,
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * @param  array{
     *     delivery_type: 'pickup'|'delivery',
     *     address_id?: int|null,
     *     courier_id?: int|null,
     *     payment: array{
     *         method: string,
     *         amount?: numeric-string|int|float|null,
     *         reference_number?: string|null,
     *         notes?: string|null,
     *         proof_image_path?: string|null
     *     }
     * }  $payload
     */
    public function createFromCart(
        Cart $cart,
        array $payload,
        User $user,
        ?string $ipAddress = null,
    ): Order {
        return DB::transaction(function () use ($cart, $payload, $user, $ipAddress): Order {
            $cart->loadMissing('items.product');

            if ($cart->items->isEmpty()) {
                throw ValidationException::withMessages([
                    'cart' => 'Keranjang masih kosong.',
                ]);
            }

            $customer = $user->customer()->firstOrFail();

            foreach ($cart->items as $item) {
                if ($item->product === null) {
                    throw ValidationException::withMessages([
                        'cart' => 'Salah satu produk di keranjang tidak lagi tersedia.',
                    ]);
                }

                $this->stockService->validateStock($item->product, $item->qty);
            }

            $courier = $payload['delivery_type'] === 'delivery'
                ? Courier::query()
                    ->whereKey($payload['courier_id'] ?? null)
                    ->where('is_active', true)
                    ->firstOrFail()
                : null;

            $shippingCost = $courier === null ? 0.0 : (float) $courier->base_fee;

            $subtotal = round($cart->items->sum(
                fn ($item): float => $item->qty * (float) $item->product->selling_price,
            ), 2);

            $discountAmount = round($cart->items->sum(
                fn ($item): float => $item->qty * (float) $item->product->discount_amount,
            ), 2);

            $totalAmount = round($subtotal - $discountAmount + $shippingCost, 2);

            $order = Order::query()->create([
                'order_number' => $this->nextOrderNumber(),
                'order_type' => OrderType::ReadyWear,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'created_by' => $user->id,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_cost' => $shippingCost,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'outstanding_amount' => $totalAmount,
                'spec_notes' => $payload['payment']['notes'] ?? null,
            ]);

            foreach ($cart->items as $item) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $item->product_id,
                    'item_name' => $item->product->name,
                    'description' => $item->product->description,
                    'size' => $item->product->size,
                    'qty' => $item->qty,
                    'unit_price' => $item->product->selling_price,
                    'discount_amount' => $item->product->discount_amount,
                    'discount_percent' => $item->product->discount_percent,
                    'subtotal' => $item->subtotalAmount(),
                ]);
            }

            if ($payload['delivery_type'] === 'delivery') {
                $address = Address::query()
                    ->whereKey($payload['address_id'])
                    ->where('customer_id', $customer->id)
                    ->firstOrFail();

                Shipment::query()->create([
                    'order_id' => $order->id,
                    'courier_id' => $courier?->id,
                    'status' => ShipmentStatus::Pending,
                    'recipient_name' => $address->recipient_name,
                    'recipient_address' => collect([
                        $address->address_line,
                        $address->city,
                        $address->province,
                        $address->postal_code,
                    ])->filter()->implode(', '),
                    'recipient_phone' => $address->phone,
                    'shipping_cost' => $shippingCost,
                ]);
            }

            if (($payload['payment']['method'] ?? null) === PaymentMethod::Transfer->value) {
                $this->paymentService->record(
                    $order,
                    $payload['payment'],
                    $user,
                    $ipAddress,
                );
            }

            $this->cartService->clear($cart);

            $this->auditLogService->log(
                user: $user,
                action: 'order.ready_wear_created',
                auditable: $order,
                newValues: [
                    'order_type' => $order->order_type->value,
                    'status' => $order->status->value,
                    'delivery_type' => $payload['delivery_type'],
                    'total_amount' => (float) $order->total_amount,
                ],
                notes: 'Order ready-to-wear baru dibuat dari keranjang customer.',
                ipAddress: $ipAddress,
            );

            return $order->refresh();
        });
    }

    protected function nextOrderNumber(): string
    {
        return 'ORD-'.now()->format('YmdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }
}
