<?php

namespace App\Http\Requests\Office;

use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;

class RefundPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Payment $payment */
        $payment = $this->route('payment');

        return $this->user()?->can('refund', $payment) ?? false;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ];
    }
}
