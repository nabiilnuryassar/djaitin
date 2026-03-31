<?php

namespace App\Http\Requests\Customer;

use App\Models\Measurement;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class SaveDraftRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'garment_model_id' => ['nullable', 'integer', 'exists:garment_models,id'],
            'fabric_id' => ['nullable', 'integer', 'exists:fabrics,id'],
            'measurement_mode' => ['nullable', Rule::in(['saved', 'manual', 'offline'])],
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
            'qty' => ['nullable', 'integer', 'min:1'],
            'due_date' => ['nullable', 'date', 'after_or_equal:today'],
            'spec_notes' => ['nullable', 'string'],
        ];
    }

    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($this->input('measurement_mode') !== 'saved' || ! $this->filled('measurement_id')) {
                    return;
                }

                $customerId = $this->user()?->customer?->id;

                if ($customerId === null) {
                    return;
                }

                $belongsToCustomer = Measurement::query()
                    ->whereKey($this->integer('measurement_id'))
                    ->where('customer_id', $customerId)
                    ->exists();

                if (! $belongsToCustomer) {
                    $validator->errors()->add('measurement_id', 'Ukuran yang dipilih tidak milik customer ini.');
                }
            },
        ];
    }
}
