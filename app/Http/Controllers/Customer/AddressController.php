<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreAddressRequest;
use App\Http\Requests\Customer\UpdateAddressRequest;
use App\Models\Address;
use App\Models\Customer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function index(Request $request): RedirectResponse
    {
        $this->authorize('viewAny', Address::class);

        return to_route('customer.profile.edit', ['section' => 'addresses']);
    }

    public function store(StoreAddressRequest $request): RedirectResponse
    {
        $customer = $request->user()?->customer()->firstOrFail();

        DB::transaction(function () use ($request, $customer): void {
            $isDefault = (bool) $request->boolean('is_default') || ! $customer->addresses()->exists();

            if ($isDefault) {
                $customer->addresses()->update(['is_default' => false]);
            }

            $address = $customer->addresses()->create([
                ...$request->validated(),
                'is_default' => $isDefault,
            ]);

            if ($address->is_default) {
                $this->syncCustomerPrimaryAddress($customer->refresh());
            }
        });

        return to_route('customer.profile.edit', ['section' => 'addresses'])
            ->with('success', 'Alamat berhasil ditambahkan.');
    }

    public function update(UpdateAddressRequest $request, Address $address): RedirectResponse
    {
        DB::transaction(function () use ($request, $address): void {
            $customer = $address->customer()->firstOrFail();
            $isDefault = (bool) $request->boolean('is_default') || $address->is_default;

            if ($isDefault) {
                $customer->addresses()
                    ->whereKeyNot($address->id)
                    ->update(['is_default' => false]);
            }

            $address->update([
                ...$request->validated(),
                'is_default' => $isDefault,
            ]);

            $this->syncCustomerPrimaryAddress($customer->refresh());
        });

        return to_route('customer.profile.edit', ['section' => 'addresses'])
            ->with('success', 'Alamat berhasil diperbarui.');
    }

    public function setDefault(Request $request, Address $address): RedirectResponse
    {
        $this->authorize('update', $address);

        DB::transaction(function () use ($address): void {
            $customer = $address->customer()->firstOrFail();

            $customer->addresses()->update(['is_default' => false]);
            $address->update(['is_default' => true]);

            $this->syncCustomerPrimaryAddress($customer->refresh());
        });

        return to_route('customer.profile.edit', ['section' => 'addresses'])
            ->with('success', 'Alamat default berhasil diperbarui.');
    }

    protected function syncCustomerPrimaryAddress(Customer $customer): void
    {
        $defaultAddress = $customer->defaultAddress()->first();

        $customer->update([
            'address' => $defaultAddress === null
                ? null
                : collect([
                    $defaultAddress->address_line,
                    $defaultAddress->city,
                    $defaultAddress->province,
                    $defaultAddress->postal_code,
                ])->filter()->implode(', '),
        ]);
    }
}
