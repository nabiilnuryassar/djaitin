<?php

use App\Enums\OrderType;
use App\Enums\ProductionStage;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('production board exposes quick status and stage controls', function () {
    $produksi = User::factory()->produksi()->create();

    Order::factory()->inProgress()->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
    ]);

    $this->actingAs($produksi)
        ->get(route('office.production.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Production/Index')
            ->has('orders.data', 1)
            ->has('quickStatuses')
            ->where('can.update_status', true)
            ->where('can.update_stage', true)
            ->where('orders.data.0.order_type', 'convection')
            ->where('orders.data.0.production_stage', 'design'),
        );
});
