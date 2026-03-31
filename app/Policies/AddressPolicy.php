<?php

namespace App\Policies;

use App\Models\Address;
use App\Models\User;

class AddressPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->canAccessCustomer();
    }

    public function view(User $user, Address $address): bool
    {
        return $user->canAccessCustomer()
            && $address->customer?->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->canAccessCustomer();
    }

    public function update(User $user, Address $address): bool
    {
        return $this->view($user, $address);
    }

    public function delete(User $user, Address $address): bool
    {
        return $this->view($user, $address);
    }
}
