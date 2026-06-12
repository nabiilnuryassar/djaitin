<?php

namespace App\Http\Requests\Customer;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->route('order')) ?? false;
    }

    public function rules(): array
    {
        /** @var Order|null $order */
        $order = $this->route('order');
        $maxAmount = $order ? max((int) round((float) $order->outstanding_amount), 0) : PHP_INT_MAX;

        return [
            'method' => ['required', Rule::in([PaymentMethod::Transfer->value])],
            'amount' => ['required', 'numeric', 'min:1', "max:{$maxAmount}"],
            'reference_number' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Order|null $order */
                $order = $this->route('order');

                if (! $order) {
                    return;
                }

                $hasPendingVerification = $order->payments()
                    ->where('status', PaymentStatus::PendingVerification)
                    ->exists();

                if ($hasPendingVerification) {
                    $validator->errors()->add(
                        'payment',
                        'Masih ada pembayaran yang menunggu verifikasi. Tunggu hasil verifikasi sebelum mengirim lagi.',
                    );
                }

                if (in_array($order->status, [OrderStatus::Closed, OrderStatus::Cancelled], true)) {
                    $validator->errors()->add(
                        'order',
                        'Order sudah ditutup sehingga tidak dapat menerima pembayaran baru.',
                    );
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'amount.max' => 'Nominal pembayaran melebihi sisa tagihan order.',
        ];
    }
}
