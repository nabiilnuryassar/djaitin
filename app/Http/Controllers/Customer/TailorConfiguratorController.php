<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Services\LoyaltyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TailorConfiguratorController extends Controller
{
    public function __construct(
        protected LoyaltyService $loyaltyService,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $customer = $request->user()?->customer;
        $draft = $customer?->orders()
            ->where('order_type', 'tailor')
            ->where('status', 'draft')
            ->latest()
            ->first();

        return Inertia::render('Customer/Tailor/Configurator', [
            'garmentModels' => GarmentModel::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (GarmentModel $garmentModel): array => [
                    'id' => $garmentModel->id,
                    'name' => $garmentModel->name,
                    'description' => $garmentModel->description,
                    'base_price' => (float) $garmentModel->base_price,
                ]),
            'fabrics' => Fabric::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get()
                ->map(fn (Fabric $fabric): array => [
                    'id' => $fabric->id,
                    'name' => $fabric->name,
                    'description' => $fabric->description,
                    'price_adjustment' => (float) $fabric->price_adjustment,
                ]),
            'discountPolicy' => [
                'percent' => $this->loyaltyService->getDiscountPercent(),
                'threshold' => $this->loyaltyService->getOrderThreshold(),
            ],
            'measurements' => $customer?->measurements()
                ->latest()
                ->get()
                ->map(fn ($measurement): array => [
                    'id' => $measurement->id,
                    'label' => $measurement->label ?: 'Ukuran '.optional($measurement->created_at)?->toDateString(),
                ])->values() ?? [],
            'customerMeta' => $customer === null ? null : [
                'id' => $customer->id,
                'is_loyalty_eligible' => $customer->is_loyalty_eligible,
                'loyalty_order_count' => $customer->loyalty_order_count,
            ],
            'draft' => $draft === null ? null : [
                'id' => $draft->id,
                'payload' => $draft->draft_payload,
            ],
        ]);
    }
}
