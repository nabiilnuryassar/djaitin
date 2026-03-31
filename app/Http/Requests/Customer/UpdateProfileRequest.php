<?php

namespace App\Http\Requests\Customer;

use App\Concerns\ProfileValidationRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    use ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            ...$this->profileRules($this->user()->id),
            'phone' => ['nullable', 'string', 'max:20'],
        ];
    }
}
