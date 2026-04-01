<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Notifications\Notification;

class PaymentVerifiedNotification extends Notification
{
    public function __construct(
        protected Order $order,
        protected Payment $payment,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'payment_verified',
            'title' => 'Pembayaran berhasil diverifikasi',
            'message' => 'Pembayaran untuk order '.$this->order->order_number.' telah diverifikasi.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'payment_amount' => (float) $this->payment->amount,
            'new_status' => $this->order->status->value,
        ];
    }
}
