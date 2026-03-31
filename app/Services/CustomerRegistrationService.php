<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CustomerRegistrationService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {
    }

    /**
     * @param  array{name: string, email: string, password: string, phone?: string|null}  $payload
     */
    public function register(array $payload, ?string $ipAddress = null): User
    {
        return DB::transaction(function () use ($payload, $ipAddress): User {
            $user = User::query()->create([
                'name' => $payload['name'],
                'email' => $payload['email'],
                'password' => $payload['password'],
                'role' => UserRole::Customer,
                'is_active' => true,
            ]);

            $customer = Customer::query()->create([
                'user_id' => $user->id,
                'name' => $payload['name'],
                'phone' => $payload['phone'] ?? null,
                'address' => null,
                'notes' => 'Customer mendaftar melalui portal publik.',
            ]);

            $this->auditLogService->log(
                user: $user,
                action: 'customer.registered',
                auditable: $customer,
                newValues: [
                    'customer_id' => $customer->id,
                    'user_id' => $user->id,
                ],
                notes: 'Customer baru mendaftar melalui portal publik.',
                ipAddress: $ipAddress,
            );

            return $user->refresh();
        });
    }
}
