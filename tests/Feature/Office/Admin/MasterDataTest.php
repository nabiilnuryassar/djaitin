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
    Courier::factory()->create(['name' => 'JNE', 'base_fee' => 18000]);

    $this->actingAs($admin)
        ->get(route('office.admin.garment-models.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/MasterData/Index')
            ->where('activeTab', 'garment-models')
            ->has('garmentModels', 1)
            ->has('fabrics', 1)
            ->has('couriers', 1)
            ->where('couriers.0.base_fee', '18000.00')
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

test('admin can store and update courier base fee', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('office.admin.couriers.store'), [
            'name' => 'AnterAja',
            'base_fee' => 16500,
            'is_active' => true,
        ])
        ->assertRedirect();

    $courier = Courier::query()->where('name', 'AnterAja')->firstOrFail();

    expect((float) $courier->base_fee)->toBe(16500.0);

    $this->actingAs($admin)
        ->put(route('office.admin.couriers.update', $courier), [
            'name' => 'AnterAja Regular',
            'base_fee' => 21000,
            'is_active' => true,
        ])
        ->assertRedirect();

    expect((float) $courier->refresh()->base_fee)->toBe(21000.0)
        ->and($courier->name)->toBe('AnterAja Regular');
});
