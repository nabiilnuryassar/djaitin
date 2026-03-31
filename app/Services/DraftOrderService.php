<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DraftOrderService
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected PaymentService $paymentService,
        protected TailorPricingService $tailorPricingService,
    ) {
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function saveDraft(
        User $user,
        Customer $customer,
        array $payload,
        ?Order $draft = null,
        ?string $ipAddress = null,
    ): Order
    {
        return DB::transaction(function () use ($user, $customer, $payload, $draft, $ipAddress): Order {
            $draftPayload = $this->sanitizeDraftPayload($payload);
            $draftOrder = $draft ?? Order::query()->create([
                'order_number' => $this->nextDraftNumber(),
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::Draft,
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'created_by' => $user->id,
                'subtotal' => 0,
                'discount_amount' => 0,
                'total_amount' => 0,
                'paid_amount' => 0,
                'outstanding_amount' => 0,
                'is_loyalty_applied' => false,
            ]);

            $draftOrder->update([
                'garment_model_id' => $draftPayload['garment_model_id'] ?? null,
                'fabric_id' => $draftPayload['fabric_id'] ?? null,
                'user_id' => $user->id,
                'measurement_id' => ($draftPayload['measurement_mode'] ?? null) === 'saved'
                    ? ($draftPayload['measurement_id'] ?? null)
                    : null,
                'measurement_mode' => $draftPayload['measurement_mode'] ?? null,
                'due_date' => $draftPayload['due_date'] ?? null,
                'spec_notes' => $draftPayload['spec_notes'] ?? null,
                'draft_payload' => $draftPayload,
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'customer.order_draft_saved',
                auditable: $draftOrder,
                newValues: [
                    'status' => $draftOrder->status->value,
                    'measurement_mode' => $draftOrder->measurement_mode,
                ],
                notes: 'Draft order customer disimpan.',
                ipAddress: $ipAddress,
            );

            return $draftOrder->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function submitDraft(
        Order $draft,
        User $user,
        array $payload,
        ?string $ipAddress = null,
    ): Order
    {
        /** @var Customer $customer */
        $customer = $user->customer()->firstOrFail();

        return DB::transaction(function () use ($draft, $user, $customer, $payload, $ipAddress): Order {
            $garmentModel = GarmentModel::query()->findOrFail($payload['garment_model_id']);
            $fabric = Fabric::query()->findOrFail($payload['fabric_id']);
            $qty = (int) $payload['qty'];
            $pricing = $this->tailorPricingService->quote($customer, $garmentModel, $fabric, $qty);
            $measurement = $this->resolveMeasurement($customer, $payload);

            $draft->update([
                'order_type' => OrderType::Tailor,
                'status' => OrderStatus::PendingPayment,
                'customer_id' => $customer->id,
                'user_id' => $user->id,
                'created_by' => $user->id,
                'garment_model_id' => $garmentModel->id,
                'fabric_id' => $fabric->id,
                'measurement_id' => $measurement?->id,
                'measurement_mode' => $payload['measurement_mode'],
                'due_date' => $payload['due_date'] ?? null,
                'spec_notes' => $payload['spec_notes'] ?? null,
                'subtotal' => $pricing['subtotal'],
                'discount_amount' => $pricing['discount_amount'],
                'total_amount' => $pricing['total_amount'],
                'paid_amount' => 0,
                'outstanding_amount' => $pricing['total_amount'],
                'is_loyalty_applied' => $pricing['discount_amount'] > 0,
                'draft_payload' => null,
            ]);

            $draft->items()->delete();

            OrderItem::query()->create([
                'order_id' => $draft->id,
                'item_name' => $garmentModel->name,
                'description' => $payload['spec_notes'] ?? null,
                'qty' => $qty,
                'unit_price' => $pricing['unit_price'],
                'discount_amount' => $pricing['discount_amount'],
                'discount_percent' => $pricing['discount_percent'],
                'subtotal' => $pricing['total_amount'],
            ]);

            $this->paymentService->record($draft, [
                'method' => $payload['payment']['method'],
                'amount' => $payload['payment']['amount'],
                'reference_number' => $payload['payment']['reference_number'],
                'notes' => $payload['payment']['notes'] ?? null,
                'proof_image_path' => $this->storeProof($payload['payment']['proof'] ?? null),
            ], $user, $ipAddress);

            $this->auditLogService->log(
                user: $user,
                action: 'customer.order_submitted',
                auditable: $draft,
                oldValues: ['status' => OrderStatus::Draft->value],
                newValues: ['status' => OrderStatus::PendingPayment->value],
                notes: 'Draft order customer disubmit menjadi order aktif.',
                ipAddress: $ipAddress,
            );

            return $draft->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    protected function resolveMeasurement(Customer $customer, array $payload): ?Measurement
    {
        return match ($payload['measurement_mode']) {
            'saved' => Measurement::query()
                ->whereKey($payload['measurement_id'])
                ->where('customer_id', $customer->id)
                ->firstOrFail(),
            'manual' => Measurement::query()->create([
                'customer_id' => $customer->id,
                'label' => $payload['manual_measurement']['label'] ?? 'Ukuran Manual '.now()->format('Y-m-d'),
                'chest' => $payload['manual_measurement']['chest'] ?? null,
                'waist' => $payload['manual_measurement']['waist'] ?? null,
                'hips' => $payload['manual_measurement']['hips'] ?? null,
                'shoulder' => $payload['manual_measurement']['shoulder'] ?? null,
                'sleeve_length' => $payload['manual_measurement']['sleeve_length'] ?? null,
                'shirt_length' => $payload['manual_measurement']['shirt_length'] ?? null,
                'inseam' => $payload['manual_measurement']['inseam'] ?? null,
                'trouser_waist' => $payload['manual_measurement']['trouser_waist'] ?? null,
                'notes' => $payload['manual_measurement']['notes'] ?? null,
            ]),
            'offline' => null,
            default => throw ValidationException::withMessages([
                'measurement_mode' => 'Mode ukuran tidak valid.',
            ]),
        };
    }

    protected function nextDraftNumber(): string
    {
        return 'DRF-'.now()->format('YmdHis').'-'.str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function sanitizeDraftPayload(array $payload): array
    {
        $sanitized = [];

        foreach ($payload as $key => $value) {
            if ($value instanceof UploadedFile) {
                continue;
            }

            if (is_array($value)) {
                $sanitized[$key] = $this->sanitizeDraftPayload($value);

                continue;
            }

            $sanitized[$key] = $value;
        }

        return $sanitized;
    }

    protected function storeProof(mixed $proof): ?string
    {
        if (! $proof instanceof UploadedFile) {
            return null;
        }

        return $proof->store('payments/proofs', 'public');
    }
}
