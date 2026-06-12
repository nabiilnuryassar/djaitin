<?php

use App\Models\User;

test('admin can reach all office admin pages', function (): void {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('office.admin.users.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.products.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.garment-models.index'))->assertOk();
    $this->actingAs($admin)->get(route('office.admin.discounts.index'))->assertOk();
});

test('owner can reach all office admin pages', function (): void {
    $owner = User::factory()->owner()->create();

    $this->actingAs($owner)->get(route('office.admin.users.index'))->assertOk();
    $this->actingAs($owner)->get(route('office.admin.products.index'))->assertOk();
    $this->actingAs($owner)->get(route('office.admin.garment-models.index'))->assertOk();
    $this->actingAs($owner)->get(route('office.admin.discounts.index'))->assertOk();
});

test('kasir cannot access admin pages', function (): void {
    $kasir = User::factory()->kasir()->create();

    $this->actingAs($kasir)->get(route('office.admin.users.index'))->assertForbidden();
});
