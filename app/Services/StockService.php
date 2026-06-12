<?php

namespace App\Services;

use App\Enums\OrderType;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function validateStock(Product $product, int $qty): void
    {
        $this->validateAvailableStock($product, $qty);
    }

    public function validateAvailableStock(Product $product, int $qty): void
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

        $availableStock = (int) $product->stock - (int) $product->reserved_stock;
        if ($availableStock < $qty) {
            throw ValidationException::withMessages([
                'qty' => "Stok {$product->name} tidak mencukupi (tersedia {$availableStock}, diminta {$qty}).",
            ]);
        }
    }

    public function decrementStock(Product $product, int $qty): Product
    {
        return DB::transaction(function () use ($product, $qty): Product {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($product->id);

            $this->validateAvailableStock($product, $qty);

            $product->decrement('stock', $qty);

            return $product->refresh();
        });
    }

    public function reserve(Product $product, int $qty): Product
    {
        return DB::transaction(function () use ($product, $qty): Product {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($product->id);

            $this->validateAvailableStock($product, $qty);

            $product->increment('reserved_stock', $qty);

            return $product->refresh();
        });
    }

    public function release(Product $product, int $qty): Product
    {
        return DB::transaction(function () use ($product, $qty): Product {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($product->id);

            $newReservedStock = max((int) $product->reserved_stock - $qty, 0);

            $product->update([
                'reserved_stock' => $newReservedStock,
            ]);

            return $product->refresh();
        });
    }

    public function commitReservation(Product $product, int $qty): Product
    {
        return DB::transaction(function () use ($product, $qty): Product {
            $product = Product::query()
                ->lockForUpdate()
                ->findOrFail($product->id);

            if ($qty < 1) {
                throw ValidationException::withMessages([
                    'qty' => 'Qty harus lebih besar dari nol.',
                ]);
            }

            if ((int) $product->reserved_stock >= $qty) {
                $product->decrement('stock', $qty);
                $product->decrement('reserved_stock', $qty);

                return $product->refresh();
            }

            // Backward compatibility: order lama belum memiliki reservasi stock.
            if ((int) $product->reserved_stock === 0 && (int) $product->stock >= $qty) {
                $product->decrement('stock', $qty);

                return $product->refresh();
            }

            throw ValidationException::withMessages([
                'product' => "Reservasi stok {$product->name} tidak konsisten untuk qty {$qty}.",
            ]);
        });
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

            $this->commitReservation($item->product, (int) $item->qty);
        }
    }

    public function isLowStock(Product $product, int $threshold = 5): bool
    {
        return ((int) $product->stock - (int) $product->reserved_stock) <= $threshold;
    }
}
