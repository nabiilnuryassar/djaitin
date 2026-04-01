<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;

class UserService
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    /**
     * @param  array<string, mixed>  $payload
     */
    public function create(array $payload, User $actor, ?string $ipAddress = null): User
    {
        return DB::transaction(function () use ($payload, $actor, $ipAddress): User {
            $user = User::query()->create($payload);

            $this->auditLogService->log(
                user: $actor,
                action: 'user.created',
                auditable: $user,
                newValues: $user->only(['name', 'email', 'role', 'is_active']),
                notes: 'User staff baru dibuat.',
                ipAddress: $ipAddress,
            );

            return $user->refresh();
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function update(User $user, array $payload, User $actor, ?string $ipAddress = null): User
    {
        return DB::transaction(function () use ($user, $payload, $actor, $ipAddress): User {
            $oldValues = $user->only(['name', 'email', 'role', 'is_active']);

            $user->fill($payload);
            $user->save();

            $this->auditLogService->log(
                user: $actor,
                action: 'user.updated',
                auditable: $user,
                oldValues: $oldValues,
                newValues: $user->only(['name', 'email', 'role', 'is_active']),
                notes: 'Data user diperbarui.',
                ipAddress: $ipAddress,
            );

            return $user->refresh();
        });
    }

    public function toggleActive(User $user, User $actor, ?bool $active = null, ?string $ipAddress = null): User
    {
        return DB::transaction(function () use ($user, $actor, $active, $ipAddress): User {
            $nextStatus = $active ?? ! $user->is_active;

            $user->update(['is_active' => $nextStatus]);

            $this->auditLogService->log(
                user: $actor,
                action: $nextStatus ? 'user.activated' : 'user.deactivated',
                auditable: $user,
                oldValues: ['is_active' => ! $nextStatus],
                newValues: ['is_active' => $nextStatus],
                notes: $nextStatus ? 'User diaktifkan kembali.' : 'User dinonaktifkan.',
                ipAddress: $ipAddress,
            );

            return $user->refresh();
        });
    }
}
