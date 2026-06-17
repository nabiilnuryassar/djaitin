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

    /**
     * Daftar status tujuan yang sah dari status ini (state machine).
     *
     * @return array<int, OrderStatus>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Draft => [self::AwaitingPrice, self::Cancelled],
            self::AwaitingPrice => [self::PendingPayment, self::Cancelled],
            self::PendingPayment => [self::InProgress, self::Cancelled],
            self::InProgress => [self::Done, self::Delivered, self::Pickup, self::Cancelled],
            self::Done => [self::Delivered, self::Pickup, self::Cancelled],
            self::Delivered, self::Pickup => [self::Closed, self::Cancelled],
            self::Closed, self::Cancelled => [],
        };
    }

    public function canTransitionTo(OrderStatus $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return $this->allowedTransitions() === [];
    }
}
