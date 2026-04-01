<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\StoreCourierRequest;
use App\Http\Requests\Office\Admin\UpdateCourierRequest;
use App\Models\Courier;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourierController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        return Inertia::render('Office/Admin/MasterData/Index', [
            'activeTab' => 'couriers',
            'garmentModels' => GarmentModel::query()->orderBy('name')->get(),
            'fabrics' => Fabric::query()->orderBy('name')->get(),
            'couriers' => Courier::query()->orderBy('name')->get(),
            'can' => [
                'manage' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StoreCourierRequest $request): RedirectResponse
    {
        $courier = Courier::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'courier.created',
            auditable: $courier,
            newValues: $courier->only(['name', 'is_active']),
            notes: 'Master kurir ditambahkan.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Kurir berhasil ditambahkan.');
    }

    public function update(UpdateCourierRequest $request, Courier $courier): RedirectResponse
    {
        $oldValues = $courier->only(['name', 'is_active']);
        $courier->update($request->validated());

        $this->auditLogService->log(
            user: $request->user(),
            action: 'courier.updated',
            auditable: $courier,
            oldValues: $oldValues,
            newValues: $courier->only(['name', 'is_active']),
            notes: 'Master kurir diperbarui.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Kurir berhasil diperbarui.');
    }

    public function destroy(Courier $courier, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(UserRole::Admin), 403);

        $courier->update(['is_active' => false]);

        return back()->with('success', 'Kurir berhasil dinonaktifkan.');
    }
}
