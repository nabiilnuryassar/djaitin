<?php

use App\Models\User;

test('guests can visit the customer home page', function () {
    $this->get(route('customer.home'))->assertSuccessful();
});

test('guests are redirected to login when visiting customer dashboard', function () {
    $this->get(route('customer.dashboard'))->assertRedirect(route('login'));
});

test('customers can access the customer dashboard', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.dashboard'))
        ->assertSuccessful();
});

test('internal users can not access the customer dashboard', function () {
    $user = User::factory()->kasir()->create();

    $this->actingAs($user)
        ->get(route('customer.dashboard'))
        ->assertForbidden();
});
