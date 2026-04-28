<?php

namespace App\Http\Requests\Customer;

use App\Enums\PaymentMethod;
use App\Models\Measurement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreTailorOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'garment_model_id' => ['required', 'integer', Rule::exists('garment_models', 'id')->where('is_active', true)],
            'fabric_id' => ['required', 'integer', Rule::exists('fabrics', 'id')->where('is_active', true)],
            'wizard_preferences' => ['nullable', 'array'],
            'wizard_preferences.desired_fit' => ['nullable', Rule::in(['Slim', 'Regular', 'Relaxed'])],
            'wizard_preferences.occasion' => ['nullable', Rule::in(['Office', 'Wedding', 'Daily', 'Event', 'Uniform'])],
            'wizard_preferences.style_traits' => ['nullable', 'array'],
            'wizard_preferences.style_traits.*' => ['string', Rule::in(['Wibawa', 'Kreatif', 'Efisien', 'Inovatif'])],
            'measurement_mode' => ['required', Rule::in(['saved', 'manual', 'offline'])],
            'measurement_id' => ['nullable', 'integer', 'exists:measurements,id'],
            'manual_measurement.label' => ['nullable', 'string', 'max:100'],
            'manual_measurement.chest' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.waist' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.hips' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.shoulder' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.sleeve_length' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.shirt_length' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.inseam' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.trouser_waist' => ['nullable', 'numeric', 'gt:0'],
            'manual_measurement.notes' => ['nullable', 'string'],
            'qty' => ['required', 'integer', 'min:1'],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
            'spec_notes' => ['nullable', 'string'],
            'payment.method' => ['required', Rule::in([PaymentMethod::Transfer->value])],
            'payment.amount' => ['required', 'numeric', 'min:1'],
            'payment.reference_number' => ['required', 'string', 'max:255'],
            'payment.notes' => ['nullable', 'string'],
            'payment.proof' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
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

                if ($this->string('measurement_mode')->value() === 'saved') {
                    if (! $this->filled('measurement_id')) {
                        $validator->errors()->add('measurement_id', 'Ukuran tersimpan wajib dipilih.');

                        return;
                    }

                    $belongsToCustomer = Measurement::query()
                        ->whereKey($this->integer('measurement_id'))
                        ->where('customer_id', $customerId)
                        ->exists();

                    if (! $belongsToCustomer) {
                        $validator->errors()->add('measurement_id', 'Ukuran yang dipilih tidak milik customer ini.');
                    }
                }

                if (
                    $this->string('measurement_mode')->value() === 'manual'
                    && ! $this->filled('manual_measurement.label')
                ) {
                    $validator->errors()->add('manual_measurement.label', 'Label ukuran manual wajib diisi.');
                }
            },
        ];
    }
}
