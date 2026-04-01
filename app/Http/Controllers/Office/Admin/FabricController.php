<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\StoreFabricRequest;
use App\Http\Requests\Office\Admin\UpdateFabricRequest;
use App\Models\Courier;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FabricController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        return Inertia::render('Office/Admin/MasterData/Index', [
            'activeTab' => 'fabrics',
            'garmentModels' => GarmentModel::query()->orderBy('name')->get(),
            'fabrics' => Fabric::query()->orderBy('name')->get(),
            'couriers' => Courier::query()->orderBy('name')->get(),
            'can' => [
                'manage' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StoreFabricRequest $request): RedirectResponse
    {
        $fabric = Fabric::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'fabric.created',
            auditable: $fabric,
            newValues: $fabric->only(['name', 'price_adjustment', 'is_active']),
            notes: 'Master bahan ditambahkan.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Bahan berhasil ditambahkan.');
    }

    public function update(UpdateFabricRequest $request, Fabric $fabric): RedirectResponse
    {
        $oldValues = $fabric->only(['name', 'price_adjustment', 'is_active']);
        $fabric->update($request->validated());

        $this->auditLogService->log(
            user: $request->user(),
            action: 'fabric.updated',
            auditable: $fabric,
            oldValues: $oldValues,
            newValues: $fabric->only(['name', 'price_adjustment', 'is_active']),
            notes: 'Master bahan diperbarui.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Bahan berhasil diperbarui.');
    }

    public function destroy(Fabric $fabric, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(UserRole::Admin), 403);

        $fabric->update(['is_active' => false]);

        return back()->with('success', 'Bahan berhasil dinonaktifkan.');
    }
}
