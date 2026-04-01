<?php

use App\Enums\OrderType;
use App\Enums\ProductionStage;
use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('invalid attachment file type is rejected for customer order attachments', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $order = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
        'user_id' => $user->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('customer.orders.attachments.store', $order), [
            'file' => UploadedFile::fake()->create('malicious.zip', 20),
        ])
        ->assertSessionHasErrors('file');

    expect(OrderAttachment::query()->count())->toBe(0);
});

test('attachment file is stored and exposed on customer order detail', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $order = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
        'user_id' => $user->id,
        'created_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('customer.orders.attachments.store', $order), [
            'file' => UploadedFile::fake()->create('revisi-logo.pdf', 320, 'application/pdf'),
        ])
        ->assertRedirect();

    $attachment = OrderAttachment::query()->firstOrFail();

    Storage::disk('public')->assertExists($attachment->file_path);

    $this->actingAs($user)
        ->get(route('customer.orders.show', $order))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Orders/Show')
            ->has('order.attachments', 1, fn (Assert $attachmentPage) => $attachmentPage
                ->where('file_name', 'revisi-logo.pdf')
                ->where('uploaded_by', $user->name)
                ->etc()
            )
        );
});
