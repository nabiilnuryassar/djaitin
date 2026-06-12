<?php

namespace App\Http\Requests\Office;

use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Payment::class) ?? false;
    }

    public function rules(): array
    {
        /** @var Order|null $order */
        $order = $this->route('order');
        $maxAmount = $order ? max((int) round((float) $order->outstanding_amount), 0) : PHP_INT_MAX;
        $cashProofThreshold = (float) config('djaitin.payment.cash_proof_required_above');
        $method = $this->string('method')->value();
        $amount = (float) $this->input('amount', 0);
        $proofIsRequired = $method === PaymentMethod::Transfer->value
            || ($method === PaymentMethod::Cash->value && $amount > $cashProofThreshold);

        return [
            'method' => ['required', Rule::in([
                PaymentMethod::Cash->value,
                PaymentMethod::Transfer->value,
            ])],
            'amount' => ['required', 'numeric', 'min:1', "max:{$maxAmount}"],
            'reference_number' => ['nullable', 'string', 'max:255', 'required_if:method,transfer'],
            'notes' => ['nullable', 'string'],
            'proof' => $proofIsRequired
                ? ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120']
                : ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ];
    }
}
