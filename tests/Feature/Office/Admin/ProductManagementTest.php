<?php

use App\Models\Product;
use App\Models\User;
use App\Services\StockService;
use Illuminate\Validation\ValidationException;

test('admin can create update and deactivate products', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->post(route('office.admin.products.store'), [
        'sku' => 'SKU-OFFICE-001',
        'name' => 'Produk Office',
        'description' => 'Produk baru',
        'category' => 'tops',
        'size' => 'M',
        'base_price' => 100000,
        'selling_price' => 150000,
        'discount_amount' => 0,
        'discount_percent' => 0,
        'stock' => 10,
        'is_active' => true,
    ])->assertRedirect();

    $product = Product::query()->where('sku', 'SKU-OFFICE-001')->firstOrFail();

    $this->actingAs($admin)->put(route('office.admin.products.update', $product), [
        'sku' => 'SKU-OFFICE-001',
        'name' => 'Produk Office Update',
        'description' => 'Produk update',
        'category' => 'tops',
        'size' => 'L',
        'base_price' => 100000,
        'selling_price' => 175000,
        'discount_amount' => 0,
        'discount_percent' => 0,
        'stock' => 8,
        'is_active' => true,
    ])->assertRedirect();

    expect($product->refresh()->name)->toBe('Produk Office Update')
        ->and($product->stock)->toBe(8);

    $this->actingAs($admin)
        ->delete(route('office.admin.products.destroy', $product))
        ->assertRedirect();

    expect($product->refresh()->is_active)->toBeFalse();
});

test('stock service prevents negative stock', function () {
    $product = Product::factory()->create([
        'stock' => 2,
    ]);

    expect(fn () => app(StockService::class)->decrementStock($product, 3))
        ->toThrow(ValidationException::class);
});
