<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;

class CartService
{
    public function __construct(
        protected StockService $stockService,
    ) {}

    public function getOrCreate(User $user): Cart
    {
        return Cart::query()->firstOrCreate([
            'user_id' => $user->id,
        ]);
    }

    public function addItem(Cart $cart, Product $product, int $qty): CartItem
    {
        $existingItem = $cart->items()
            ->where('product_id', $product->id)
            ->first();

        $targetQty = $qty + ($existingItem?->qty ?? 0);
        $this->stockService->validateStock($product, $targetQty);

        if ($existingItem !== null) {
            $existingItem->update([
                'qty' => $targetQty,
            ]);

            return $existingItem->refresh();
        }

        return $cart->items()->create([
            'product_id' => $product->id,
            'qty' => $qty,
        ]);
    }

    public function updateItem(CartItem $item, int $qty): CartItem
    {
        $product = $item->product()->firstOrFail();

        $this->stockService->validateStock($product, $qty);

        $item->update([
            'qty' => $qty,
        ]);

        return $item->refresh();
    }

    public function removeItem(CartItem $item): void
    {
        $item->delete();
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
    }
}
