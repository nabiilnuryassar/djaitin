<?php

namespace Database\Factories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $basePrice = fake()->randomFloat(2, 80000, 220000);
        $discountPercent = fake()->randomElement([0, 0, 10, 15]);
        $sellingPrice = round($basePrice * (1.8), 2);
        $discountAmount = round($sellingPrice * ($discountPercent / 100), 2);

        return [
            'sku' => 'SKU-'.fake()->unique()->bothify('???-####'),
            'name' => fake()->randomElement([
                'Kemeja Linen',
                'Blouse Office',
                'Tunik Casual',
                'Celana Kulot',
                'Dress Midi',
            ]),
            'description' => fake()->sentence(),
            'category' => fake()->randomElement(['tops', 'bottoms', 'dress']),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL']),
            'base_price' => $basePrice,
            'selling_price' => $sellingPrice,
            'discount_amount' => $discountAmount,
            'discount_percent' => $discountPercent,
            'is_clearance' => false,
            'stock' => fake()->numberBetween(8, 35),
            'image_path' => null,
            'is_active' => true,
        ];
    }

    public function clearance(): static
    {
        return $this->state(function (array $attributes): array {
            $discountPercent = 25;
            $discountAmount = round((float) $attributes['selling_price'] * ($discountPercent / 100), 2);

            return [
                'discount_percent' => $discountPercent,
                'discount_amount' => $discountAmount,
                'is_clearance' => true,
            ];
        });
    }
}
