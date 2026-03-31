<?php

namespace App\Http\Requests\Office;

use App\Enums\PaymentMethod;
use App\Models\Measurement;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTailorOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Order::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'garment_model_id' => ['required', 'integer', 'exists:garment_models,id'],
            'fabric_id' => ['required', 'integer', 'exists:fabrics,id'],
            'measurement_id' => ['nullable', 'integer', 'exists:measurements,id'],
            'qty' => ['required', 'integer', 'min:1'],
            'unit_price' => ['required', 'numeric', 'min:1'],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
            'spec_notes' => ['nullable', 'string'],
            'payment.method' => ['required', Rule::in([
                PaymentMethod::Cash->value,
                PaymentMethod::Transfer->value,
            ])],
            'payment.amount' => ['required', 'numeric', 'min:1'],
            'payment.reference_number' => ['nullable', 'string', 'max:255', 'required_if:payment.method,transfer'],
            'payment.notes' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function ($validator): void {
                $measurementId = $this->input('measurement_id');
                $customerId = $this->integer('customer_id');

                if ($measurementId === null) {
                    return;
                }

                $belongsToCustomer = Measurement::query()
                    ->whereKey($measurementId)
                    ->where('customer_id', $customerId)
                    ->exists();

                if (! $belongsToCustomer) {
                    $validator->errors()->add('measurement_id', 'Ukuran yang dipilih tidak milik pelanggan ini.');
                }
            },
        ];
    }
}
