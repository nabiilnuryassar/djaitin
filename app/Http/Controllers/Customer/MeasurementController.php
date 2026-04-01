<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreMeasurementRequest;
use App\Http\Requests\Customer\UpdateMeasurementRequest;
use App\Models\Measurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class MeasurementController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Measurement::class);

        return to_route('customer.profile.edit', ['section' => 'measurements']);
    }

    public function store(StoreMeasurementRequest $request): RedirectResponse
    {
        $request->user()->customer()->firstOrFail()->measurements()->create($request->validated());

        return to_route('customer.profile.edit', ['section' => 'measurements'])
            ->with('success', 'Ukuran berhasil disimpan.');
    }

    public function update(UpdateMeasurementRequest $request, Measurement $measurement): RedirectResponse
    {
        $measurement->update($request->validated());

        return to_route('customer.profile.edit', ['section' => 'measurements'])
            ->with('success', 'Ukuran berhasil diperbarui.');
    }
}
