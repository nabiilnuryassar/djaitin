<?php

use App\Models\Address;
use App\Models\Measurement;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests can visit the customer home page', function () {
    $this->get(route('customer.home'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Home')
        );
});

test('guests can visit the customer convection service page', function () {
    $this->get(route('customer.services.convection'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Services/Convection')
        );
});

test('guests are redirected to login when visiting customer dashboard', function () {
    $this->get(route('customer.dashboard'))->assertRedirect(route('login'));
});

test('customers can access the customer dashboard', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Dashboard/Index')
            ->has('summary')
        );
});

test('customers can access the customer convection request page', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.convection.create'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Convection/Create')
            ->where('customer.name', $user->name)
            ->has('paymentMethods', 2)
        );
});

test('customers can access the unified customer profile page', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    Address::factory()->for($customer)->default()->create([
        'label' => 'Rumah',
    ]);

    Measurement::factory()->for($customer)->create([
        'label' => 'Ukuran Harian',
    ]);

    $this->actingAs($user)
        ->get(route('customer.profile.edit', ['section' => 'measurements']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Profile/Edit')
            ->where('customer.name', $customer->name)
            ->has('addresses', 1, fn (Assert $address) => $address
                ->where('label', 'Rumah')
                ->where('is_default', true)
                ->etc()
            )
            ->has('measurements', 1, fn (Assert $measurement) => $measurement
                ->where('label', 'Ukuran Harian')
                ->etc()
            )
        );
});

test('internal users can not access the customer dashboard', function () {
    $user = User::factory()->kasir()->create();

    $this->actingAs($user)
        ->get(route('customer.dashboard'))
        ->assertForbidden();
});
