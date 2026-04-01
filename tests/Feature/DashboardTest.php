<?php

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

    $order = Order::factory()
        ->for($customer)
        ->pendingPayment()
        ->create([
            'order_number' => 'ORD-UI-000001',
            'total_amount' => 500000,
            'outstanding_amount' => 250000,
        ]);

    Payment::factory()->for($order)->pending()->create([
        'amount' => 125000,
    ]);

    Payment::factory()->for($order)->verified()->create([
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
            ->has('recentOrders', 1)
            ->where('recentOrders.0.order_number', 'ORD-UI-000001')
            ->where('recentOrders.0.status', 'pending_payment')
            ->where('recentOrders.0.customer_name', 'Pelanggan Dashboard')
            ->where('recentOrders.0.total_amount', 500000)
            ->where('recentOrders.0.outstanding_amount', 250000)
            ->where('alerts.overdue_orders', 0)
            ->where('alerts.low_stock_products', 0),
        );
});
