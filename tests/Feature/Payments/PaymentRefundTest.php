<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;

it('refunds a verified payment and cancels the order', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()
        ->readyWear()
        ->create([
            'status' => OrderStatus::InProgress,
            'total_amount' => 500_000,
            'paid_amount' => 500_000,
            'outstanding_amount' => 0,
        ]);

    $payment = Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::Verified,
            'amount' => 500_000,
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'Customer membatalkan pesanan.',
        ])
        ->assertRedirect();

    $payment->refresh();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Refunded)
        ->and($payment->refund_reason)->toBe('Customer membatalkan pesanan.')
        ->and($order->status)->toBe(OrderStatus::Cancelled)
        ->and((float) $order->paid_amount)->toBe(0.0)
        ->and((float) $order->outstanding_amount)->toBe(500000.0);
});

it('forbids kasir from refunding payment', function () {
    $kasir = User::factory()->kasir()->create();
    $order = Order::factory()->readyWear()->create();
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::Verified,
        ]);

    $this->actingAs($kasir)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'Kasir mencoba refund.',
        ])
        ->assertForbidden();
});

it('rejects refund for unverified payment', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->readyWear()->create();
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::PendingVerification,
            'verified_by' => null,
            'verified_at' => null,
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'Belum diverifikasi.',
        ])
        ->assertSessionHasErrors('payment');
});

it('rejects refund when reason is too short', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->readyWear()->create();
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::Verified,
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'no',
        ])
        ->assertSessionHasErrors('reason');

    expect($payment->fresh()->status)->toBe(PaymentStatus::Verified);
});

it('records audit log entry on refund', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()
        ->readyWear()
        ->create([
            'status' => OrderStatus::InProgress,
            'total_amount' => 250_000,
            'paid_amount' => 250_000,
            'outstanding_amount' => 0,
        ]);
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'status' => PaymentStatus::Verified,
            'amount' => 250_000,
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'Customer berubah pikiran.',
        ])
        ->assertRedirect();

    expect(
        AuditLog::query()
            ->where('action', 'payment.refunded')
            ->where('auditable_type', Payment::class)
            ->where('auditable_id', $payment->id)
            ->where('user_id', $admin->id)
            ->exists()
    )->toBeTrue();
});

it('refunds verified transfer payment', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()
        ->readyWear()
        ->create([
            'status' => OrderStatus::InProgress,
            'total_amount' => 400_000,
            'paid_amount' => 400_000,
            'outstanding_amount' => 0,
        ]);
    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::Verified,
            'amount' => 400_000,
            'reference_number' => 'TRX-REFUND-001',
        ]);

    $this->actingAs($admin)
        ->post(route('office.payments.refund', $payment), [
            'reason' => 'Transfer dikembalikan ke customer.',
        ])
        ->assertRedirect();

    $payment->refresh();
    $order->refresh();

    expect($payment->status)->toBe(PaymentStatus::Refunded)
        ->and($payment->refunded_by)->toBe($admin->id)
        ->and($payment->refunded_at)->not->toBeNull()
        ->and($order->status)->toBe(OrderStatus::Cancelled)
        ->and((float) $order->paid_amount)->toBe(0.0)
        ->and((float) $order->outstanding_amount)->toBe(400000.0);
});
