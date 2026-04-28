<?php

use App\Enums\ProductionStage;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('office.dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->kasir()->create();
    $this->actingAs($user);

    $response = $this->get(route('office.dashboard'));
    $response->assertSuccessful();
});

test('office dashboard exposes metrics and recent orders for the app shell', function () {
    $user = User::factory()->admin()->create();
    $customer = Customer::factory()->create([
        'name' => 'Pelanggan Dashboard',
    ]);

    $pendingOrder = Order::factory()
        ->for($customer)
        ->pendingPayment()
        ->create([
            'order_number' => 'ORD-UI-000001',
            'total_amount' => 500000,
            'outstanding_amount' => 250000,
            'created_at' => now()->subMinute(),
        ]);

    $productionOrder = Order::factory()
        ->for($customer)
        ->inProgress()
        ->create([
            'order_number' => 'ORD-UI-000002',
            'production_stage' => ProductionStage::Production,
            'created_at' => now(),
        ]);

    Order::factory()
        ->for($customer)
        ->closed()
        ->create([
            'order_number' => 'ORD-UI-000003',
            'production_stage' => ProductionStage::QC,
            'created_at' => now()->subMinutes(2),
        ]);

    Payment::factory()->for($pendingOrder)->pending()->create([
        'amount' => 125000,
        'reference_number' => 'TRX-123456',
    ]);

    Payment::factory()->for($pendingOrder)->verified()->create([
        'amount' => 200000,
    ]);

    $this->actingAs($user)
        ->get(route('office.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Dashboard/Index')
            ->where('role', 'admin')
            ->has('metricCards', 4)
            ->where('metricCards.0.label', 'Order Hari Ini')
            ->has('recentOrders', 3)
            ->where('recentOrders.0.order_number', 'ORD-UI-000002')
            ->where('recentOrders.0.status', 'in_progress')
            ->where('recentOrders.0.order_type', 'tailor')
            ->where('recentOrders.0.customer_name', 'Pelanggan Dashboard')
            ->where('recentOrders.1.order_number', 'ORD-UI-000001')
            ->where('recentOrders.1.total_amount', 500000)
            ->where('recentOrders.1.outstanding_amount', 250000)
            ->where('alerts.overdue_orders', 0)
            ->where('alerts.low_stock_products', 0)
            ->where('orderStatusDistribution.0.count', 0)
            ->where('orderStatusDistribution.1.count', 1)
            ->where('orderStatusDistribution.2.count', 1)
            ->where('orderStatusDistribution.4.count', 1)
            ->has('pendingPayments', 1)
            ->where('pendingPayments.0.reference_number', 'TRX-123456')
            ->where('pendingPayments.0.order.order_number', 'ORD-UI-000001')
            ->where('productionPulse.active_count', 1)
            ->where('productionPulse.stages.1.count', 1)
            ->where('productionPulse.stages.1.orders.0.order_number', $productionOrder->order_number)
            ->where('can.view_payments', true)
            ->where('can.verify_payments', true),
        );
});
