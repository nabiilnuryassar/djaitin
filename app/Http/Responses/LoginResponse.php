<?php

namespace App\Http\Responses;

use App\Enums\UserRole;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        $user = $request->user();

        $target = match ($user?->role) {
            UserRole::Customer => route('customer.dashboard'),
            UserRole::Kasir, UserRole::Produksi, UserRole::Admin, UserRole::Owner => route('office.dashboard'),
            default => route('home'),
        };

        return redirect()->intended($target);
    }
}
