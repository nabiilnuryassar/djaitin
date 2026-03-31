<?php

namespace App\Http\Requests\Customer;

use App\Models\Measurement;
use Illuminate\Foundation\Http\FormRequest;

class StoreMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Measurement::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'label' => ['nullable', 'string', 'max:100'],
            'chest' => ['nullable', 'numeric', 'min:0'],
            'waist' => ['nullable', 'numeric', 'min:0'],
            'hips' => ['nullable', 'numeric', 'min:0'],
            'shoulder' => ['nullable', 'numeric', 'min:0'],
            'sleeve_length' => ['nullable', 'numeric', 'min:0'],
            'shirt_length' => ['nullable', 'numeric', 'min:0'],
            'inseam' => ['nullable', 'numeric', 'min:0'],
            'trouser_waist' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
