<?php

namespace App\Http\Requests\Office;

use App\Enums\OrderAttachmentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderAttachmentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->canAccessOffice() ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
            'title' => ['required', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
            'attachment_type' => ['required', Rule::in(array_column(OrderAttachmentType::cases(), 'value'))],
        ];
    }
}
