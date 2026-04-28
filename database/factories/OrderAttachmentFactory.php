<?php

namespace Database\Factories;

use App\Enums\OrderAttachmentType;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\OrderAttachment>
 */
class OrderAttachmentFactory extends Factory
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
            'file_path' => 'order-attachments/'.fake()->uuid().'.pdf',
            'file_name' => fake()->word().'.pdf',
            'title' => fake()->sentence(3),
            'notes' => fake()->sentence(),
            'attachment_type' => OrderAttachmentType::Other,
            'file_type' => 'application/pdf',
            'uploaded_by' => User::factory()->customer(),
        ];
    }
}
