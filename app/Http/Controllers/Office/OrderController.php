<?php

namespace App\Http\Controllers\Office;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\ProductionStage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Office\StoreTailorOrderRequest;
use App\Http\Requests\Office\UpdateOrderStatusRequest;
use App\Http\Requests\Office\UpdateProductionStageRequest;
use App\Models\Customer;
use App\Models\Fabric;
use App\Models\GarmentModel;
use App\Models\Order;
use App\Models\Payment;
use App\Services\LoyaltyService;
use App\Services\OrderStatusService;
use App\Services\TailorOrderService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        protected TailorOrderService $tailorOrderService,
        protected OrderStatusService $orderStatusService,
        protected LoyaltyService $loyaltyService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Order::class);

        $search = trim((string) $request->string('search'));
        $status = trim((string) $request->string('status'));

        $orders = Order::query()
            ->with(['customer:id,name', 'garmentModel:id,name'])
            ->where('order_type', OrderType::Tailor)
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($builder) use ($search): void {
                    $builder
                        ->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn ($customerQuery) => $customerQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status !== '', fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(12)
            ->withQueryString()
            ->through(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name,
                'garment_model_name' => $order->garmentModel?->name,
                'status' => $order->status->value,
                'due_date' => $order->due_date?->toDateString(),
                'total_amount' => (float) $order->total_amount,
                'outstanding_amount' => (float) $order->outstanding_amount,
            ]);

        return Inertia::render('Office/Orders/Index', [
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'orders' => $orders,
            'statuses' => $this->statusOptions(),
            'can' => [
                'create' => $request->user()?->can('create', Order::class) ?? false,
            ],
        ]);
    }

    public function createTailor(): Response
    {
        $this->authorize('create', Order::class);

        $customers = Customer::query()
            ->with(['measurements' => fn ($query) => $query->latest()])
            ->orderBy('name')
            ->get()
            ->map(fn (Customer $customer): array => [
                'id' => $customer->id,
                'name' => $customer->name,
                'phone' => $customer->phone,
                'is_loyalty_eligible' => $customer->is_loyalty_eligible,
                'loyalty_order_count' => $customer->loyalty_order_count,
                'measurements' => $customer->measurements->map(fn ($measurement): array => [
                    'id' => $measurement->id,
                    'label' => $measurement->label ?: 'Ukuran '.$measurement->created_at?->toDateString(),
                ])->values(),
            ])->values();

        return Inertia::render('Office/Orders/TailorWizard', [
            'customers' => $customers,
            'garmentModels' => GarmentModel::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'description']),
            'fabrics' => Fabric::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'description']),
            'discountPolicy' => [
                'percent' => $this->loyaltyService->getDiscountPercent(),
                'threshold' => $this->loyaltyService->getOrderThreshold(),
            ],
        ]);
    }

    public function storeTailor(StoreTailorOrderRequest $request): RedirectResponse
    {
        $order = $this->tailorOrderService->create(
            $request->validated(),
            $request->user(),
            $request->ip(),
        );

        return to_route('office.orders.show', $order)
            ->with('success', 'Order tailor berhasil dibuat.');
    }

    public function show(Request $request, Order $order): Response
    {
        $this->authorize('view', $order);

        $order->load([
            'customer',
            'garmentModel',
            'fabric',
            'measurement',
            'items',
            'payments.createdBy',
            'payments.verifiedBy',
            'shipment.courier',
            'auditLogs.user',
        ]);

        return Inertia::render('Office/Orders/Show', [
            'order' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'order_type' => $order->order_type->value,
                'production_stage' => $order->production_stage?->value,
                'due_date' => $order->due_date?->toDateString(),
                'spec_notes' => $order->spec_notes,
                'subtotal' => (float) $order->subtotal,
                'discount_amount' => (float) $order->discount_amount,
                'total_amount' => (float) $order->total_amount,
                'paid_amount' => (float) $order->paid_amount,
                'outstanding_amount' => (float) $order->outstanding_amount,
                'is_loyalty_applied' => $order->is_loyalty_applied,
                'customer' => [
                    'id' => $order->customer?->id,
                    'name' => $order->customer?->name,
                    'phone' => $order->customer?->phone,
                ],
                'garment_model' => $order->garmentModel?->only(['id', 'name']),
                'fabric' => $order->fabric?->only(['id', 'name']),
                'measurement' => $order->measurement?->only(['id', 'label']),
                'items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'item_name' => $item->item_name,
                    'qty' => $item->qty,
                    'unit_price' => (float) $item->unit_price,
                    'discount_amount' => (float) $item->discount_amount,
                    'subtotal' => (float) $item->subtotal,
                ])->values(),
                'payments' => $order->payments->map(fn ($payment): array => [
                    'id' => $payment->id,
                    'payment_number' => $payment->payment_number,
                    'method' => $payment->method->value,
                    'status' => $payment->status->value,
                    'amount' => (float) $payment->amount,
                    'reference_number' => $payment->reference_number,
                    'rejection_reason' => $payment->rejection_reason,
                    'notes' => $payment->notes,
                    'payment_date' => $payment->payment_date?->format('Y-m-d H:i'),
                    'verified_at' => $payment->verified_at?->format('Y-m-d H:i'),
                    'can_print_receipt' => $payment->status === \App\Enums\PaymentStatus::Verified,
                ])->values(),
                'shipment' => $order->shipment ? [
                    'id' => $order->shipment->id,
                    'status' => $order->shipment->status->value,
                    'tracking_number' => $order->shipment->tracking_number,
                    'courier_name' => $order->shipment->courier?->name,
                    'recipient_name' => $order->shipment->recipient_name,
                ] : null,
                'activity' => $order->auditLogs->sortByDesc('created_at')->values()->map(fn ($audit): array => [
                    'id' => $audit->id,
                    'action' => $audit->action,
                    'notes' => $audit->notes,
                    'user_name' => $audit->user?->name,
                    'created_at' => $audit->created_at?->format('Y-m-d H:i'),
                ]),
            ],
            'statuses' => $this->statusOptions(),
            'productionStages' => collect(ProductionStage::cases())->map(fn (ProductionStage $stage): array => [
                'value' => $stage->value,
                'label' => str($stage->value)->replace('_', ' ')->title()->value(),
            ])->values(),
            'can' => [
                'update_status' => $request->user()?->can('updateStatus', $order) ?? false,
                'update_production_stage' => $request->user()?->can('updateStatus', $order) ?? false,
                'record_payment' => $request->user()?->can('create', Payment::class) ?? false,
                'verify_payment' => $request->user()?->hasAnyRole([
                    \App\Enums\UserRole::Kasir,
                    \App\Enums\UserRole::Admin,
                ]) ?? false,
                'reject_payment' => $request->user()?->hasRole(\App\Enums\UserRole::Admin) ?? false,
                'print_nota' => $order->payments->contains(fn ($payment) => $payment->status === \App\Enums\PaymentStatus::Verified),
            ],
        ]);
    }

    public function updateStatus(
        UpdateOrderStatusRequest $request,
        Order $order,
    ): RedirectResponse {
        $this->orderStatusService->transition(
            $order,
            OrderStatus::from($request->string('status')->value()),
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Status order berhasil diperbarui.');
    }

    public function updateProductionStage(
        UpdateProductionStageRequest $request,
        Order $order,
    ): RedirectResponse {
        $this->orderStatusService->updateProductionStage(
            $order,
            ProductionStage::from($request->string('production_stage')->value()),
            $request->user(),
            $request->ip(),
        );

        return back()->with('success', 'Tahap produksi berhasil diperbarui.');
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    protected function statusOptions(): array
    {
        return collect(OrderStatus::cases())
            ->map(fn (OrderStatus $status): array => [
                'value' => $status->value,
                'label' => str($status->value)->replace('_', ' ')->title()->value(),
            ])
            ->values()
            ->all();
    }
}
