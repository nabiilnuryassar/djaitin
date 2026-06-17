<?php

namespace App\Http\Requests\Office;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Services\OrderStatusService;
use Closure;
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
            'status' => [
                'required',
                Rule::in(array_map(fn (OrderStatus $status): string => $status->value, OrderStatus::cases())),
                function (string $attribute, mixed $value, Closure $fail): void {
                    /** @var Order $order */
                    $order = $this->route('order');
                    $target = OrderStatus::tryFrom((string) $value);

                    if ($target === null) {
                        return;
                    }

                    $allowed = app(OrderStatusService::class)->allowedTargets($order, $this->user());

                    if (! in_array($target, $allowed, true)) {
                        $fail('Anda tidak berwenang memindahkan order ke status tersebut, atau transisi itu tidak diizinkan dari status saat ini.');
                    }
                },
            ],
        ];
    }
}
