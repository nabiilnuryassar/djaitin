<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreConvectionOrderRequest;
use App\Services\ConvectionOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ConvectionController extends Controller
{
    public function __construct(
        protected ConvectionOrderService $convectionOrderService,
    ) {}

    public function create(Request $request): Response
    {
        $customer = $request->user()?->customer()->firstOrFail();

        return Inertia::render('Customer/Convection/Create', [
            'customer' => [
                'name' => $customer->name,
                'email' => $request->user()?->email,
                'phone' => $customer->phone,
            ],
            'paymentMethods' => [
                ['value' => 'cash', 'label' => 'Cash / pelunasan langsung'],
                ['value' => 'transfer', 'label' => 'Transfer penuh'],
            ],
        ]);
    }

    public function store(StoreConvectionOrderRequest $request): RedirectResponse
    {
        $payload = $request->validated();
        $payload['payment']['proof_image_path'] = $request->file('payment.proof')?->store('payments/proofs', 'public');

        $order = $this->convectionOrderService->create(
            $payload,
            $request->user(),
            $request->ip(),
        );

        return to_route('customer.orders.show', $order)
            ->with('success', 'Permintaan konveksi berhasil dikirim.');
    }
}
