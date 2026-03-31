<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin])
            || $user->hasRole(UserRole::Customer);
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin])
            || $payment->order?->customer?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }

    public function verify(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }

    public function reject(User $user, Payment $payment): bool
    {
        return $user->hasRole(UserRole::Admin);
    }
}
