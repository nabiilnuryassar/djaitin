<?php

namespace App\Services;

use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;

class TailorPricingService
{
    public function __construct(
        protected LoyaltyService $loyaltyService,
    ) {
    }

    /**
     * @return array{
     *     unit_price: float,
     *     subtotal: float,
     *     discount_amount: float,
     *     discount_percent: float,
     *     total_amount: float
     * }
     */
    public function quote(Customer $customer, GarmentModel $garmentModel, Fabric $fabric, int $qty): array
    {
        $unitPrice = round((float) $garmentModel->base_price + (float) $fabric->price_adjustment, 2);
        $subtotal = round($unitPrice * $qty, 2);
        $discountAmount = $this->loyaltyService->calculateDiscount($customer, $subtotal);
        $discountPercent = $discountAmount > 0 ? (float) $this->loyaltyService->getDiscountPercent() : 0.0;

        return [
            'unit_price' => $unitPrice,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'discount_percent' => $discountPercent,
            'total_amount' => round($subtotal - $discountAmount, 2),
        ];
    }
}
