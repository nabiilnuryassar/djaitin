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

    /**
     * Batas minimum order tailor closed untuk loyalti.
     *
     * Sesuai PRD: pelanggan yang telah menjahit LEBIH DARI 5 kali mendapat
     * diskon loyalti 20%. Artinya eligible mulai order ke-6.
     * Logika: closedTailorOrders > threshold (default 5).
     */
    public function getOrderThreshold(): int
    {
        return (int) (DiscountPolicy::query()
            ->where('key', 'loyalty_order_threshold')
            ->value('value') ?: 5);
    }

    /**
     * Sinkronkan status loyalti customer berdasarkan jumlah order tailor closed.
     *
     * Menggunakan operator `>` (bukan `>=`) sehingga eligible jika
     * jumlah order closed MELEBIHI threshold. Default threshold = 5,
     * maka customer eligible mulai dari order ke-6.
     */
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
