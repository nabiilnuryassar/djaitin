<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreCartItemRequest;
use App\Http\Requests\Customer\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CartItemController extends Controller
{
    public function __construct(
        protected CartService $cartService,
    ) {}

    public function store(StoreCartItemRequest $request): RedirectResponse
    {
        $cart = $this->cartService->getOrCreate($request->user());
        $this->authorize('create', $cart);

        $product = Product::query()
            ->whereKey($request->integer('product_id'))
            ->where('is_active', true)
            ->firstOrFail();

        $this->cartService->addItem(
            $cart,
            $product,
            $request->integer('qty'),
        );

        return to_route('customer.cart.index')
            ->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function update(UpdateCartItemRequest $request, CartItem $item): RedirectResponse
    {
        $item->load('cart', 'product');
        $this->authorize('update', $item->cart);

        $this->cartService->updateItem($item, $request->integer('qty'));

        return back()->with('success', 'Qty produk di keranjang berhasil diperbarui.');
    }

    public function destroy(Request $request, CartItem $item): RedirectResponse
    {
        $item->load('cart');
        $this->authorize('delete', $item->cart);

        $this->cartService->removeItem($item);

        return back()->with('success', 'Produk berhasil dihapus dari keranjang.');
    }
}
