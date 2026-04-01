<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Customer;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class ReportService
{
    /**
     * @return Collection<int, array{date: string, amount: float}>
     */
    public function revenueByPeriod(CarbonInterface $from, CarbonInterface $to): Collection
    {
        $rows = Payment::query()
            ->selectRaw('DATE(COALESCE(verified_at, payment_date)) as report_date')
            ->selectRaw('SUM(amount) as total_amount')
            ->where('status', PaymentStatus::Verified)
            ->whereBetween(DB::raw('DATE(COALESCE(verified_at, payment_date))'), [
                $from->copy()->startOfDay()->toDateString(),
                $to->copy()->endOfDay()->toDateString(),
            ])
            ->groupBy('report_date')
            ->orderBy('report_date')
            ->get();

        return collect(range(0, $from->diffInDays($to)))
            ->map(function (int $offset) use ($from, $rows): array {
                $date = $from->copy()->addDays($offset)->toDateString();
                $amount = (float) ($rows->firstWhere('report_date', $date)?->total_amount ?? 0);

                return [
                    'date' => $date,
                    'amount' => round($amount, 2),
                ];
            });
    }

    /**
     * @return Collection<int, array{method: string, amount: float}>
     */
    public function paymentMethodBreakdown(CarbonInterface $from, CarbonInterface $to): Collection
    {
        return Payment::query()
            ->selectRaw('method, SUM(amount) as total_amount')
            ->where('status', PaymentStatus::Verified)
            ->whereBetween('verified_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
            ->groupBy('method')
            ->orderBy('method')
            ->get()
            ->map(fn (Payment $payment): array => [
                'method' => str($payment->method->value)->replace('_', ' ')->title()->value(),
                'amount' => round((float) $payment->getAttribute('total_amount'), 2),
            ]);
    }

    /**
     * @return Collection<int, array{name: string, order_count: int, revenue: float}>
     */
    public function loyalCustomers(): Collection
    {
        return Customer::query()
            ->withCount(['orders as order_count' => fn ($query) => $query->where('status', '!=', 'draft')])
            ->withSum('orders as revenue_total', 'paid_amount')
            ->orderByDesc('order_count')
            ->orderByDesc('revenue_total')
            ->limit(5)
            ->get()
            ->map(fn (Customer $customer): array => [
                'name' => $customer->name,
                'order_count' => (int) $customer->order_count,
                'revenue' => round((float) $customer->revenue_total, 2),
            ]);
    }

    /**
     * @return EloquentCollection<int, Product>
     */
    public function lowStockProducts(int $threshold = 5): EloquentCollection
    {
        return Product::query()
            ->where('is_active', true)
            ->where('stock', '<=', $threshold)
            ->orderBy('stock')
            ->orderBy('name')
            ->get();
    }

    /**
     * @return array{repeat_customers: int, one_time_customers: int, active_customers: int, rate: float}
     */
    public function repeatOrderRate(CarbonInterface $from, CarbonInterface $to): array
    {
        $customers = Customer::query()
            ->whereHas('orders', function ($query) use ($from, $to): void {
                $query
                    ->where('status', '!=', OrderStatus::Draft->value)
                    ->whereBetween('created_at', [
                        $from->copy()->startOfDay(),
                        $to->copy()->endOfDay(),
                    ]);
            })
            ->withCount([
                'orders as qualified_orders_count' => function ($query) use ($from, $to): void {
                    $query
                        ->where('status', '!=', OrderStatus::Draft->value)
                        ->whereBetween('created_at', [
                            $from->copy()->startOfDay(),
                            $to->copy()->endOfDay(),
                        ]);
                },
            ])
            ->get();

        $activeCustomers = $customers->count();
        $repeatCustomers = $customers
            ->filter(fn (Customer $customer): bool => (int) $customer->qualified_orders_count >= 2)
            ->count();

        return [
            'repeat_customers' => $repeatCustomers,
            'one_time_customers' => max($activeCustomers - $repeatCustomers, 0),
            'active_customers' => $activeCustomers,
            'rate' => $activeCustomers > 0
                ? round(($repeatCustomers / $activeCustomers) * 100, 1)
                : 0,
        ];
    }

    /**
     * @return array{open_orders: int, overdue_orders: int, due_today_orders: int, overdue_rate: float}
     */
    public function overdueMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $openStatuses = [
            OrderStatus::PendingPayment->value,
            OrderStatus::InProgress->value,
            OrderStatus::Done->value,
        ];

        $baseQuery = Order::query()
            ->whereIn('status', $openStatuses)
            ->whereBetween('created_at', [
                $from->copy()->startOfDay(),
                $to->copy()->endOfDay(),
            ]);

        $openOrders = (clone $baseQuery)->count();
        $overdueOrders = (clone $baseQuery)
            ->whereDate('due_date', '<', now()->toDateString())
            ->count();
        $dueTodayOrders = (clone $baseQuery)
            ->whereDate('due_date', now()->toDateString())
            ->count();

        return [
            'open_orders' => $openOrders,
            'overdue_orders' => $overdueOrders,
            'due_today_orders' => $dueTodayOrders,
            'overdue_rate' => $openOrders > 0
                ? round(($overdueOrders / $openOrders) * 100, 1)
                : 0,
        ];
    }

    /**
     * @return array{draft: int, submitted: int, paid: int, closed: int}
     */
    public function funnelMetrics(CarbonInterface $from, CarbonInterface $to): array
    {
        $baseQuery = Order::query()->whereBetween('created_at', [
            $from->copy()->startOfDay(),
            $to->copy()->endOfDay(),
        ]);

        return [
            'draft' => (clone $baseQuery)
                ->where('status', OrderStatus::Draft->value)
                ->count(),
            'submitted' => (clone $baseQuery)
                ->where('status', '!=', OrderStatus::Draft->value)
                ->count(),
            'paid' => (clone $baseQuery)
                ->whereHas('payments', fn ($query) => $query->where('status', PaymentStatus::Verified))
                ->count(),
            'closed' => (clone $baseQuery)
                ->where('status', OrderStatus::Closed->value)
                ->count(),
        ];
    }
}
