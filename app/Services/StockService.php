<?php

namespace App\Services;

use App\Enums\OrderType;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function validateStock(Product $product, int $qty): void
    {
        if (! $product->is_active) {
            throw ValidationException::withMessages([
                'product' => 'Produk tidak aktif dan tidak dapat dipesan.',
            ]);
        }

        if ($qty < 1) {
            throw ValidationException::withMessages([
                'qty' => 'Qty harus lebih besar dari nol.',
            ]);
        }

        if ($product->stock < $qty) {
            throw ValidationException::withMessages([
                'qty' => "Stok {$product->name} tidak mencukupi untuk qty {$qty}.",
            ]);
        }
    }

    public function decrementStock(Product $product, int $qty): Product
    {
        $product = Product::query()
            ->lockForUpdate()
            ->findOrFail($product->id);

        $this->validateStock($product, $qty);

        $product->decrement('stock', $qty);

        return $product->refresh();
    }

    public function decrementOnVerifiedPayment(Order $order): void
    {
        if ($order->order_type !== OrderType::ReadyWear) {
            return;
        }

        $order->loadMissing('items.product');

        foreach ($order->items as $item) {
            if ($item->product === null) {
                continue;
            }

            $this->decrementStock($item->product, $item->qty);
        }
    }

    public function isLowStock(Product $product, int $threshold = 5): bool
    {
        return $product->stock <= $threshold;
    }
}
