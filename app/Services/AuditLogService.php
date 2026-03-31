<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class AuditLogService
{
    /**
     * @param  array<string, mixed>  $oldValues
     * @param  array<string, mixed>  $newValues
     */
    public function log(
        User $user,
        string $action,
        Model $auditable,
        array $oldValues = [],
        array $newValues = [],
        ?string $notes = null,
        ?string $ipAddress = null,
    ): AuditLog {
        return AuditLog::query()->create([
            'user_id' => $user->id,
            'action' => $action,
            'auditable_type' => $auditable->getMorphClass(),
            'auditable_id' => $auditable->getKey(),
            'old_values' => $oldValues === [] ? null : $oldValues,
            'new_values' => $newValues === [] ? null : $newValues,
            'notes' => $notes,
            'ip_address' => $ipAddress,
        ]);
    }
}
