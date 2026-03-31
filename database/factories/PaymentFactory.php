<?php

namespace Database\Factories;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'payment_number' => 'PAY-'.fake()->unique()->numerify('######'),
            'order_id' => Order::factory(),
            'method' => PaymentMethod::Cash,
            'status' => PaymentStatus::Verified,
            'amount' => fake()->randomFloat(2, 50000, 300000),
            'reference_number' => null,
            'proof_image_path' => null,
            'payment_date' => now(),
            'created_by' => User::factory()->kasir(),
            'verified_by' => User::factory()->admin(),
            'verified_at' => now(),
            'rejection_reason' => null,
            'notes' => fake()->sentence(),
        ];
    }

    public function cash(): static
    {
        return $this->state(fn (array $attributes) => [
            'method' => PaymentMethod::Cash,
            'status' => PaymentStatus::Verified,
            'reference_number' => null,
            'verified_at' => now(),
        ]);
    }

    public function transfer(): static
    {
        return $this->state(fn (array $attributes) => [
            'method' => PaymentMethod::Transfer,
            'status' => PaymentStatus::PendingVerification,
            'reference_number' => 'TRX-'.fake()->unique()->numerify('######'),
            'verified_by' => null,
            'verified_at' => null,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::PendingVerification,
            'verified_by' => null,
            'verified_at' => null,
        ]);
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => PaymentStatus::Verified,
            'verified_by' => User::factory()->admin(),
            'verified_at' => now(),
        ]);
    }
}
