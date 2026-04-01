<?php

namespace App\Http\Requests\Customer;

use App\Enums\PaymentMethod;
use App\Models\Address;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'delivery_type' => ['required', Rule::in(['pickup', 'delivery'])],
            'address_id' => ['nullable', 'integer', 'exists:addresses,id'],
            'courier_id' => ['nullable', 'integer', Rule::exists('couriers', 'id')->where('is_active', true)],
            'payment.method' => ['required', Rule::in([
                PaymentMethod::Cash->value,
                PaymentMethod::Transfer->value,
            ])],
            'payment.amount' => ['nullable', 'numeric', 'min:1'],
            'payment.reference_number' => ['nullable', 'string', 'max:255'],
            'payment.notes' => ['nullable', 'string'],
            'payment.proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $customerId = $this->user()?->customer?->id;

                if ($customerId === null) {
                    $validator->errors()->add('customer', 'Customer profile tidak ditemukan.');

                    return;
                }

                if ($this->string('delivery_type')->value() === 'delivery') {
                    if (! $this->filled('address_id')) {
                        $validator->errors()->add('address_id', 'Alamat wajib dipilih untuk delivery.');
                    }

                    $addressBelongsToCustomer = Address::query()
                        ->whereKey($this->integer('address_id'))
                        ->where('customer_id', $customerId)
                        ->exists();

                    if ($this->filled('address_id') && ! $addressBelongsToCustomer) {
                        $validator->errors()->add('address_id', 'Alamat yang dipilih tidak milik customer ini.');
                    }

                    if (! $this->filled('courier_id')) {
                        $validator->errors()->add('courier_id', 'Kurir wajib dipilih untuk delivery.');
                    }
                }

                if ($this->input('payment.method') === PaymentMethod::Transfer->value) {
                    if (! $this->filled('payment.amount')) {
                        $validator->errors()->add('payment.amount', 'Nominal transfer wajib diisi.');
                    }

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
