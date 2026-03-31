<?php

use App\Models\User;

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
