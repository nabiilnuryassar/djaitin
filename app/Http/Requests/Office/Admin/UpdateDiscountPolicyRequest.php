<?php

namespace App\Http\Requests\Office\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;

class UpdateDiscountPolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole(UserRole::Admin) ?? false;
    }

    public function rules(): array
    {
        return [
            'loyalty_discount_percent' => ['required', 'numeric', 'min:0', 'max:100'],
            'loyalty_order_threshold' => ['required', 'integer', 'min:1'],
        ];
    }
}
