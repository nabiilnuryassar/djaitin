<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        return redirect()->intended(route('customer.dashboard'))
            ->with('success', 'Akun Anda berhasil dibuat! Selamat datang di Djaitin.');
    }
}
