<?php

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('customer can reupload proof for rejected transfer payment', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $order = Order::factory()->for($user->customer()->firstOrFail())->create();
    $payment = Payment::factory()->for($order)->transfer()->create([
        'method' => PaymentMethod::Transfer,
        'status' => PaymentStatus::Rejected,
        'rejection_reason' => 'Bukti buram',
    ]);

    $this->actingAs($user)
        ->post(route('customer.payments.upload-proof', $payment), [
            'proof' => UploadedFile::fake()->image('retry-proof.jpg'),
        ])
        ->assertRedirect();

    $payment->refresh();

    expect($payment->status)->toBe(PaymentStatus::PendingVerification)
        ->and($payment->proof_image_path)->not->toBeNull()
        ->and($payment->rejection_reason)->toBeNull();

    Storage::disk('public')->assertExists($payment->proof_image_path);
});
