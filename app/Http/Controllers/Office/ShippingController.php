<?php

namespace App\Http\Controllers\Office;

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\UpdateShipmentRequest;
use App\Models\Courier;
use App\Models\Shipment;
use App\Notifications\OrderShippedNotification;
use App\Services\AuditLogService;
use App\Services\OrderStatusService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShippingController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected OrderStatusService $orderStatusService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Shipment::class);

        $status = trim((string) $request->string('status'));

        $shipments = Shipment::query()
            ->with(['order.customer', 'courier'])
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Shipment $shipment): array => [
                'id' => $shipment->id,
                'status' => $shipment->status->value,
                'tracking_number' => $shipment->tracking_number,
                'recipient_name' => $shipment->recipient_name,
                'recipient_phone' => $shipment->recipient_phone,
                'recipient_address' => $shipment->recipient_address,
                'courier_id' => $shipment->courier_id,
                'courier_name' => $shipment->courier?->name,
                'notes' => $shipment->notes,
                'shipped_at' => optional($shipment->shipped_at)?->format('Y-m-d H:i'),
                'delivered_at' => optional($shipment->delivered_at)?->format('Y-m-d H:i'),
                'order' => [
                    'id' => $shipment->order?->id,
                    'order_number' => $shipment->order?->order_number,
                    'customer_name' => $shipment->order?->customer?->name,
                    'status' => $shipment->order?->status?->value,
                ],
            ]);

        return Inertia::render('Office/Shipping/Index', [
            'filters' => [
                'status' => $status,
            ],
            'shipments' => $shipments,
            'couriers' => Courier::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
            'statuses' => collect(ShipmentStatus::cases())
                ->map(fn (ShipmentStatus $item): array => [
                    'value' => $item->value,
                    'label' => str($item->value)->replace('_', ' ')->title()->value(),
                ])->values(),
            'can' => [
                'update' => $request->user()?->hasAnyRole([
                    \App\Enums\UserRole::Kasir,
                    \App\Enums\UserRole::Admin,
                ]) ?? false,
            ],
        ]);
    }

    public function update(UpdateShipmentRequest $request, Shipment $shipment): RedirectResponse
    {
        $payload = $request->validated();
        $previousStatus = $shipment->status;

        $shipment->fill($payload);

        if ($shipment->status === ShipmentStatus::Shipped && $shipment->shipped_at === null) {
            $shipment->shipped_at = now();
        }

        if ($shipment->status === ShipmentStatus::Delivered) {
            $shipment->shipped_at ??= now();
            $shipment->delivered_at = now();
        }

        if ($shipment->status === ShipmentStatus::Pickup) {
            $shipment->delivered_at = now();
        }

        $shipment->save();

        $this->auditLogService->log(
            user: $request->user(),
            action: 'shipment.updated',
            auditable: $shipment,
            oldValues: [
                'status' => $previousStatus->value,
                'tracking_number' => $shipment->getOriginal('tracking_number'),
            ],
            newValues: [
                'status' => $shipment->status->value,
                'tracking_number' => $shipment->tracking_number,
            ],
            notes: 'Informasi pengiriman diperbarui.',
            ipAddress: $request->ip(),
        );

        if (
            $shipment->status === ShipmentStatus::Shipped
            && $previousStatus !== ShipmentStatus::Shipped
            && $shipment->order?->customer?->user !== null
        ) {
            $shipment->loadMissing(['order.customer.user', 'courier']);

            $shipment->order->customer->user->notify(
                new OrderShippedNotification($shipment->order, $shipment),
            );
        }

        if (
            $shipment->status === ShipmentStatus::Delivered
            && $shipment->order !== null
            && $shipment->order->status !== OrderStatus::Delivered
        ) {
            $this->orderStatusService->transition(
                $shipment->order,
                OrderStatus::Delivered,
                $request->user(),
                $request->ip(),
            );
        }

        if (
            $shipment->status === ShipmentStatus::Pickup
            && $shipment->order !== null
            && $shipment->order->status !== OrderStatus::Pickup
        ) {
            $this->orderStatusService->transition(
                $shipment->order,
                OrderStatus::Pickup,
                $request->user(),
                $request->ip(),
            );
        }

        return back()->with('success', 'Informasi pengiriman berhasil diperbarui.');
    }
}
