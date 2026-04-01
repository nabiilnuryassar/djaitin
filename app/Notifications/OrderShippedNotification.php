<?php

namespace App\Notifications;

use App\Models\Order;
use App\Models\Shipment;
use Illuminate\Notifications\Notification;

class OrderShippedNotification extends Notification
{
    public function __construct(
        protected Order $order,
        protected Shipment $shipment,
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
            'type' => 'order_shipped',
            'title' => 'Order sedang dikirim',
            'message' => 'Order '.$this->order->order_number.' sudah dikirim'.($this->shipment->tracking_number ? ' dengan resi '.$this->shipment->tracking_number : '').'.',
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'tracking_number' => $this->shipment->tracking_number,
            'courier_name' => $this->shipment->courier?->name,
        ];
    }
}
