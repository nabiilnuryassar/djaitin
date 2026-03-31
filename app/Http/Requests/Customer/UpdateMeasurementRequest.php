<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('measurement')) ?? false;
    }

    public function rules(): array
    {
        return (new StoreMeasurementRequest())->rules();
    }
}
