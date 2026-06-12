<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

it('forbids kasir from rejecting transfer payment', function () {
    $kasir = User::factory()->kasir()->create();
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::PendingVerification,
            'created_by' => $admin->id,
            'verified_by' => null,
            'verified_at' => null,
        ]);

    $this->actingAs($kasir)
        ->post(route('office.payments.reject', $payment), [
            'rejection_reason' => 'Bukti transfer tidak valid.',
        ])
        ->assertForbidden();
});

it('allows admin to reject transfer payment', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::PendingVerification,
            'created_by' => $admin->id,
            'verified_by' => null,
            'verified_at' => null,
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.reject', $payment), [
            'rejection_reason' => 'Nomor referensi tidak cocok.',
        ])
        ->assertRedirect();

    expect($payment->fresh()->status)->toBe(PaymentStatus::Rejected);
});
