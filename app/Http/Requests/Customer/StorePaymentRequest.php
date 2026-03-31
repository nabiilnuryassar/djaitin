<?php

namespace App\Http\Requests\Customer;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('view', $this->route('order')) ?? false;
    }

    public function rules(): array
    {
        return [
            'method' => ['required', Rule::in([PaymentMethod::Transfer->value])],
            'amount' => ['required', 'numeric', 'min:1'],
            'reference_number' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
