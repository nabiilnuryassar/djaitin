<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Measurement;
use App\Models\User;

class MeasurementPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessOffice() || $user->canAccessCustomer();
    }

    public function view(User $user, Measurement $measurement): bool
    {
        return $user->canAccessOffice()
            || $measurement->customer?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin])
            || $user->canAccessCustomer();
    }

    public function update(User $user, Measurement $measurement): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin])
            || $measurement->customer?->user_id === $user->id;
    }
}
