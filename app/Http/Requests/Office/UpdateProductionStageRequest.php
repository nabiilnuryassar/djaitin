<?php

namespace App\Http\Requests\Office;

use App\Enums\ProductionStage;
use App\Models\Order;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductionStageRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Order $order */
        $order = $this->route('order');

        return $this->user()?->can('updateStatus', $order) ?? false;
    }

    public function rules(): array
    {
        return [
            'production_stage' => ['required', Rule::enum(ProductionStage::class)],
        ];
    }
}
