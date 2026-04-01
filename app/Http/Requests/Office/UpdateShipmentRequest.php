<?php

namespace App\Http\Requests\Office;

use App\Enums\ShipmentStatus;
use App\Models\Shipment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateShipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Shipment $shipment */
        $shipment = $this->route('shipment');

        return $this->user()?->can('update', $shipment) ?? false;
    }

    public function rules(): array
    {
        return [
            'courier_id' => ['nullable', 'exists:couriers,id'],
            'status' => ['required', Rule::enum(ShipmentStatus::class)],
            'tracking_number' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
