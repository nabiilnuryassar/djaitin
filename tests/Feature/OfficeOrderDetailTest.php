<?php

use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('office order detail exposes required sections', function (): void {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    $this->actingAs($admin)
        ->get(route('office.orders.show', $order))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Orders/Show')
            ->has('order')
            ->has('statuses')
            ->has('productionStages')
            ->has('can')
            ->whereType('csrf_token', 'string')
        );
});
