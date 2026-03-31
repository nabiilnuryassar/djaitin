<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Customer>
 */
class CustomerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'name' => fake()->name(),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
            'is_loyalty_eligible' => false,
            'loyalty_order_count' => 0,
        ];
    }

    public function loyal(int $orderCount = 6): static
    {
        return $this->state(fn (array $attributes) => [
            'is_loyalty_eligible' => true,
            'loyalty_order_count' => $orderCount,
        ]);
    }
}
