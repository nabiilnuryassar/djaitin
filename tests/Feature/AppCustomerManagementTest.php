<?php

use App\Models\Customer;
use App\Models\User;

test('kasir can create a customer', function () {
    $user = User::factory()->kasir()->create();

    $response = $this->actingAs($user)->post(route('office.customers.store'), [
        'name' => 'Siti Aisyah',
        'phone' => '08123456789',
        'address' => 'Bandung',
        'notes' => 'Langganan kantor',
    ]);

    $customer = Customer::query()->firstOrFail();

    $response->assertRedirect(route('office.customers.show', $customer));

    expect($customer->name)->toBe('Siti Aisyah');
});

test('kasir can store a measurement for a customer', function () {
    $user = User::factory()->kasir()->create();
    $customer = Customer::factory()->create();

    $this->actingAs($user)->post(route('office.customers.measurements.store', $customer), [
        'label' => 'Fitting Pertama',
        'chest' => 92.5,
        'waist' => 74.0,
        'shoulder' => 41.5,
    ])->assertRedirect();

    expect($customer->measurements()->count())->toBe(1);
});

test('produksi can not create a customer', function () {
    $user = User::factory()->produksi()->create();

    $this->actingAs($user)->post(route('office.customers.store'), [
        'name' => 'Tidak Diizinkan',
    ])->assertForbidden();
});
