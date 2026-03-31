<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $qty = fake()->numberBetween(1, 4);
        $unitPrice = fake()->randomFloat(2, 100000, 400000);
        $subtotal = $qty * $unitPrice;

        return [
            'order_id' => Order::factory(),
            'product_id' => null,
            'item_name' => fake()->randomElement(['Kemeja Custom', 'Tunik Harian']),
            'description' => fake()->sentence(),
            'size' => null,
            'qty' => $qty,
            'unit_price' => $unitPrice,
            'discount_amount' => 0,
            'discount_percent' => 0,
            'subtotal' => $subtotal,
        ];
    }
}
