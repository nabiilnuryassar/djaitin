<?php

use App\Enums\OrderStatus;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\User;

it('uses config dp ratio when creating tailor order from office', function () {
    config(['djaitin.tailor.minimum_dp_ratio' => 0.3]);

    $kasir = User::factory()->kasir()->create();
    $customer = Customer::factory()->create();
    $measurement = Measurement::factory()->for($customer)->create();
    $garmentModel = GarmentModel::factory()->create();
    $fabric = Fabric::factory()->create();

    $this->actingAs($kasir)
        ->post(route('office.orders.tailor.store'), [
            'customer_id' => $customer->id,
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_id' => $measurement->id,
            'qty' => 1,
            'unit_price' => 200_000,
            'payment' => [
                'method' => 'cash',
                'amount' => 59_000,
            ],
        ])
        ->assertSessionHasErrors('payment.amount');

    $this->actingAs($kasir)
        ->post(route('office.orders.tailor.store'), [
            'customer_id' => $customer->id,
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_id' => $measurement->id,
            'qty' => 1,
            'unit_price' => 200_000,
            'payment' => [
                'method' => 'cash',
                'amount' => 60_000,
            ],
        ])
        ->assertRedirect();
});

it('uses config dp ratio when transitioning tailor order to in progress', function () {
    config(['djaitin.tailor.minimum_dp_ratio' => 0.3]);

    $admin = User::factory()->admin()->create();
    $order = Order::factory()->tailor()->create([
        'status' => OrderStatus::PendingPayment,
        'total_amount' => 1_000_000,
        'paid_amount' => 290_000,
        'outstanding_amount' => 710_000,
    ]);

    $this->actingAs($admin)
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::InProgress->value,
        ])
        ->assertSessionHasErrors('status');

    $order->update([
        'paid_amount' => 300_000,
        'outstanding_amount' => 700_000,
    ]);

    $this->actingAs($admin)
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::InProgress->value,
        ])
        ->assertRedirect();
});
