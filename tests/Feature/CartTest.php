<?php

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('customer can add update and remove ready to wear cart items with discounted totals', function () {
    $user = User::factory()->customer()->create();
    $product = Product::factory()->create([
        'selling_price' => 200000,
        'discount_amount' => 25000,
        'stock' => 8,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->id,
            'qty' => 2,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $cart = Cart::query()->where('user_id', $user->id)->firstOrFail();
    $item = CartItem::query()->where('cart_id', $cart->id)->firstOrFail();

    expect($item->qty)->toBe(2)
        ->and($cart->fresh()->totalAmount())->toBe(350000.0);

    $this->actingAs($user)
        ->put(route('customer.cart.items.update', $item), [
            'qty' => 3,
        ])
        ->assertRedirect();

    $item->refresh();

    expect($item->qty)->toBe(3)
        ->and($item->subtotalAmount())->toBe(525000.0);

    $this->actingAs($user)
        ->get(route('customer.cart.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Cart/Index')
            ->where('summary.items_count', 3)
            ->where('summary.total_amount', 525000)
            ->has('cart.items', 1, fn (Assert $cartItem) => $cartItem
                ->where('qty', 3)
                ->where('product.final_price', 175000)
                ->etc()
            )
        );

    $this->actingAs($user)
        ->delete(route('customer.cart.items.destroy', $item))
        ->assertRedirect();

    expect(CartItem::query()->whereKey($item->id)->exists())->toBeFalse();
});

test('cart access is isolated per customer account', function () {
    $owner = User::factory()->customer()->create();
    $other = User::factory()->customer()->create();
    $product = Product::factory()->create([
        'stock' => 5,
        'is_active' => true,
    ]);

    $this->actingAs($owner)
        ->post(route('customer.cart.items.store'), [
            'product_id' => $product->id,
            'qty' => 1,
        ])
        ->assertRedirect(route('customer.cart.index'));

    $ownerCart = Cart::query()->where('user_id', $owner->id)->firstOrFail();
    $ownerItem = CartItem::query()->where('cart_id', $ownerCart->id)->firstOrFail();

    $this->actingAs($other)
        ->get(route('customer.cart.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Cart/Index')
            ->where('summary.items_count', 0)
            ->where('cart.items', [])
        );

    $this->actingAs($other)
        ->put(route('customer.cart.items.update', $ownerItem), [
            'qty' => 2,
        ])
        ->assertForbidden();

    $this->actingAs($other)
        ->delete(route('customer.cart.items.destroy', $ownerItem))
        ->assertForbidden();
});
