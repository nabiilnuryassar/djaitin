<?php

namespace App\Http\Requests\Office;

use App\Enums\PaymentMethod;
use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Payment::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in([
                PaymentMethod::Cash->value,
                PaymentMethod::Transfer->value,
            ])],
            'amount' => ['required', 'numeric', 'min:1'],
            'reference_number' => ['nullable', 'string', 'max:255', 'required_if:method,transfer'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
