<?php

namespace App\Http\Requests\Office\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Product::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'sku' => ['required', 'string', 'max:100', 'unique:products,sku'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:100'],
            'size' => ['required', 'string', 'max:20'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'discount_amount' => ['nullable', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_clearance' => ['sometimes', 'boolean'],
            'stock' => ['required', 'integer', 'min:0'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * Cross-field validation: harga jual akhir (selling_price - discount_amount)
     * tidak boleh di bawah harga pokok (base_price). Sesuai narasi PRD:
     * "kalau perlu bahkan dijual sesuai dengan harga pokoknya" — HPP adalah floor.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function ($v) {
            $basePrice = (float) $this->input('base_price', 0);
            $sellingPrice = (float) $this->input('selling_price', 0);
            $discountAmount = (float) $this->input('discount_amount', 0);
            $finalPrice = round($sellingPrice - $discountAmount, 2);

            if ($finalPrice < $basePrice) {
                $v->errors()->add(
                    'discount_amount',
                    'Harga jual akhir tidak boleh di bawah harga pokok ('.number_format($basePrice, 0, ',', '.').'). Sesuai aturan, clearance maksimum dijual sama dengan harga pokok.',
                );
            }
        });
    }
}
