<?php

namespace App\Http\Controllers\Office\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\Admin\StoreGarmentModelRequest;
use App\Http\Requests\Office\Admin\UpdateGarmentModelRequest;
use App\Models\Courier;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GarmentModelController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
    ) {}

    public function index(Request $request): Response
    {
        abort_unless($request->user()?->hasAnyRole([UserRole::Admin, UserRole::Owner]), 403);

        return Inertia::render('Office/Admin/MasterData/Index', [
            'activeTab' => 'garment-models',
            'garmentModels' => GarmentModel::query()->orderBy('name')->get(),
            'fabrics' => Fabric::query()->orderBy('name')->get(),
            'couriers' => Courier::query()->orderBy('name')->get(),
            'can' => [
                'manage' => $request->user()?->hasRole(UserRole::Admin) ?? false,
            ],
        ]);
    }

    public function store(StoreGarmentModelRequest $request): RedirectResponse
    {
        $model = GarmentModel::query()->create([
            ...$request->validated(),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $this->auditLogService->log(
            user: $request->user(),
            action: 'garment_model.created',
            auditable: $model,
            newValues: $model->only(['name', 'base_price', 'is_active']),
            notes: 'Master model pakaian ditambahkan.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Model pakaian berhasil ditambahkan.');
    }

    public function update(UpdateGarmentModelRequest $request, GarmentModel $garmentModel): RedirectResponse
    {
        $oldValues = $garmentModel->only(['name', 'base_price', 'is_active']);
        $garmentModel->update($request->validated());

        $this->auditLogService->log(
            user: $request->user(),
            action: 'garment_model.updated',
            auditable: $garmentModel,
            oldValues: $oldValues,
            newValues: $garmentModel->only(['name', 'base_price', 'is_active']),
            notes: 'Master model pakaian diperbarui.',
            ipAddress: $request->ip(),
        );

        return back()->with('success', 'Model pakaian berhasil diperbarui.');
    }

    public function destroy(GarmentModel $garmentModel, Request $request): RedirectResponse
    {
        abort_unless($request->user()?->hasRole(UserRole::Admin), 403);

        $garmentModel->update(['is_active' => false]);

        return back()->with('success', 'Model pakaian berhasil dinonaktifkan.');
    }
}
