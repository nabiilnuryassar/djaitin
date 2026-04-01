<?php

use App\Models\Courier;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can access inline master data tables', function () {
    $admin = User::factory()->admin()->create();

    GarmentModel::factory()->create(['name' => 'Jas Kantor']);
    Fabric::factory()->create(['name' => 'Wool Blend']);
    Courier::factory()->create(['name' => 'JNE']);

    $this->actingAs($admin)
        ->get(route('office.admin.garment-models.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/MasterData/Index')
            ->where('activeTab', 'garment-models')
            ->has('garmentModels', 1)
            ->has('fabrics', 1)
            ->has('couriers', 1)
            ->where('can.manage', true),
        );
});

test('owner can view master data but cannot manage it', function () {
    $owner = User::factory()->owner()->create();

    $this->actingAs($owner)
        ->get(route('office.admin.fabrics.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/MasterData/Index')
            ->where('activeTab', 'fabrics')
            ->where('can.manage', false),
        );
});
