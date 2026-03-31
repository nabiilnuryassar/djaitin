<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Customer;
use App\Models\DiscountPolicy;

class LoyaltyService
{
    public function getDiscountPercent(): int
    {
        return (int) (DiscountPolicy::query()
            ->where('key', 'loyalty_discount_percent')
            ->value('value') ?: 20);
    }

    public function getOrderThreshold(): int
    {
        return (int) (DiscountPolicy::query()
            ->where('key', 'loyalty_order_threshold')
            ->value('value') ?: 5);
    }

    public function syncCustomer(Customer $customer): Customer
    {
        $closedTailorOrders = $customer->orders()
            ->where('order_type', OrderType::Tailor)
            ->where('status', OrderStatus::Closed)
            ->count();

        $customer->forceFill([
            'loyalty_order_count' => $closedTailorOrders,
            'is_loyalty_eligible' => $closedTailorOrders > $this->getOrderThreshold(),
        ])->save();

        return $customer->refresh();
    }

    public function checkEligibility(Customer $customer): bool
    {
        return $this->syncCustomer($customer)->is_loyalty_eligible;
    }

    public function calculateDiscount(Customer $customer, float $subtotal): float
    {
        if (! $this->checkEligibility($customer)) {
            return 0;
        }

        return round($subtotal * ($this->getDiscountPercent() / 100), 2);
    }
}
