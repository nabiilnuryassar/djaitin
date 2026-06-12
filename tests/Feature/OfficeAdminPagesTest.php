<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('office admin users page renders required props', function (): void {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('office.admin.users.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/Users/Index')
            ->has('users')
            ->has('roles')
            ->has('can')
        );
});

test('office admin products page renders required props', function (): void {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('office.admin.products.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/Admin/Products/Index')
            ->has('products')
            ->has('filters')
            ->has('can')
        );
});
