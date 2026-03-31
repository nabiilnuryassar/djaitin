<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('address')) ?? false;
    }

    public function rules(): array
    {
        return (new StoreAddressRequest())->rules();
    }
}
