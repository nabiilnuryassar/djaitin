<?php

namespace Database\Factories;

use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Measurement>
 */
class MeasurementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'customer_id' => Customer::factory(),
            'label' => 'Fitting '.fake()->monthName().' '.fake()->year(),
            'chest' => fake()->randomFloat(2, 80, 110),
            'waist' => fake()->randomFloat(2, 65, 95),
            'hips' => fake()->randomFloat(2, 80, 115),
            'shoulder' => fake()->randomFloat(2, 35, 50),
            'sleeve_length' => fake()->randomFloat(2, 45, 70),
            'shirt_length' => fake()->randomFloat(2, 55, 85),
            'inseam' => fake()->randomFloat(2, 60, 90),
            'trouser_waist' => fake()->randomFloat(2, 65, 95),
            'notes' => fake()->boolean(25) ? fake()->sentence() : null,
        ];
    }
}
