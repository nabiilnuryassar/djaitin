<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('customer dashboard summary only includes owned records', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    $foreignUser = User::factory()->customer()->create();
    $foreignCustomer = $foreignUser->customer()->firstOrFail();

    Order::factory()->for($customer)->create([
        'status' => OrderStatus::PendingPayment,
    ]);

    Order::factory()->for($foreignCustomer)->create([
        'status' => OrderStatus::PendingPayment,
    ]);

    Measurement::factory()->for($customer)->create();
    Measurement::factory()->for($foreignCustomer)->create();

    $ownedOrder = Order::factory()->for($customer)->create();
    $foreignOrder = Order::factory()->for($foreignCustomer)->create();

    Payment::factory()->for($ownedOrder)->transfer()->create([
        'status' => PaymentStatus::Rejected,
    ]);

    Payment::factory()->for($foreignOrder)->transfer()->create([
        'status' => PaymentStatus::Rejected,
    ]);

    $this->actingAs($user)
        ->get(route('customer.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Dashboard/Index')
            ->where('summary.active_orders', 2)
            ->where('summary.pending_payments', 1)
            ->where('summary.saved_measurements', 1),
        );
});

test('customer can only access owned orders and payments', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    $foreignUser = User::factory()->customer()->create();
    $foreignCustomer = $foreignUser->customer()->firstOrFail();

    $ownedOrder = Order::factory()->for($customer)->create();
    $foreignOrder = Order::factory()->for($foreignCustomer)->create();
    $ownedPayment = Payment::factory()->for($ownedOrder)->transfer()->create([
        'method' => PaymentMethod::Transfer,
        'status' => PaymentStatus::Rejected,
    ]);
    $foreignPayment = Payment::factory()->for($foreignOrder)->transfer()->create([
        'method' => PaymentMethod::Transfer,
        'status' => PaymentStatus::Rejected,
    ]);

    $this->actingAs($user)
        ->get(route('customer.orders.show', $ownedOrder))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('customer.orders.show', $foreignOrder))
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $foreignPayment), [
            'proof' => \Illuminate\Http\UploadedFile::fake()->image('foreign-proof.jpg'),
        ])
        ->assertForbidden();

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $ownedPayment), [
            'proof' => \Illuminate\Http\UploadedFile::fake()->image('owned-proof.jpg'),
        ])
        ->assertRedirect();
});
