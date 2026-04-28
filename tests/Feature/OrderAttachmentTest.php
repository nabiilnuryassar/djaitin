<?php

use App\Enums\OrderAttachmentType;
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
            'attachment_type' => OrderAttachmentType::Revision->value,
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
            'title' => 'Revisi logo event',
            'notes' => 'Mohon update penempatan logo sponsor.',
            'attachment_type' => OrderAttachmentType::Revision->value,
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
                ->where('title', 'Revisi logo event')
                ->where('attachment_type', OrderAttachmentType::Revision->value)
                ->where('uploaded_by', $user->name)
                ->etc()
            )
        );
});

test('office uploaded attachment is visible to customer order detail', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $customer = $customerUser->customer()->firstOrFail();
    $order = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
        'user_id' => $customerUser->id,
        'created_by' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->post(route('office.orders.attachments.store', $order), [
            'title' => 'Mockup seragam v1',
            'notes' => 'Referensi awal dari tim office.',
            'attachment_type' => OrderAttachmentType::DesignProposal->value,
            'file' => UploadedFile::fake()->create('mockup-seragam-v1.pdf', 320, 'application/pdf'),
        ])
        ->assertRedirect();

    $this->actingAs($customerUser)
        ->get(route('customer.orders.show', $order))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Orders/Show')
            ->has('order.attachments', 1, fn (Assert $attachmentPage) => $attachmentPage
                ->where('file_name', 'mockup-seragam-v1.pdf')
                ->where('title', 'Mockup seragam v1')
                ->where('attachment_type', OrderAttachmentType::DesignProposal->value)
                ->where('uploaded_by', $admin->name)
                ->etc()
            )
        );
});
