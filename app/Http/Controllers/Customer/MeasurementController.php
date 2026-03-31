<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreMeasurementRequest;
use App\Http\Requests\Customer\UpdateMeasurementRequest;
use App\Models\Measurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MeasurementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Measurement::class);

        $customer = $request->user()?->customer()->with('measurements')->firstOrFail();

        return Inertia::render('Customer/Measurements/Index', [
            'measurements' => $customer->measurements
                ->sortByDesc('created_at')
                ->values()
                ->map(fn (Measurement $measurement): array => $this->serializeMeasurement($measurement)),
        ]);
    }

    public function store(StoreMeasurementRequest $request): RedirectResponse
    {
        $request->user()->customer()->firstOrFail()->measurements()->create($request->validated());

        return to_route('customer.measurements.index')
            ->with('success', 'Ukuran berhasil disimpan.');
    }

    public function update(UpdateMeasurementRequest $request, Measurement $measurement): RedirectResponse
    {
        $measurement->update($request->validated());

        return to_route('customer.measurements.index')
            ->with('success', 'Ukuran berhasil diperbarui.');
    }

    protected function serializeMeasurement(Measurement $measurement): array
    {
        return [
            'id' => $measurement->id,
            'label' => $measurement->label,
            'chest' => $measurement->chest === null ? null : (float) $measurement->chest,
            'waist' => $measurement->waist === null ? null : (float) $measurement->waist,
            'hips' => $measurement->hips === null ? null : (float) $measurement->hips,
            'shoulder' => $measurement->shoulder === null ? null : (float) $measurement->shoulder,
            'sleeve_length' => $measurement->sleeve_length === null ? null : (float) $measurement->sleeve_length,
            'shirt_length' => $measurement->shirt_length === null ? null : (float) $measurement->shirt_length,
            'inseam' => $measurement->inseam === null ? null : (float) $measurement->inseam,
            'trouser_waist' => $measurement->trouser_waist === null ? null : (float) $measurement->trouser_waist,
            'notes' => $measurement->notes,
        ];
    }
}
