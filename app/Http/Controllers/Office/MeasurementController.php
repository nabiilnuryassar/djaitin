<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Http\Requests\Office\StoreMeasurementRequest;
use App\Http\Requests\Office\UpdateMeasurementRequest;
use App\Models\Customer;
use App\Models\Measurement;
use Illuminate\Http\RedirectResponse;

class MeasurementController extends Controller
{
    public function store(
        StoreMeasurementRequest $request,
        Customer $customer,
    ): RedirectResponse {
        $customer->measurements()->create($request->validated());

        return back()->with('success', 'Ukuran pelanggan berhasil disimpan.');
    }

    public function update(
        UpdateMeasurementRequest $request,
        Customer $customer,
        Measurement $measurement,
    ): RedirectResponse {
        abort_unless($measurement->customer_id === $customer->id, 404);

        $measurement->update($request->validated());

        return back()->with('success', 'Ukuran pelanggan berhasil diperbarui.');
    }
}
