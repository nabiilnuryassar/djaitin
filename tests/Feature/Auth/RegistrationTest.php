<?php

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

test('registration screen can be rendered for customer signup', function () {
    $this->get('/register')->assertOk();
});

test('public users can register as customers', function () {
    $response = $this->post('/register', [
        'name' => 'Test Customer',
        'email' => 'customer@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('customer.dashboard', absolute: false));

    $user = User::query()->where('email', 'customer@example.com')->firstOrFail();
    $customer = Customer::query()->where('user_id', $user->id)->firstOrFail();

    expect($user->role)->toBe(UserRole::Customer)
        ->and($user->is_active)->toBeTrue()
        ->and($customer->name)->toBe('Test Customer');
});
