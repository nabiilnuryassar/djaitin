<?php

use App\Models\Product;
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
            ->where('catalog.index_url', route('customer.catalog.index'))
            ->has('featuredProducts', 0)
            ->where('auth.user', null)
        );
});

test('landing page shows top 3 active catalog products for guests', function () {
    Product::factory()->create([
        'name' => 'Inactive Piece',
        'is_active' => false,
    ]);

    $clearanceProduct = Product::factory()->clearance()->create([
        'name' => 'Archive Overshirt',
        'stock' => 3,
    ]);

    Product::factory()->count(6)->create();

    $response = $this->get(route('home'));

    $response
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Landing/Index')
            ->has('featuredProducts', 3)
            ->where('featuredProducts.0.id', $clearanceProduct->id)
            ->where('featuredProducts.0.is_clearance', true)
            ->where('featuredProducts.0.is_low_stock', true)
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
