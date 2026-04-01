<?php

namespace App\Policies;

use App\Enums\UserRole;
use App\Models\Product;
use App\Models\User;

class ProductPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole([UserRole::Kasir, UserRole::Admin, UserRole::Owner]);
    }

    public function view(User $user, Product $product): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasRole(UserRole::Admin);
    }

    public function update(User $user, Product $product): bool
    {
        return $user->hasRole(UserRole::Admin);
    }

    public function delete(User $user, Product $product): bool
    {
        return $user->hasRole(UserRole::Admin);
    }
}
