<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Shipment;
use App\Models\User;

class ShipmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin, UserRole::Owner]);
    }

    public function view(User $user, Shipment $shipment): bool
    {
        return $this->viewAny($user);
    }

    public function update(User $user, Shipment $shipment): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }
}
