<?php

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderStatusService;
use Illuminate\Validation\ValidationException;

function transitionService(): OrderStatusService
{
    return app(OrderStatusService::class);
}

test('order walks the full lifecycle through valid transitions', function (): void {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::PendingPayment,
        'paid_amount' => 500000,
        'total_amount' => 500000,
        'outstanding_amount' => 0,
    ]);

    $service = transitionService();

    foreach ([
        OrderStatus::InProgress,
        OrderStatus::Done,
        OrderStatus::Delivered,
        OrderStatus::Closed,
    ] as $target) {
        $order = $service->transition($order->fresh(), $target, $admin);
        expect($order->status)->toBe($target);
    }
});

test('illegal jump from pending_payment to delivered is rejected', function (): void {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::PendingPayment,
    ]);

    transitionService()->transition($order, OrderStatus::Delivered, $admin);
})->throws(ValidationException::class);

test('terminal status cannot transition out', function (): void {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->closed()->create();

    transitionService()->transition($order, OrderStatus::InProgress, $admin);
})->throws(ValidationException::class);

test('produksi may only move in_progress to done', function (): void {
    $produksi = User::factory()->produksi()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::InProgress,
    ]);

    $allowed = transitionService()->allowedTargets($order, $produksi);

    expect($allowed)->toBe([OrderStatus::Done]);
});

test('produksi cannot push order to delivered via http', function (): void {
    $produksi = User::factory()->produksi()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::InProgress,
    ]);

    $this->actingAs($produksi)
        ->from(route('office.orders.show', $order))
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::Delivered->value,
        ])
        ->assertRedirect(route('office.orders.show', $order))
        ->assertSessionHasErrors('status');

    expect($order->refresh()->status)->toBe(OrderStatus::InProgress);
});

test('kasir may close a fully paid order via http', function (): void {
    $kasir = User::factory()->kasir()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::Delivered,
        'paid_amount' => 500000,
        'total_amount' => 500000,
        'outstanding_amount' => 0,
    ]);

    $this->actingAs($kasir)
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::Closed->value,
        ])
        ->assertRedirect();

    expect($order->refresh()->status)->toBe(OrderStatus::Closed);
});

test('order cannot be closed while outstanding balance remains', function (): void {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->readyWear()->create([
        'status' => OrderStatus::Delivered,
        'paid_amount' => 100000,
        'total_amount' => 500000,
        'outstanding_amount' => 400000,
    ]);

    transitionService()->transition($order, OrderStatus::Closed, $admin);
})->throws(ValidationException::class);
