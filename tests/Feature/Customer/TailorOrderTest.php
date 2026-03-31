<?php

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guest and authenticated customer can load tailor configurator with expected data', function () {
    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $measurement = Measurement::factory()->for($customer)->create([
        'label' => 'Ukuran Tersimpan',
    ]);
    $garmentModel = GarmentModel::factory()->create([
        'base_price' => 325000,
        'is_active' => true,
    ]);
    $fabric = Fabric::factory()->create([
        'price_adjustment' => 45000,
        'is_active' => true,
    ]);
    $draft = Order::factory()->for($customer)->create([
        'order_type' => OrderType::Tailor,
        'status' => OrderStatus::Draft,
        'measurement_mode' => 'manual',
        'draft_payload' => [
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_mode' => 'manual',
            'manual_measurement' => [
                'label' => 'Draft konfigurator',
            ],
            'qty' => 2,
        ],
    ]);

    $this->get(route('customer.tailor.configure'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Tailor/Configurator')
            ->where('customerMeta', null)
            ->where('measurements', [])
            ->has('garmentModels')
            ->has('fabrics')
            ->where('draft', null)
        );

    $this->actingAs($user)
        ->get(route('customer.tailor.configure'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Tailor/Configurator')
            ->where('customerMeta.id', $customer->id)
            ->where('measurements.0.label', 'Ukuran Tersimpan')
            ->where('draft.id', $draft->id)
            ->where('draft.payload.qty', 2)
        );
});

test('customer tailor submit uses backend pricing and loyalty discount', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $measurement = Measurement::factory()->for($customer)->create();
    $garmentModel = GarmentModel::factory()->create([
        'base_price' => 300000,
    ]);
    $fabric = Fabric::factory()->create([
        'price_adjustment' => 50000,
    ]);

    Order::factory()->count(6)->for($customer)->create([
        'order_type' => OrderType::Tailor,
        'status' => OrderStatus::Closed,
        'total_amount' => 100000,
        'paid_amount' => 100000,
        'outstanding_amount' => 0,
        'is_loyalty_applied' => false,
    ]);

    $customer->update([
        'is_loyalty_eligible' => true,
        'loyalty_order_count' => 6,
    ]);

    $this->actingAs($user)
        ->post(route('customer.orders.tailor.store'), [
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_mode' => 'saved',
            'measurement_id' => $measurement->id,
            'qty' => 2,
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 200000,
                'reference_number' => 'TRX-CUSTOMER-001',
                'notes' => 'DP awal',
                'proof' => UploadedFile::fake()->image('proof.jpg'),
            ],
        ])
        ->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();
    $item = OrderItem::query()->where('order_id', $order->id)->firstOrFail();
    $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();

    expect($order->status)->toBe(OrderStatus::PendingPayment)
        ->and($order->user_id)->toBe($user->id)
        ->and($order->submittedBy?->is($user))->toBeTrue()
        ->and((float) $order->subtotal)->toBe(700000.0)
        ->and((float) $order->discount_amount)->toBe(140000.0)
        ->and((float) $order->total_amount)->toBe(560000.0)
        ->and($order->measurement_id)->toBe($measurement->id)
        ->and((float) $item->unit_price)->toBe(350000.0)
        ->and((float) $item->subtotal)->toBe(560000.0)
        ->and($payment->method)->toBe(PaymentMethod::Transfer)
        ->and($payment->status)->toBe(PaymentStatus::PendingVerification)
        ->and($payment->proof_image_path)->not->toBeNull();

    Storage::disk('public')->assertExists($payment->proof_image_path);
});

test('customer can save draft and later submit it with manual measurement', function () {
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $garmentModel = GarmentModel::factory()->create([
        'base_price' => 250000,
    ]);
    $fabric = Fabric::factory()->create([
        'price_adjustment' => 25000,
    ]);

    $this->actingAs($user)
        ->post(route('customer.orders.draft.store'), [
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_mode' => 'manual',
            'manual_measurement' => [
                'label' => 'Ukuran kerja',
                'chest' => 92,
                'waist' => 74,
            ],
            'qty' => 1,
            'spec_notes' => 'Draft customer tailor',
        ])
        ->assertRedirect(route('customer.tailor.configure'));

    $draft = Order::query()->where('status', OrderStatus::Draft)->firstOrFail();

    expect($draft->draft_payload)->not->toBeNull()
        ->and($draft->measurement_mode)->toBe('manual');

    $this->actingAs($user)
        ->post(route('customer.orders.draft.submit', $draft), [
            'garment_model_id' => $garmentModel->id,
            'fabric_id' => $fabric->id,
            'measurement_mode' => 'manual',
            'manual_measurement' => [
                'label' => 'Ukuran kerja',
                'chest' => 92,
                'waist' => 74,
                'notes' => 'Manual customer submit',
            ],
            'qty' => 1,
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 100000,
                'reference_number' => 'TRX-DRAFT-001',
                'proof' => UploadedFile::fake()->image('draft-proof.jpg'),
            ],
        ])
        ->assertRedirect();

    $draft->refresh();
    $manualMeasurement = Measurement::query()
        ->where('customer_id', $customer->id)
        ->where('label', 'Ukuran kerja')
        ->firstOrFail();

    expect($draft->status)->toBe(OrderStatus::PendingPayment)
        ->and($draft->user_id)->toBe($user->id)
        ->and($draft->submittedBy?->is($user))->toBeTrue()
        ->and($draft->draft_payload)->toBeNull()
        ->and($draft->measurement_mode)->toBe('manual')
        ->and($draft->measurement_id)->toBe($manualMeasurement->id);
});
