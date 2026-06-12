<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\OrderStatusService;

it('releases reserved stock when ready wear order is cancelled before verified payment', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'stock' => 5,
        'reserved_stock' => 2,
    ]);

    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::PendingPayment,
    ]);

    OrderItem::factory()
        ->for($order)
        ->for($product)
        ->create([
            'qty' => 2,
        ]);

    app(OrderStatusService::class)->cancelOrder($order, $admin, 'Customer membatalkan order.');

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and((int) $product->fresh()->reserved_stock)->toBe(0)
        ->and((int) $product->fresh()->stock)->toBe(5);
});

it('does not release stock when verified payment already exists', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create([
        'stock' => 3,
        'reserved_stock' => 0,
    ]);

    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::InProgress,
        'total_amount' => 300_000,
        'paid_amount' => 300_000,
        'outstanding_amount' => 0,
    ]);

    OrderItem::factory()
        ->for($order)
        ->for($product)
        ->create([
            'qty' => 2,
        ]);

    Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::Verified,
            'amount' => 300_000,
        ]);

    app(OrderStatusService::class)->cancelOrder($order, $admin, 'Order dibatalkan setelah lunas.');

    expect($order->fresh()->status)->toBe(OrderStatus::Cancelled)
        ->and((int) $product->fresh()->reserved_stock)->toBe(0)
        ->and((int) $product->fresh()->stock)->toBe(3);
});
