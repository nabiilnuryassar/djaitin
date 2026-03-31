<?php

use App\Models\User;

test('customer can not access office routes', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('office.dashboard'))
        ->assertForbidden();
});

test('office user can not access customer-only customer routes', function () {
    $user = User::factory()->kasir()->create();

    $this->actingAs($user)
        ->get(route('customer.addresses.index'))
        ->assertForbidden();
});
