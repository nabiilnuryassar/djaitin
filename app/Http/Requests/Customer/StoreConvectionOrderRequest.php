<?php

namespace App\Http\Requests\Customer;

use App\Enums\PaymentMethod;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreConvectionOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'spec_notes' => ['nullable', 'string'],
            'reference_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_name' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:1'],
            'payment.method' => ['required', Rule::in([
                PaymentMethod::Cash->value,
                PaymentMethod::Transfer->value,
            ])],
            'payment.amount' => ['required', 'numeric', 'min:1'],
            'payment.reference_number' => ['nullable', 'string', 'max:255'],
            'payment.notes' => ['nullable', 'string'],
            'payment.proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->input('payment.method') === PaymentMethod::Transfer->value) {
                    if (! $this->filled('payment.reference_number')) {
                        $validator->errors()->add('payment.reference_number', 'Nomor referensi wajib diisi untuk transfer.');
                    }

                    if (! $this->hasFile('payment.proof')) {
                        $validator->errors()->add('payment.proof', 'Bukti transfer wajib diunggah.');
                    }
                }
            },
        ];
    }
}
