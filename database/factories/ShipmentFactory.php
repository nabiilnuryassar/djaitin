<?php

namespace Database\Factories;

use App\Enums\ShipmentStatus;
use App\Models\Courier;
use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Shipment>
 */
class ShipmentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'order_id' => Order::factory(),
            'courier_id' => Courier::factory(),
            'status' => ShipmentStatus::Pending,
            'recipient_name' => fake()->name(),
            'recipient_address' => fake()->address(),
            'recipient_phone' => fake()->phoneNumber(),
            'shipping_cost' => fake()->randomFloat(2, 12000, 45000),
            'tracking_number' => null,
            'shipped_at' => null,
            'delivered_at' => null,
            'notes' => fake()->sentence(),
        ];
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => ShipmentStatus::Delivered,
            'tracking_number' => 'TRK-'.fake()->unique()->numerify('######'),
            'shipped_at' => now()->subDays(2),
            'delivered_at' => now()->subDay(),
        ]);
    }
}
