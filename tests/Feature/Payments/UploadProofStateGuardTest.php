<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(fn () => Storage::fake('public'));

it('blocks upload when payment is verified', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create();

    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::Verified,
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $payment), [
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertSessionHasErrors('payment');
});

it('blocks upload when order is closed', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create([
            'status' => OrderStatus::Closed,
            'outstanding_amount' => 0,
        ]);

    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::Rejected,
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $payment), [
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertSessionHasErrors('payment');
});

it('removes old proof file when re-uploading after rejection', function () {
    $user = User::factory()->customer()->create();
    $order = Order::factory()
        ->for($user->customer()->firstOrFail())
        ->readyWear()
        ->create();

    Storage::disk('public')->put('payments/proofs/old-proof.jpg', 'old');

    $payment = Payment::factory()
        ->for($order)
        ->create([
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::Rejected,
            'proof_image_path' => 'payments/proofs/old-proof.jpg',
        ]);

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $payment), [
            'proof' => UploadedFile::fake()->image('.png'),
        ])
        ->assertRedirect();

    $payment->refresh();

    Storage::disk('public')->assertMissing('payments/proofs/old-proof.jpg');
    Storage::disk('public')->assertExists($payment->proof_image_path);
});
