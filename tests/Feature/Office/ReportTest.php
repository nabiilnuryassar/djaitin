<?php

use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin and owner can access reports', function () {
    /** @var \Tests\TestCase $this */
    $admin = User::factory()->admin()->create();
    $owner = User::factory()->owner()->create();
    $order = Order::factory()->closed()->create([
        'created_at' => now()->subDays(1),
    ]);

    Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Verified,
        'amount' => 250000,
        'verified_at' => now()->subDay(),
        'payment_date' => now()->subDay(),
    ]);

    Order::factory()->create([
        'status' => 'in_progress',
        'due_date' => now()->subDay(),
    ]);

    $this->actingAs($admin)
        ->get(route('office.reports.index', ['preset' => '7d']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Reports/Index')
            ->has('summary')
            ->has('revenueSeries')
            ->has('repeatOrderRate')
            ->has('slaMetrics')
            ->has('funnelMetrics')
            ->where('funnelMetrics.closed', 1)
            ->where('slaMetrics.overdue_orders', 1),
        );

    $this->actingAs($owner)
        ->get(route('office.reports.index'))
        ->assertOk();
});

test('kasir cannot access reports', function () {
    /** @var \Tests\TestCase $this */
    $kasir = User::factory()->kasir()->create();

    $this->actingAs($kasir)
        ->get(route('office.reports.index'))
        ->assertForbidden();
});

test('admin can export reports as pdf and csv', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->closed()->create();

    Payment::factory()->for($order)->create([
        'status' => PaymentStatus::Verified,
        'amount' => 250000,
        'verified_at' => now(),
        'payment_date' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('office.reports.export', ['format' => 'pdf']))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');

    $this->actingAs($admin)
        ->get(route('office.reports.export', ['format' => 'csv']))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});
