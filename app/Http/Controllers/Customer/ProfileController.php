<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateProfileRequest;
use App\Models\Address;
use App\Models\Measurement;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(Request $request): Response
    {
        $customer = $request->user()?->customer()->firstOrFail();

        return Inertia::render('Customer/Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'customer' => [
                'name' => $customer->name,
                'phone' => $customer->phone,
            ],
            'addresses' => $customer->addresses()
                ->orderByDesc('is_default')
                ->latest('updated_at')
                ->get()
                ->map(fn (Address $address): array => [
                    'id' => $address->id,
                    'label' => $address->label,
                    'recipient_name' => $address->recipient_name,
                    'phone' => $address->phone,
                    'address_line' => $address->address_line,
                    'city' => $address->city,
                    'province' => $address->province,
                    'postal_code' => $address->postal_code,
                    'is_default' => $address->is_default,
                ])
                ->values(),
            'measurements' => $customer->measurements()
                ->latest('created_at')
                ->get()
                ->map(fn (Measurement $measurement): array => [
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
                ])
                ->values(),
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $customer = $user?->customer()->firstOrFail();

        $user?->fill($request->safe()->only(['name', 'email']));

        if ($user?->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user?->save();

        $customer->update([
            'name' => $request->string('name')->value(),
            'phone' => $request->string('phone')->value() ?: null,
        ]);

        return to_route('customer.profile.edit')
            ->with('success', 'Profil berhasil diperbarui.');
    }
}
