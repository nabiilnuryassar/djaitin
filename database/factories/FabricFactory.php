<?php

namespace Database\Factories;

use App\Models\Fabric;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fabric>
 */
class FabricFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Katun Jepang', 'Linen Blend', 'Oxford', 'Satin Premium']),
            'description' => fake()->sentence(),
            'price_adjustment' => fake()->randomFloat(2, 0, 75000),
            'is_active' => true,
        ];
    }
}
