<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case AwaitingPrice = 'awaiting_price';
    case PendingPayment = 'pending_payment';
    case InProgress = 'in_progress';
    case Done = 'done';
    case Delivered = 'delivered';
    case Pickup = 'pickup';
    case Closed = 'closed';
    case Cancelled = 'cancelled';
}
