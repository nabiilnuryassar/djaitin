<?php

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\User;

test('loyal customer gets loyalty discount when creating tailor order', function () {
    $user = User::factory()->kasir()->create();
    $customer = Customer::factory()->create();
    $measurement = Measurement::factory()->for($customer)->create();
    $garmentModel = GarmentModel::factory()->create();
    $fabric = Fabric::factory()->create();

    Order::factory()->count(6)->for($customer)->create([
        'order_type' => OrderType::Tailor,
        'status' => OrderStatus::Closed,
        'total_amount' => 100000,
        'paid_amount' => 100000,
        'outstanding_amount' => 0,
    ]);

    $this->actingAs($user)->post(route('office.orders.tailor.store'), [
        'customer_id' => $customer->id,
        'garment_model_id' => $garmentModel->id,
        'fabric_id' => $fabric->id,
        'measurement_id' => $measurement->id,
        'qty' => 2,
        'unit_price' => 100000,
        'payment' => [
            'method' => 'cash',
            'amount' => 100000,
        ],
    ])->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();

    expect((float) $order->discount_amount)->toBe(40000.0)
        ->and($order->is_loyalty_applied)->toBeTrue()
        ->and($order->user_id)->toBeNull()
        ->and($order->submittedBy)->toBeNull();
});

test('tailor order can not move to in progress when verified dp is below fifty percent', function () {
    $user = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'total_amount' => 200000,
        'paid_amount' => 80000,
        'outstanding_amount' => 120000,
        'status' => OrderStatus::PendingPayment,
    ]);

    $this->actingAs($user)->put(route('office.orders.status', $order), [
        'status' => OrderStatus::InProgress->value,
    ])->assertSessionHasErrors('status');
});

test('tailor order can not be closed when outstanding amount remains', function () {
    $user = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'total_amount' => 250000,
        'paid_amount' => 200000,
        'outstanding_amount' => 50000,
        'status' => OrderStatus::Done,
    ]);

    $this->actingAs($user)->put(route('office.orders.status', $order), [
        'status' => OrderStatus::Closed->value,
    ])->assertSessionHasErrors('status');
});
