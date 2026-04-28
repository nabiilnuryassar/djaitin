<?php

namespace App\Http\Requests\Customer;

use App\Enums\OrderAttachmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->canAccessCustomer() ?? false;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'title' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
            'attachment_type' => ['required', Rule::in(array_column(OrderAttachmentType::cases(), 'value'))],
        ];
    }
}
