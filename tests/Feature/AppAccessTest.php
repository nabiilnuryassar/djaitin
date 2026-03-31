<?php

use App\Models\User;

test('guests are redirected to login when visiting office dashboard', function () {
    $this->get(route('office.dashboard'))
        ->assertRedirect(route('login'));
});

test('owner can access the office dashboard', function () {
    $user = User::factory()->owner()->create();

    $this->actingAs($user)
        ->get(route('office.dashboard'))
        ->assertSuccessful();
});

test('kasir can access the office dashboard', function () {
    $user = User::factory()->kasir()->create();

    $this->actingAs($user)
        ->get(route('office.dashboard'))
        ->assertSuccessful();
});
