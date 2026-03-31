<?php

use App\Enums\UserRole;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

require __DIR__.'/landing.php';

// Phase 0 — normalized
Route::prefix('app')
    ->name('customer.')
    ->group(base_path('routes/customer.php'));

Route::middleware(['auth', 'role:kasir,produksi,admin,owner'])
    ->prefix('office')
    ->name('office.')
    ->group(base_path('routes/office.php'));

Route::middleware(['auth', 'role:admin,owner'])
    ->prefix('cms')
    ->name('cms.')
    ->group(function (): void {
        Route::redirect('dashboard', '/office/dashboard')->name('dashboard');
    });

Route::middleware('auth')
    ->get('/dashboard', function () {
        $user = Auth::user();

        return match ($user?->role) {
            UserRole::Customer => to_route('customer.dashboard'),
            UserRole::Kasir, UserRole::Produksi, UserRole::Admin, UserRole::Owner => to_route('office.dashboard'),
            default => to_route('home'),
        };
    })
    ->name('dashboard');

require __DIR__.'/settings.php';
