<?php

use App\Models\Measurement;
use App\Models\User;

test('customer can create and update their own measurements', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();

    $this->actingAs($user)
        ->post(route('customer.measurements.store'), [
            'label' => 'Ukuran Harian',
            'chest' => 90,
            'waist' => 74,
            'notes' => 'Measurement awal',
        ])
        ->assertRedirect(route('customer.profile.edit', ['section' => 'measurements']));

    $measurement = Measurement::query()->where('customer_id', $customer->id)->firstOrFail();

    expect($measurement->label)->toBe('Ukuran Harian')
        ->and((float) $measurement->chest)->toBe(90.0);

    $this->actingAs($user)
        ->put(route('customer.measurements.update', $measurement), [
            'label' => 'Ukuran Harian Revisi',
            'chest' => 92,
            'waist' => 75,
            'notes' => 'Measurement revisi',
        ])
        ->assertRedirect(route('customer.profile.edit', ['section' => 'measurements']));

    expect($measurement->fresh()->label)->toBe('Ukuran Harian Revisi')
        ->and((float) $measurement->fresh()->chest)->toBe(92.0);
});

test('measurement index redirects customer to the unified profile page', function () {
    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.measurements.index'))
        ->assertRedirect(route('customer.profile.edit', ['section' => 'measurements']));
});
