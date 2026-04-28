<?php

use App\Enums\OrderAttachmentType;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ProductionStage;
use App\Models\Order;
use App\Models\OrderAttachment;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('customer can load convection create page and submit convection order with full payment', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();

    $this->actingAs($user)
        ->get(route('customer.convection.create'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Convection/Create')
            ->where('customer.name', $user->name)
            ->has('paymentMethods', 2)
        );

    $this->actingAs($user)
        ->post(route('customer.convection.store'), [
            'company_name' => 'PT Mitra Seragam',
            'spec_notes' => 'Butuh seragam event dengan bordir logo.',
            'reference_file' => UploadedFile::fake()->create('design-board.pdf', 320, 'application/pdf'),
            'items' => [
                [
                    'item_name' => 'Kaos Polo',
                    'description' => 'Warna navy, bordir dada kiri',
                    'qty' => 20,
                    'unit_price' => 85000,
                ],
                [
                    'item_name' => 'Jaket Ringan',
                    'description' => 'Resleting depan, logo sablon',
                    'qty' => 10,
                    'unit_price' => 150000,
                ],
            ],
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 3200000,
                'reference_number' => 'CNV-TRX-001',
                'notes' => 'Pelunasan konveksi',
                'proof' => UploadedFile::fake()->image('transfer-proof.jpg'),
            ],
        ])
        ->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();
    $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
    $attachment = OrderAttachment::query()->where('order_id', $order->id)->firstOrFail();

    expect($order->order_type)->toBe(OrderType::Convection)
        ->and($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->company_name)->toBe('PT Mitra Seragam')
        ->and($order->production_stage)->toBe(ProductionStage::Design)
        ->and((float) $order->subtotal)->toBe(3200000.0)
        ->and((float) $order->total_amount)->toBe(3200000.0)
        ->and($order->items()->count())->toBe(2)
        ->and($payment->method)->toBe(PaymentMethod::Transfer)
        ->and($payment->status)->toBe(PaymentStatus::PendingVerification)
        ->and($attachment->file_name)->toBe('design-board.pdf')
        ->and($attachment->attachment_type)->toBe(OrderAttachmentType::Reference);

    Storage::disk('public')->assertExists($attachment->file_path);

    $this->actingAs($user)
        ->get(route('customer.orders.show', $order))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Orders/Show')
            ->where('order.order_type', 'convection')
            ->where('order.company_name', 'PT Mitra Seragam')
            ->where('order.production_stage', 'design')
            ->has('order.items', 2)
            ->has('order.attachments', 1, fn (Assert $attachmentPage) => $attachmentPage
                ->where('file_name', 'design-board.pdf')
                ->where('attachment_type', 'reference')
                ->etc()
            )
        );
});

test('convection order can not move to in progress before full payment is verified', function () {
    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $customer = $customerUser->customer()->firstOrFail();

    $order = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
        'status' => OrderStatus::PendingPayment,
        'created_by' => $admin->id,
        'user_id' => $customerUser->id,
        'subtotal' => 1200000,
        'total_amount' => 1200000,
        'paid_amount' => 0,
        'outstanding_amount' => 1200000,
    ]);

    Payment::factory()->for($order)->transfer()->create([
        'amount' => 1200000,
        'status' => PaymentStatus::PendingVerification,
    ]);

    $this->actingAs($admin)
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::InProgress->value,
        ])
        ->assertSessionHasErrors('status');
});

test('convection order can move to in progress after full payment is verified', function () {
    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $customer = $customerUser->customer()->firstOrFail();

    $order = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Convection,
        'production_stage' => ProductionStage::Design,
        'status' => OrderStatus::PendingPayment,
        'created_by' => $admin->id,
        'user_id' => $customerUser->id,
        'subtotal' => 900000,
        'total_amount' => 900000,
        'paid_amount' => 900000,
        'outstanding_amount' => 0,
    ]);

    Payment::factory()->for($order)->transfer()->verified()->create([
        'amount' => 900000,
    ]);

    $this->actingAs($admin)
        ->put(route('office.orders.status', $order), [
            'status' => OrderStatus::InProgress->value,
        ])
        ->assertRedirect();

    expect($order->fresh()->status)->toBe(OrderStatus::InProgress);
});
