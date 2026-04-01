<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'is_active',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'role' => UserRole::class,
            'is_active' => 'boolean',
        ];
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'created_by');
    }

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function hasRole(UserRole|string $role): bool
    {
        $expectedRole = $role instanceof UserRole ? $role : UserRole::from($role);

        return $this->role === $expectedRole;
    }

    /**
     * @param  array<int, UserRole|string>  $roles
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    public function canAccessApp(): bool
    {
        return $this->is_active && $this->hasAnyRole([
            UserRole::Kasir,
            UserRole::Produksi,
            UserRole::Admin,
            UserRole::Owner,
        ]);
    }

    public function canAccessCms(): bool
    {
        return $this->is_active && $this->hasAnyRole([
            UserRole::Admin,
            UserRole::Owner,
        ]);
    }

    public function canAccessCustomer(): bool
    {
        return $this->is_active && $this->hasRole(UserRole::Customer);
    }

    public function canAccessOffice(): bool
    {
        return $this->is_active && $this->hasAnyRole([
            UserRole::Kasir,
            UserRole::Produksi,
            UserRole::Admin,
            UserRole::Owner,
        ]);
    }
}
