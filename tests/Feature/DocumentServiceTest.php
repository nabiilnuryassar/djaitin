<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

test('nota is only available when an order has a verified payment', function () {
    /** @var \Tests\TestCase $this */
    $user = User::factory()->kasir()->create();
    $order = Order::factory()->create();

    $this->actingAs($user)
        ->get(route('office.orders.nota', $order))
        ->assertForbidden();

    Payment::factory()->for($order)->verified()->create();

    $this->actingAs($user)
        ->get(route('office.orders.nota', $order))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('kwitansi is only available for verified payments', function () {
    /** @var \Tests\TestCase $this */
    $user = User::factory()->kasir()->create();
    $pendingPayment = Payment::factory()->transfer()->create();
    $verifiedPayment = Payment::factory()->verified()->create();

    $this->actingAs($user)
        ->get(route('office.payments.kwitansi', $pendingPayment))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('office.payments.kwitansi', $verifiedPayment))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
