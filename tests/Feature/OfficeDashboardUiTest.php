<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('office dashboard exposes operational sections', function (): void {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('office.dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Dashboard/Index')
            ->has('metricCards')
            ->has('recentOrders')
            ->has('pendingPayments')
            ->has('productionPulse')
        );
});
