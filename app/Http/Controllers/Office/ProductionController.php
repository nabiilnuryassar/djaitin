<?php

namespace App\Http\Controllers\Office;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\ProductionStage;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\OrderStatusService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductionController extends Controller
{
    public function __construct(
        protected OrderStatusService $orderStatusService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Order::class);

        $status = trim((string) $request->string('status'));
        $orderType = trim((string) $request->string('order_type'));

        $orders = Order::query()
            ->with(['customer:id,name'])
            ->when(
                $status !== '',
                fn ($query) => $query->where('status', $status),
                fn ($query) => $query->whereIn('status', [
                    OrderStatus::InProgress,
                    OrderStatus::Done,
                ]),
            )
            ->when($orderType !== '', fn ($query) => $query->where('order_type', $orderType))
            ->orderByRaw('CASE WHEN due_date < CURRENT_DATE THEN 0 ELSE 1 END')
            ->orderBy('due_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'customer_name' => $order->customer?->name,
                'status' => $order->status->value,
                'order_type' => $order->order_type->value,
                'production_stage' => $order->production_stage?->value,
                'due_date' => optional($order->due_date)?->toDateString(),
                'overdue' => optional($order->due_date)?->isPast() ?? false,
                'outstanding_amount' => (float) $order->outstanding_amount,
                'allowed_statuses' => $request->user() === null ? [] : collect(
                    $this->orderStatusService->allowedTargets($order, $request->user())
                )->map(fn (OrderStatus $item): array => [
                    'value' => $item->value,
                    'label' => str($item->value)->replace('_', ' ')->title()->value(),
                ])->values()->all(),
            ]);

        return Inertia::render('Office/Production/Index', [
            'filters' => [
                'status' => $status,
                'order_type' => $orderType,
            ],
            'orders' => $orders,
            'statuses' => collect([OrderStatus::InProgress, OrderStatus::Done])
                ->map(fn (OrderStatus $item): array => [
                    'value' => $item->value,
                    'label' => str($item->value)->replace('_', ' ')->title()->value(),
                ])->values(),
            'orderTypes' => collect(OrderType::cases())
                ->map(fn (OrderType $item): array => [
                    'value' => $item->value,
                    'label' => str($item->value)->replace('_', ' ')->title()->value(),
                ])->values(),
            'productionStages' => collect(ProductionStage::cases())
                ->map(fn (ProductionStage $item): array => [
                    'value' => $item->value,
                    'label' => str($item->value)->replace('_', ' ')->title()->value(),
                ])->values(),
            'can' => [
                'update_stage' => $request->user()?->can('updateProductionStage', Order::class) ?? false,
                'update_status' => $request->user()?->can('updateStatus', Order::class) ?? false,
            ],
        ]);
    }
}
