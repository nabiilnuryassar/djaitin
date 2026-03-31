<?php

namespace Database\Factories;

use App\Models\GarmentModel;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GarmentModel>
 */
class GarmentModelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Kemeja Formal', 'Tunik Casual', 'Blouse Kantor', 'Gamis Simpel']),
            'description' => fake()->sentence(),
            'image_path' => null,
            'base_price' => fake()->randomFloat(2, 180000, 450000),
            'is_active' => true,
        ];
    }
}
