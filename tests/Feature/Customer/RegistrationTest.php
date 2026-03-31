<?php

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

test('registration creates a linked customer profile and redirects to customer dashboard', function () {
    $response = $this->post('/register', [
        'name' => 'Portal Customer',
        'email' => 'portal-customer@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertRedirect(route('customer.dashboard', absolute: false));
    $this->assertAuthenticated();

    $user = User::query()->where('email', 'portal-customer@example.com')->firstOrFail();
    $customer = Customer::query()->where('user_id', $user->id)->firstOrFail();

    expect($user->role)->toBe(UserRole::Customer)
        ->and($user->is_active)->toBeTrue()
        ->and($customer->name)->toBe('Portal Customer')
        ->and($customer->user_id)->toBe($user->id);
});
