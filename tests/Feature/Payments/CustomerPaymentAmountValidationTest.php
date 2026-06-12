<?php

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

it('rejects amount above outstanding', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create([
            'total_amount' => 500_000,
            'paid_amount' => 0,
            'outstanding_amount' => 500_000,
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.store', $order), [
            'method' => 'transfer',
            'amount' => 600_000,
            'reference_number' => 'TF-001',
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertSessionHasErrors('amount');
});

it('accepts amount equal to outstanding', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create([
            'total_amount' => 500_000,
            'paid_amount' => 0,
            'outstanding_amount' => 500_000,
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.store', $order), [
            'method' => 'transfer',
            'amount' => 500_000,
            'reference_number' => 'TF-002',
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertRedirect();
});
