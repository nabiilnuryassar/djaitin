<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

it('rejects new transfer payment when one is already pending verification', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create([
            'total_amount' => 500_000,
            'paid_amount' => 0,
            'outstanding_amount' => 500_000,
        ]);

    Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::PendingVerification,
            'amount' => 200_000,
            'verified_by' => null,
            'verified_at' => null,
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.store', $order), [
            'method' => 'transfer',
            'amount' => 100_000,
            'reference_number' => 'TF-003',
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertSessionHasErrors('payment');
});
