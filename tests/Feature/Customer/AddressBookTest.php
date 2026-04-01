<?php

use App\Models\Address;
use App\Models\User;

test('customer can manage address book and sync the default address back to customer record', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    $this->actingAs($user)
        ->post(route('customer.addresses.store'), [
            'label' => 'Rumah',
            'recipient_name' => 'Portal Customer',
            'phone' => '081234567890',
            'address_line' => 'Jl. Customer 123',
            'city' => 'Bandung',
            'province' => 'Jawa Barat',
            'postal_code' => '40123',
            'is_default' => true,
        ])
        ->assertRedirect(route('customer.profile.edit', ['section' => 'addresses']));

    $firstAddress = Address::query()->where('customer_id', $customer->id)->firstOrFail();

    expect($firstAddress->is_default)->toBeTrue();
    $customer->refresh();
    expect($customer->address)->toContain('Jl. Customer 123')
        ->and($customer->address)->toContain('Bandung');

    $this->actingAs($user)
        ->post(route('customer.addresses.store'), [
            'label' => 'Kantor',
            'recipient_name' => 'Portal Customer',
            'phone' => '081234567891',
            'address_line' => 'Jl. Kantor 88',
            'city' => 'Cimahi',
            'province' => 'Jawa Barat',
            'postal_code' => '40535',
            'is_default' => false,
        ])
        ->assertRedirect(route('customer.profile.edit', ['section' => 'addresses']));

    $secondAddress = Address::query()
        ->where('customer_id', $customer->id)
        ->where('label', 'Kantor')
        ->firstOrFail();

    $this->actingAs($user)
        ->post(route('customer.addresses.set-default', $secondAddress))
        ->assertRedirect(route('customer.profile.edit', ['section' => 'addresses']));

    expect($firstAddress->fresh()->is_default)->toBeFalse()
        ->and($secondAddress->fresh()->is_default)->toBeTrue();

    $customer->refresh();
    expect($customer->address)->toContain('Jl. Kantor 88')
        ->and($customer->address)->toContain('Cimahi');
});

test('address index redirects customer to the unified profile page', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.addresses.index'))
        ->assertRedirect(route('customer.profile.edit', ['section' => 'addresses']));
});
