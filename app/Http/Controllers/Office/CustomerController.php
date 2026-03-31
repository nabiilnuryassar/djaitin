<?php

namespace App\Http\Controllers\Office;

use App\Http\Controllers\Controller;
use App\Http\Requests\Office\StoreCustomerRequest;
use App\Http\Requests\Office\UpdateCustomerRequest;
use App\Models\Customer;
use App\Models\Measurement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Customer::class);

        $search = trim((string) $request->string('search'));

        $customers = Customer::query()
            ->withCount('orders')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Customer $customer): array => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'is_loyalty_eligible' => $customer->is_loyalty_eligible,
                'loyalty_order_count' => $customer->loyalty_order_count,
                'orders_count' => $customer->orders_count,
            ]);

        return Inertia::render('Office/Customers/Index', [
            'filters' => ['search' => $search],
            'customers' => $customers,
            'can' => [
                'create' => $request->user()?->can('create', Customer::class) ?? false,
            ],
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Customer::class);

        return Inertia::render('Office/Customers/Create');
    }

    public function store(StoreCustomerRequest $request): RedirectResponse
    {
        $customer = Customer::query()->create($request->validated());

        return to_route('office.customers.show', $customer)
            ->with('success', 'Pelanggan berhasil ditambahkan.');
    }

    public function show(Request $request, Customer $customer): Response
    {
        $this->authorize('view', $customer);

        $customer->load([
            'measurements' => fn ($query) => $query->latest(),
            'orders' => fn ($query) => $query->latest()->limit(10),
        ]);

        return Inertia::render('Office/Customers/Show', [
            'customer' => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'notes' => $customer->notes,
                'is_loyalty_eligible' => $customer->is_loyalty_eligible,
                'loyalty_order_count' => $customer->loyalty_order_count,
                'measurements' => $customer->measurements->map(fn (Measurement $measurement): array => [
                    'id' => $measurement->id,
                    'label' => $measurement->label,
                    'chest' => $measurement->chest,
                    'waist' => $measurement->waist,
                    'hips' => $measurement->hips,
                    'shoulder' => $measurement->shoulder,
                    'sleeve_length' => $measurement->sleeve_length,
                    'shirt_length' => $measurement->shirt_length,
                    'inseam' => $measurement->inseam,
                    'trouser_waist' => $measurement->trouser_waist,
                    'notes' => $measurement->notes,
                    'created_at' => optional($measurement->created_at)?->toDateString(),
                ])->values(),
                'orders' => $customer->orders->map(fn ($order): array => [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'status' => $order->status->value,
                    'total_amount' => (float) $order->total_amount,
                    'created_at' => $order->created_at->toDateString(),
                ])->values(),
            ],
            'can' => [
                'update' => $request->user()?->can('update', $customer) ?? false,
                'manage_measurements' => $request->user()?->can('create', Measurement::class) ?? false,
            ],
        ]);
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): RedirectResponse
    {
        $customer->update($request->validated());

        return back()->with('success', 'Data pelanggan berhasil diperbarui.');
    }
}
