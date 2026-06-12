<?php

use App\Models\Order;
use App\Models\User;

it('rejects large cash payment without proof', function () {
    config(['djaitin.payment.cash_proof_required_above' => 1_000_000]);

    $kasir = User::factory()->kasir()->create();
    $order = Order::factory()->create([
        'total_amount' => 5_000_000,
        'paid_amount' => 0,
        'outstanding_amount' => 5_000_000,
    ]);

    $this->actingAs($kasir)
        ->post(route('office.payments.store', $order), [
            'method' => 'cash',
            'amount' => 5_000_000,
            'reference_number' => 'CASH-001',
        ])
        ->assertSessionHasErrors('proof');
});

it('accepts small cash payment without proof', function () {
    config(['djaitin.payment.cash_proof_required_above' => 1_000_000]);

    $kasir = User::factory()->kasir()->create();
    $order = Order::factory()->create([
        'total_amount' => 500_000,
        'paid_amount' => 0,
        'outstanding_amount' => 500_000,
    ]);

    $this->actingAs($kasir)
        ->post(route('office.payments.store', $order), [
            'method' => 'cash',
            'amount' => 500_000,
            'reference_number' => 'CASH-002',
        ])
        ->assertRedirect();
});
