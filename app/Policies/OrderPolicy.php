<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessOffice() || $user->canAccessCustomer();
    }

    public function view(User $user, Order $order): bool
    {
        return $user->canAccessOffice()
            || $order->customer?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin])
            || $user->hasRole(UserRole::Customer);
    }

    public function update(User $user, Order $order): bool
    {
        return $user->hasAnyRole([
            UserRole::Kasir,
            UserRole::Produksi,
            UserRole::Admin,
        ]);
    }

    public function updateStatus(User $user, Order $order): bool
    {
        return $user->hasAnyRole([
            UserRole::Kasir,
            UserRole::Produksi,
            UserRole::Admin,
        ]);
    }
}
