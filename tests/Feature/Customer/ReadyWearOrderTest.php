<?php

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Address;
use App\Models\Cart;
use App\Models\Courier;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('customer can not checkout ready to wear order when cart quantity exceeds current stock', function () {
    /** @var \Tests\TestCase $this */
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $product = Product::factory()->create([
        'stock' => 3,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->id,
            'qty' => 3,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $product->update(['stock' => 2]);

    $this->actingAs($user)
        ->post(route('customer.checkout.store'), [
            'delivery_type' => 'pickup',
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 100000,
                'reference_number' => 'RTW-STOCK-001',
                'proof' => UploadedFile::fake()->image('proof.jpg'),
            ],
        ])
        ->assertSessionHasErrors('qty');

    expect(Order::query()->count())->toBe(0);
});

test('ready to wear stock is decremented only after transfer payment is verified', function () {
    /** @var \Tests\TestCase $this */
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $product = Product::factory()->create([
        'selling_price' => 180000,
        'discount_amount' => 30000,
        'stock' => 5,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->id,
            'qty' => 2,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $this->actingAs($user)
        ->post(route('customer.checkout.store'), [
            'delivery_type' => 'pickup',
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 300000,
                'reference_number' => 'RTW-VERIFY-001',
                'proof' => UploadedFile::fake()->image('transfer.jpg'),
            ],
        ])
        ->assertRedirect();

    $order = Order::query()->latest('id')->firstOrFail();
    /** @var \App\Models\Order $order */
    $payment = Payment::query()->where('order_id', $order->id)->firstOrFail();
    /** @var \App\Models\Cart $cart */
    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();

    expect($order->order_type)->toBe(OrderType::ReadyWear)
        ->and($order->status)->toBe(OrderStatus::PendingPayment)
        ->and((float) $order->subtotal)->toBe(360000.0)
        ->and((float) $order->discount_amount)->toBe(60000.0)
        ->and((float) $order->total_amount)->toBe(300000.0)
        ->and($payment->status)->toBe(PaymentStatus::PendingVerification)
        ->and($product->fresh()->stock)->toBe(5)
        ->and($cart->items()->count())->toBe(0);

    $verifier = User::factory()->admin()->create();

    app(PaymentService::class)->verifyTransfer($payment, $verifier);

    expect($product->fresh()->stock)->toBe(3)
        ->and($payment->fresh()->status)->toBe(PaymentStatus::Verified)
        ->and((float) $order->fresh()->paid_amount)->toBe(300000.0)
        ->and((float) $order->fresh()->outstanding_amount)->toBe(0.0);
});

test('customer can only add a ready to wear size variant that is still available', function () {
    /** @var \Tests\TestCase $this */
    $user = User::factory()->customer()->create();

    Product::factory()->create([
        'name' => 'Kemeja Linen',
        'category' => 'tops',
        'size' => 'M',
        'stock' => 4,
        'is_active' => true,
    ]);

    $unavailableVariant = Product::factory()->create([
        'name' => 'Kemeja Linen',
        'category' => 'tops',
        'size' => 'L',
        'stock' => 0,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $unavailableVariant->id,
            'qty' => 1,
        ])
        ->assertSessionHasErrors('qty');

    /** @var \App\Models\Cart $cart */
    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();
    expect($cart->items()->count())->toBe(0);
});

test('delivery checkout requires customer address and pickup does not', function () {
    /** @var \Tests\TestCase $this */
    Storage::fake('public');

    $user = User::factory()->customer()->create();
    $customer = $user->customer()->firstOrFail();
    $product = Product::factory()->create([
        'stock' => 4,
        'is_active' => true,
    ]);
    $courier = Courier::factory()->create();
    $address = Address::factory()->for($customer)->default()->create();

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->id,
            'qty' => 1,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $this->actingAs($user)
        ->post(route('customer.checkout.store'), [
            'delivery_type' => 'delivery',
            'courier_id' => $courier->id,
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 100000,
                'reference_number' => 'RTW-DELIVERY-001',
                'proof' => UploadedFile::fake()->image('delivery-proof.jpg'),
            ],
        ])
        ->assertSessionHasErrors('address_id');

    $this->actingAs($user)
        ->post(route('customer.checkout.store'), [
            'delivery_type' => 'pickup',
            'payment' => [
                'method' => PaymentMethod::Cash->value,
                'notes' => 'Bayar saat ambil',
            ],
        ])
        ->assertRedirect();

    $pickupOrder = Order::query()->latest('id')->firstOrFail();
    /** @var \App\Models\Order $pickupOrder */
    expect($pickupOrder->shipment()->exists())->toBeFalse()
        ->and((float) $pickupOrder->shipping_cost)->toBe(0.0);

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->fresh()->id,
            'qty' => 1,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $this->actingAs($user)
        ->post(route('customer.checkout.store'), [
            'delivery_type' => 'delivery',
            'address_id' => $address->id,
            'courier_id' => $courier->id,
            'payment' => [
                'method' => PaymentMethod::Transfer->value,
                'amount' => 120000,
                'reference_number' => 'RTW-DELIVERY-002',
                'proof' => UploadedFile::fake()->image('delivery-proof-2.jpg'),
            ],
        ])
        ->assertRedirect();

    $deliveryOrder = Order::query()->latest('id')->firstOrFail();
    /** @var \App\Models\Order $deliveryOrder */
    expect($deliveryOrder->shipment()->exists())->toBeTrue()
        ->and((float) $deliveryOrder->shipping_cost)->toBe(20000.0);
});
