<?php

namespace App\Http\Requests\Customer;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UploadPaymentProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->route('payment')) ?? false;
    }

    public function rules(): array
    {
        return [
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Payment|null $payment */
                $payment = $this->route('payment');

                if ($payment === null) {
                    return;
                }

                if ($payment->method !== PaymentMethod::Transfer) {
                    $validator->errors()->add('payment', 'Hanya pembayaran transfer yang dapat menerima bukti transfer.');
                }

                if (! in_array($payment->status, [PaymentStatus::PendingVerification, PaymentStatus::Rejected], true)) {
                    $validator->errors()->add('payment', 'Status pembayaran saat ini tidak dapat menerima upload bukti transfer.');
                }

                $orderStatus = $payment->order?->status;
                if (in_array($orderStatus, [OrderStatus::Closed, OrderStatus::Cancelled], true)) {
                    $validator->errors()->add('payment', 'Order terkait sudah ditutup. Upload bukti transfer tidak diizinkan.');
                }
            },
        ];
    }
}
