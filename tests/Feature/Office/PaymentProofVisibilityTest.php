<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('office payments index exposes proof image url for pending transfers', function () {
    /** @var \Tests\TestCase $this */
    $admin = User::factory()->admin()->create();

    $order = Order::factory()->create();

    Payment::factory()
        ->transfer()
        ->for($order)
        ->create([
            'proof_image_path' => 'payments/proofs/example.jpg',
        ]);

    $this->actingAs($admin)
        ->get(route('office.payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Payments/Index')
            ->has('pendingPayments', 1)
            ->where('pendingPayments.0.proof_image_path', 'payments/proofs/example.jpg')
            ->where(
                'pendingPayments.0.proof_image_url',
                fn (?string $url): bool => is_string($url) && str_ends_with($url, '/storage/payments/proofs/example.jpg'),
            ),
        );
});

test('office order show exposes proof image url for each payment', function () {
    /** @var \Tests\TestCase $this */
    $admin = User::factory()->admin()->create();

    $order = Order::factory()->create();

    Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::PendingVerification,
            'proof_image_path' => 'payments/proofs/proof-1.png',
            'verified_by' => null,
            'verified_at' => null,
        ]);

    $this->actingAs($admin)
        ->get(route('office.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Orders/Show')
            ->has('order.payments', 1)
            ->where('order.payments.0.proof_image_path', 'payments/proofs/proof-1.png')
            ->where(
                'order.payments.0.proof_image_url',
                fn (?string $url): bool => is_string($url) && str_ends_with($url, '/storage/payments/proofs/proof-1.png'),
            ),
        );
});

test('proof image url is null when no proof is uploaded', function () {
    /** @var \Tests\TestCase $this */
    $admin = User::factory()->admin()->create();

    $order = Order::factory()->create();

    Payment::factory()
        ->transfer()
        ->for($order)
        ->create([
            'proof_image_path' => null,
        ]);

    $this->actingAs($admin)
        ->get(route('office.payments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('pendingPayments.0.proof_image_path', null)
            ->where('pendingPayments.0.proof_image_url', null),
        );
});
