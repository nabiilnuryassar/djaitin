<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the landing page', function () {
    $response = $this->get(route('home'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->where('brand.name', 'Djaitin')
            ->where('brand.services', ['Tailor Custom', 'Ready-to-Wear', 'Bulk Convection'])
            ->where('auth.user', null)
        );
});

test('authenticated users can still view the landing page', function () {
    $user = User::factory()->owner()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('home'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->where('brand.tagline', 'Trusted convection partner for tailor custom, ready-to-wear, and bulk production.')
            ->where('auth.user.id', $user->id)
            ->where('auth.user.role', $user->role->value)
        );
});
