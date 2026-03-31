<?php

namespace Database\Factories;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 150000, 750000);
        $discountAmount = 0;
        $totalAmount = $subtotal - $discountAmount;

        return [
            'order_number' => 'ORD-'.fake()->unique()->numerify('######'),
            'order_type' => OrderType::Tailor,
            'status' => OrderStatus::PendingPayment,
            'customer_id' => Customer::factory(),
            'user_id' => null,
            'created_by' => User::factory()->kasir(),
            'garment_model_id' => GarmentModel::factory(),
            'fabric_id' => Fabric::factory(),
            'measurement_id' => null,
            'due_date' => now()->addWeek(),
            'company_name' => null,
            'spec_notes' => fake()->sentence(),
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'shipping_cost' => 0,
            'total_amount' => $totalAmount,
            'paid_amount' => 0,
            'outstanding_amount' => $totalAmount,
            'is_loyalty_applied' => false,
            'loyalty_overridden_by' => null,
            'cancellation_reason' => null,
            'cancelled_by' => null,
            'cancelled_at' => null,
        ];
    }

    public function tailor(): static
    {
        return $this->state(fn (array $attributes) => [
            'order_type' => OrderType::Tailor,
        ]);
    }

    public function pendingPayment(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::PendingPayment,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::InProgress,
        ]);
    }

    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => OrderStatus::Closed,
            'paid_amount' => $attributes['total_amount'],
            'outstanding_amount' => 0,
        ]);
    }
}
