<?php

use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;

test('cash payment is immediately verified and updates order amounts', function () {
    /** @var \Tests\TestCase $this */
    $user = User::factory()->kasir()->create();
    $order = Order::factory()->create([
        'total_amount' => 300000,
        'paid_amount' => 0,
        'outstanding_amount' => 300000,
    ]);

    $this->actingAs($user)->post(route('office.payments.store', $order), [
        'method' => 'cash',
        'amount' => 120000,
    ])->assertRedirect();

    $payment = $order->payments()->firstOrFail();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Verified)
        ->and((float) $order->paid_amount)->toBe(120000.0)
        ->and((float) $order->outstanding_amount)->toBe(180000.0);
});

test('transfer payment stays pending until verified and writes audit log when verified', function () {
    /** @var \Tests\TestCase $this */
    $kasir = User::factory()->kasir()->create();
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create([
        'total_amount' => 200000,
        'paid_amount' => 0,
        'outstanding_amount' => 200000,
    ]);

    $this->actingAs($kasir)->post(route('office.payments.store', $order), [
        'method' => 'transfer',
        'amount' => 100000,
        'reference_number' => 'TRX-001',
    ])->assertRedirect();

    $payment = $order->payments()->firstOrFail();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::PendingVerification)
        ->and((float) $order->paid_amount)->toBe(0.0);

    $this->actingAs($admin)->post(route('office.payments.verify', $payment))
        ->assertRedirect();

    $payment->refresh();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Verified)
        ->and((float) $order->paid_amount)->toBe(100000.0)
        ->and(AuditLog::query()->where('action', 'payment.verified')->count())->toBe(1);
});

test('admin can reject transfer payment with a reason', function () {
    /** @var \Tests\TestCase $this */
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    $payment = $order->payments()->create([
        'payment_number' => 'PAY-TEST-001',
        'method' => 'transfer',
        'status' => 'pending_verification',
        'amount' => 50000,
        'reference_number' => 'TRX-REJECT-1',
        'payment_date' => now(),
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)->post(route('office.payments.reject', $payment), [
        'rejection_reason' => 'Bukti transfer tidak sesuai.',
    ])->assertRedirect();

    $payment->refresh();

    expect($payment->status)->toBe(PaymentStatus::Rejected)
        ->and($payment->rejection_reason)->toBe('Bukti transfer tidak sesuai.');
});
