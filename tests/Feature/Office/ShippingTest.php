<?php

use App\Enums\OrderStatus;
use App\Enums\ShipmentStatus;
use App\Models\AuditLog;
use App\Models\Order;
use App\Models\Shipment;
use App\Models\User;

test('shipping update is recorded in audit log', function () {
    $admin = User::factory()->admin()->create();
    $shipment = Shipment::factory()->create();

    $this->actingAs($admin)->put(route('office.shipments.update', $shipment), [
        'courier_id' => $shipment->courier_id,
        'status' => ShipmentStatus::Shipped->value,
        'tracking_number' => 'TRK-0001',
        'notes' => 'Dikirim ke pelanggan',
    ])->assertRedirect();

    expect($shipment->refresh()->status)->toBe(ShipmentStatus::Shipped)
        ->and($shipment->tracking_number)->toBe('TRK-0001')
        ->and(AuditLog::query()->where('action', 'shipment.updated')->count())
        ->toBe(1);
});

test('delivered shipment updates the related order status', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->inProgress()->create();
    $shipment = Shipment::factory()->for($order)->create();

    $this->actingAs($admin)->put(route('office.shipments.update', $shipment), [
        'courier_id' => $shipment->courier_id,
        'status' => ShipmentStatus::Delivered->value,
        'tracking_number' => 'TRK-DELIVERED',
        'notes' => 'Sudah diterima',
    ])->assertRedirect();

    expect($shipment->refresh()->status)->toBe(ShipmentStatus::Delivered)
        ->and($order->refresh()->status)->toBe(OrderStatus::Delivered);
});
