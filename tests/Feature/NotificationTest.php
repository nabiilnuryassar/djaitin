<?php

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ShipmentStatus;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Shipment;
use App\Models\User;
use App\Notifications\OrderInProgressNotification;
use App\Notifications\OrderShippedNotification;
use App\Notifications\PaymentRejectedNotification;
use App\Notifications\PaymentVerifiedNotification;
use App\Services\OrderStatusService;
use App\Services\PaymentService;
use Illuminate\Support\Facades\Notification;

test('payment verified notification is sent only to the related customer', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $otherCustomerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->create([
        'status' => OrderStatus::PendingPayment,
        'subtotal' => 320000,
        'total_amount' => 320000,
        'paid_amount' => 0,
        'outstanding_amount' => 320000,
    ]);
    $payment = Payment::factory()->for($order)->transfer()->create([
        'status' => PaymentStatus::PendingVerification,
        'amount' => 320000,
    ]);

    app(PaymentService::class)->verifyTransfer($payment, $admin);

    expect($payment->refresh()->status)->toBe(PaymentStatus::Verified)
        ->and($order->refresh()->paid_amount)->toBe('320000.00');

    Notification::assertSentTo(
        $customerUser,
        PaymentVerifiedNotification::class,
        fn (PaymentVerifiedNotification $notification): bool => $notification->toArray($customerUser)['order_id'] === $order->id
            && $notification->toArray($customerUser)['payment_amount'] === 320000.0
    );
    Notification::assertNotSentTo($otherCustomerUser, PaymentVerifiedNotification::class);
});

test('payment rejected notification is sent only to the related customer', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $otherCustomerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->create();
    $payment = Payment::factory()->for($order)->transfer()->create([
        'status' => PaymentStatus::PendingVerification,
    ]);

    app(PaymentService::class)->reject($payment, $admin, 'Bukti transfer buram');

    expect($payment->refresh()->status)->toBe(PaymentStatus::Rejected)
        ->and($payment->rejection_reason)->toBe('Bukti transfer buram');

    Notification::assertSentTo(
        $customerUser,
        PaymentRejectedNotification::class,
        fn (PaymentRejectedNotification $notification): bool => $notification->toArray($customerUser)['rejection_reason'] === 'Bukti transfer buram'
            && $notification->toArray($customerUser)['order_id'] === $order->id
    );
    Notification::assertNotSentTo($otherCustomerUser, PaymentRejectedNotification::class);
});

test('order in progress notification is sent only to the related customer', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $otherCustomerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->create([
        'status' => OrderStatus::PendingPayment,
        'total_amount' => 500000,
        'paid_amount' => 250000,
        'outstanding_amount' => 250000,
    ]);

    app(OrderStatusService::class)->transition(
        $order,
        OrderStatus::InProgress,
        $admin,
    );

    expect($order->refresh()->status)->toBe(OrderStatus::InProgress);

    Notification::assertSentTo(
        $customerUser,
        OrderInProgressNotification::class,
        fn (OrderInProgressNotification $notification): bool => $notification->toArray($customerUser)['order_id'] === $order->id
            && $notification->toArray($customerUser)['order_number'] === $order->order_number
    );
    Notification::assertNotSentTo($otherCustomerUser, OrderInProgressNotification::class);
});

test('order shipped notification is sent when shipment becomes shipped', function () {
    Notification::fake();

    $admin = User::factory()->admin()->create();
    $customerUser = User::factory()->customer()->create();
    $otherCustomerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->inProgress()->create();
    $shipment = Shipment::factory()->for($order)->create([
        'status' => ShipmentStatus::Pending,
        'tracking_number' => null,
    ]);

    $this->actingAs($admin)
        ->put(route('office.shipments.update', $shipment), [
            'courier_id' => $shipment->courier_id,
            'status' => ShipmentStatus::Shipped->value,
            'tracking_number' => 'TRK-PHASE6',
            'notes' => 'Dikirim hari ini',
        ])
        ->assertRedirect();

    expect($shipment->refresh()->status)->toBe(ShipmentStatus::Shipped)
        ->and($shipment->tracking_number)->toBe('TRK-PHASE6');

    Notification::assertSentTo(
        $customerUser,
        OrderShippedNotification::class,
        fn (OrderShippedNotification $notification): bool => $notification->toArray($customerUser)['tracking_number'] === 'TRK-PHASE6'
            && $notification->toArray($customerUser)['order_id'] === $order->id
    );
    Notification::assertNotSentTo($otherCustomerUser, OrderShippedNotification::class);
});
