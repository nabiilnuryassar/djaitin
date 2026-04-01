<?php

namespace App\Http\Controllers\Office;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        $userId = trim((string) $request->string('user_id'));
        $action = trim((string) $request->string('action'));
        $module = trim((string) $request->string('module'));
        $from = trim((string) $request->string('from'));
        $to = trim((string) $request->string('to'));

        $auditLogs = AuditLog::query()
            ->with('user:id,name')
            ->when($userId !== '', fn ($query) => $query->where('user_id', $userId))
            ->when($action !== '', fn ($query) => $query->where('action', 'like', "%{$action}%"))
            ->when($module !== '', fn ($query) => $query->where('auditable_type', 'like', "%{$module}%"))
            ->when($from !== '', fn ($query) => $query->whereDate('created_at', '>=', $from))
            ->when($to !== '', fn ($query) => $query->whereDate('created_at', '<=', $to))
            ->orderByDesc('created_at')
            ->paginate(20)
            ->withQueryString()
            ->through(fn (AuditLog $auditLog): array => [
                'id' => $auditLog->id,
                'action' => $auditLog->action,
                'module' => class_basename((string) $auditLog->auditable_type),
                'notes' => $auditLog->notes,
                'user_name' => $auditLog->user?->name,
                'created_at' => optional($auditLog->created_at)?->format('Y-m-d H:i'),
                'old_values' => $auditLog->old_values,
                'new_values' => $auditLog->new_values,
            ]);

        return Inertia::render('Office/AuditLog/Index', [
            'filters' => [
                'user_id' => $userId,
                'action' => $action,
                'module' => $module,
                'from' => $from,
                'to' => $to,
            ],
            'auditLogs' => $auditLogs,
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }
}
