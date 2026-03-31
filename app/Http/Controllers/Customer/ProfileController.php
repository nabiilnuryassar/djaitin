<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\UpdateProfileRequest;
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
