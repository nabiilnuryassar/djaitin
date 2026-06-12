<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Validation\ValidationException;

it('prevents oversell when two reservations target the last unit', function () {
    $product = Product::factory()->create([
        'stock' => 1,
        'reserved_stock' => 0,
        'is_active' => true,
    ]);

    $service = app(StockService::class);

    $service->reserve($product, 1);

    expect(fn () => $service->reserve($product->fresh(), 1))
        ->toThrow(ValidationException::class);

    $product->refresh();

    expect((int) $product->stock)->toBe(1)
        ->and((int) $product->reserved_stock)->toBe(1);
});

it('releases reservation cleanly', function () {
    $product = Product::factory()->create([
        'stock' => 5,
        'reserved_stock' => 0,
        'is_active' => true,
    ]);

    $service = app(StockService::class);

    $service->reserve($product, 2);
    $service->release($product, 2);

    $product->refresh();

    expect((int) $product->reserved_stock)->toBe(0)
        ->and((int) $product->stock)->toBe(5);
});

it('rejects second checkout when first checkout already reserves the last unit', function () {
    $product = Product::factory()->create([
        'stock' => 1,
        'reserved_stock' => 0,
        'is_active' => true,
    ]);

    $firstUser = User::factory()->customer()->create();
    $secondUser = User::factory()->customer()->create();

    $firstCart = Cart::factory()->for($firstUser)->create();
    $secondCart = Cart::factory()->for($secondUser)->create();

    CartItem::factory()->for($firstCart)->for($product)->create(['qty' => 1]);
    CartItem::factory()->for($secondCart)->for($product)->create(['qty' => 1]);

    $payload = [
        'delivery_type' => 'pickup',
        'payment' => [
            'method' => 'cash',
            'notes' => 'Bayar saat pickup',
        ],
    ];

    $firstResponse = $this->actingAs($firstUser)
        ->post(route('customer.checkout.store'), $payload);

    $secondResponse = $this->actingAs($secondUser)
        ->post(route('customer.checkout.store'), $payload);

    $firstResponse->assertRedirect();
    $secondResponse->assertSessionHasErrors('qty');

    $product->refresh();

    expect((int) $product->reserved_stock)->toBe(1);
});
