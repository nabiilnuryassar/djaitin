<?php

use App\Models\AuditLog;
use App\Models\Order;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('admin can access paginated audit log viewer', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();

    AuditLog::query()->forceCreate([
        'user_id' => $admin->id,
        'action' => 'order.updated',
        'auditable_type' => $order::class,
        'auditable_id' => $order->id,
        'old_values' => ['status' => 'pending_payment'],
        'new_values' => ['status' => 'in_progress'],
        'notes' => 'Status order diperbarui.',
        'ip_address' => '127.0.0.1',
        'created_at' => now(),
    ]);

    $this->actingAs($admin)
        ->get(route('office.audit-log.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Office/AuditLog/Index')
            ->has('auditLogs.data', 1)
            ->has('auditLogs.links')
            ->where('auditLogs.current_page', 1)
            ->where('auditLogs.data.0.action', 'order.updated'),
        );
});

test('kasir cannot access audit log viewer', function () {
    $kasir = User::factory()->kasir()->create();

    $this->actingAs($kasir)
        ->get(route('office.audit-log.index'))
        ->assertForbidden();
});
