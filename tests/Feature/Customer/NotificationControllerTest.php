<?php

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\PaymentVerifiedNotification;
use Inertia\Testing\AssertableInertia as Assert;

test('customer only sees their own notifications', function () {
    $customerUser = User::factory()->customer()->create();
    $otherCustomerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->create();
    $otherOrder = Order::factory()->for($otherCustomerUser->customer()->firstOrFail())->create();
    $payment = Payment::factory()->for($order)->verified()->create([
        'amount' => 275000,
    ]);
    $otherPayment = Payment::factory()->for($otherOrder)->verified()->create([
        'amount' => 190000,
    ]);

    $customerUser->notify(new PaymentVerifiedNotification($order, $payment));
    $otherCustomerUser->notify(new PaymentVerifiedNotification($otherOrder, $otherPayment));

    $this->actingAs($customerUser)
        ->get(route('customer.notifications.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Customer/Notifications/Index')
            ->where('unread_notifications_count', 1)
            ->has('notifications.data', 1, fn (Assert $notification) => $notification
                ->where('order_id', $order->id)
                ->where('order_number', $order->order_number)
                ->where('type', 'payment_verified')
                ->etc()
            )
        );
});

test('customer can mark a notification as read', function () {
    $customerUser = User::factory()->customer()->create();
    $order = Order::factory()->for($customerUser->customer()->firstOrFail())->create();
    $payment = Payment::factory()->for($order)->verified()->create([
        'amount' => 240000,
    ]);

    $customerUser->notify(new PaymentVerifiedNotification($order, $payment));

    $notification = $customerUser->notifications()->firstOrFail();

    $this->actingAs($customerUser)
        ->post(route('customer.notifications.read', $notification->id))
        ->assertRedirect();

    expect($notification->refresh()->read_at)->not->toBeNull()
        ->and($customerUser->fresh()->unreadNotifications()->count())->toBe(0);
});

test('customer can mark all notifications as read', function () {
    $customerUser = User::factory()->customer()->create();

    $firstOrder = Order::factory()->for($customerUser->customer()->firstOrFail())->create();
    $secondOrder = Order::factory()->for($customerUser->customer()->firstOrFail())->create();
    $firstPayment = Payment::factory()->for($firstOrder)->verified()->create();
    $secondPayment = Payment::factory()->for($secondOrder)->verified()->create();

    $customerUser->notify(new PaymentVerifiedNotification($firstOrder, $firstPayment));
    $customerUser->notify(new PaymentVerifiedNotification($secondOrder, $secondPayment));

    $this->actingAs($customerUser)
        ->post(route('customer.notifications.read-all'))
        ->assertRedirect();

    expect($customerUser->fresh()->unreadNotifications()->count())->toBe(0)
        ->and($customerUser->notifications()->whereNull('read_at')->count())->toBe(0);
});
