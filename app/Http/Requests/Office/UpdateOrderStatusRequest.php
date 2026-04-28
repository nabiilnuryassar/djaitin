<?php

namespace App\Http\Requests\Office;

use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Order $order */
        $order = $this->route('order');

        return $this->user()?->can('updateStatus', $order) ?? false;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([
                OrderStatus::PendingPayment->value,
                OrderStatus::InProgress->value,
                OrderStatus::Done->value,
                OrderStatus::Delivered->value,
                OrderStatus::Pickup->value,
                OrderStatus::Closed->value,
                OrderStatus::Cancelled->value,
            ])],
        ];
    }
}
