<?php

namespace App\Policies;

use App\Models\Cart;
use App\Models\User;

class CartPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessCustomer();
    }

    public function view(User $user, Cart $cart): bool
    {
        return $user->canAccessCustomer() && $cart->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->canAccessCustomer();
    }

    public function update(User $user, Cart $cart): bool
    {
        return $user->canAccessCustomer() && $cart->user_id === $user->id;
    }

    public function delete(User $user, Cart $cart): bool
    {
        return $user->canAccessCustomer() && $cart->user_id === $user->id;
    }
}
