<?php

namespace App\Http\Controllers\Customer;

use App\Enums\PaymentMethod;
use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\CheckoutRequest;
use App\Models\Courier;
use App\Services\CartService;
use App\Services\ReadyWearOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(
        protected CartService $cartService,
        protected ReadyWearOrderService $readyWearOrderService,
    ) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $cart = $this->cartService->getOrCreate($request->user());
        $this->authorize('view', $cart);
        $cart->load('items.product');

        if ($cart->items->isEmpty()) {
            return to_route('customer.cart.index')
                ->with('error', 'Keranjang masih kosong.');
        }

        $customer = $request->user()->customer()->firstOrFail();

        return Inertia::render('Customer/Checkout/Index', [
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
                        'final_price' => $item->product === null
                            ? 0
                            : $item->product->finalPrice(),
                    ],
                ])->values(),
            ],
            'addresses' => $customer->addresses()
                ->orderByDesc('is_default')
                ->latest('updated_at')
                ->get()
                ->map(fn ($address): array => [
                    'id' => $address->id,
                    'label' => $address->label,
                    'recipient_name' => $address->recipient_name,
                    'phone' => $address->phone,
                    'full_address' => collect([
                        $address->address_line,
                        $address->city,
                        $address->province,
                        $address->postal_code,
                    ])->filter()->implode(', '),
                    'is_default' => $address->is_default,
                ])
                ->values(),
            'couriers' => Courier::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Courier $courier): array => [
                    'id' => $courier->id,
                    'name' => $courier->name,
                ])
                ->values(),
            'summary' => [
                'subtotal' => $cart->totalAmount(),
                'delivery_fee' => (float) ReadyWearOrderService::DELIVERY_FEE,
            ],
            'paymentMethods' => [
                ['value' => PaymentMethod::Cash->value, 'label' => 'Cash saat pickup'],
                ['value' => PaymentMethod::Transfer->value, 'label' => 'Transfer'],
            ],
        ]);
    }

    public function store(CheckoutRequest $request): RedirectResponse
    {
        $cart = $this->cartService->getOrCreate($request->user());
        $this->authorize('update', $cart);
        $cart->load('items.product');

        if ($cart->items->isEmpty()) {
            return to_route('customer.cart.index')
                ->with('error', 'Keranjang masih kosong.');
        }

        $payload = $request->validated();
        $proofPath = $request->file('payment.proof')?->store('payments/proofs', 'public');

        unset($payload['payment']['proof']);
        $payload['payment']['proof_image_path'] = $proofPath;

        $order = $this->readyWearOrderService->createFromCart(
            $cart,
            $payload,
            $request->user(),
            $request->ip(),
        );

        return to_route('customer.orders.show', $order)
            ->with('success', 'Order ready-to-wear berhasil dibuat.');
    }
}
