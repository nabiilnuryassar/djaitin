<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;

class CustomerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessApp();
    }

    public function view(User $user, Customer $customer): bool
    {
        return $user->canAccessApp();
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin]);
    }
}
