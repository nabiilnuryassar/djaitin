<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Services\CartService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function index(Request $request): Response
    {
        $cart = $this->cartService->getOrCreate($request->user());
        $this->authorize('view', $cart);

        $cart->load('items.product');

        return Inertia::render('Customer/Cart/Index', [
            'cart' => [
                'id' => $cart->id,
                'items' => $cart->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'qty' => $item->qty,
                    'subtotal' => $item->subtotalAmount(),
                    'product' => [
                        'id' => $item->product?->id,
                        'name' => $item->product?->name,
                        'size' => $item->product?->size,
                        'category' => $item->product?->category,
                        'stock' => $item->product?->stock,
                        'image_path' => $item->product?->image_path,
                        'selling_price' => $item->product === null ? 0 : (float) $item->product->selling_price,
                        'discount_amount' => $item->product === null ? 0 : (float) $item->product->discount_amount,
                        'final_price' => $item->product === null
                            ? 0
                            : $item->product->finalPrice(),
                    ],
                ])->values(),
            ],
            'summary' => [
                'items_count' => $cart->items->sum('qty'),
                'total_amount' => $cart->totalAmount(),
            ],
        ]);
    }
}
